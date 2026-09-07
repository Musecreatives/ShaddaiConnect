import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { CoaService } from '../coa/coa.service';
import { NtfyService } from '../ntfy/ntfy.service';
import { PfsenseService } from '../pfsense/pfsense.service';
import { PrismaService } from '../prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';

@Injectable()
export class BlockedMacsService {
  private readonly logger = new Logger(BlockedMacsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchers: VouchersService,
    private readonly ntfy: NtfyService,
    private readonly coa: CoaService,
    private readonly audit: AuditService,
    private readonly pfsense: PfsenseService,
  ) {}

  findAll() {
    return this.prisma.blockedMac.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /**
   * Blocks a MAC going forward (checked by VoucherActivationService on every future voucher
   * activation, any plan) AND retroactively disables every voucher this device has already
   * used that isn't already disabled/expired — same radcheck-removal path as a manual admin
   * disable, so it stops the next reconnect attempt without touching a session already open.
   */
  async block(
    macAddress: string,
    reason: string | undefined,
    adminId: number | undefined,
    adminEmail: string,
  ) {
    const normalized = macAddress.trim().toLowerCase();
    const existing = await this.prisma.blockedMac.findUnique({ where: { macAddress: normalized } });
    if (existing) {
      throw new ConflictException(`${normalized} is already blocked.`);
    }

    const blocked = await this.prisma.blockedMac.create({
      data: { macAddress: normalized, reason, blockedByAdminId: adminId },
    });

    const affectedCodes = await this.prisma.radAcct.findMany({
      where: { callingStationId: normalized },
      distinct: ['username'],
      select: { username: true },
    });
    const codes = affectedCodes.map((c) => c.username);
    const vouchersToDisable = await this.prisma.voucher.findMany({
      where: { code: { in: codes }, status: { in: ['unused', 'active'] } },
    });

    // The portal-level block is the part that actually stops this device: disabling vouchers
    // only stops the codes it already has, so the same device could just claim a new one (the
    // exact free-trial abuse pattern seen 2026-08-30). A pfSense captive-portal block stops it
    // regardless of which code it obtains, and cuts its current session in the same call.
    const portalBlock = await this.pfsense.blockMac(normalized);
    if (!portalBlock.ok) {
      this.logger.warn(`Portal-level block for ${normalized} failed: ${portalBlock.message}`);
    }
    let disconnectedCount = portalBlock.data?.sessions_killed ?? 0;

    for (const voucher of vouchersToDisable) {
      await this.vouchers.disable(voucher.id);
      // Belt-and-braces: the portal block above already cut this device off, but a voucher can
      // have been used from more than one device, so kick anything else still on this code.
      const result = await this.pfsense.disconnect(voucher.code);
      if (result.ok && result.data) disconnectedCount += result.data.disconnected;
    }

    if (vouchersToDisable.length > 0) {
      this.logger.warn(
        `Blocked ${normalized} — disabled ${vouchersToDisable.length} existing voucher(s): ${vouchersToDisable.map((v) => v.code).join(', ')}`,
      );
    }

    this.ntfy.publish({
      title: 'Device blocked',
      message: `${normalized} blocked${reason ? ` (${reason})` : ''} — ${vouchersToDisable.length} voucher(s) disabled, ${disconnectedCount} live session(s) kicked`,
      tags: ['no_entry_sign'],
    });

    await this.audit.record({
      adminEmail,
      adminId,
      action: 'block_mac',
      targetType: 'mac',
      targetId: normalized,
      detail: reason,
    });

    return { ...blocked, disabledVoucherCount: vouchersToDisable.length, disconnectedCount };
  }

  async unblock(id: number, adminEmail: string, adminId: number | undefined) {
    const existing = await this.prisma.blockedMac.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Blocked MAC ${id} not found`);
    await this.prisma.blockedMac.delete({ where: { id } });
    // Must mirror block()'s portal entry — without this the device stays blocked at pfSense
    // forever even though the admin UI shows it as unblocked.
    const portal = await this.pfsense.unblockMac(existing.macAddress);
    if (!portal.ok) {
      this.logger.warn(
        `Removed ${existing.macAddress} from the blocklist, but the pfSense portal block could not be lifted: ${portal.message}`,
      );
    }
    await this.audit.record({
      adminEmail,
      adminId,
      action: 'unblock_mac',
      targetType: 'mac',
      targetId: existing.macAddress,
      detail: portal.ok ? 'portal block lifted' : `portal block NOT lifted: ${portal.message}`,
    });
    return { unblocked: true, portalBlockLifted: portal.ok };
  }
}
