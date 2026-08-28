import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { CoaService } from '../coa/coa.service';
import { NtfyService } from '../ntfy/ntfy.service';
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

    let disconnectedCount = 0;
    for (const voucher of vouchersToDisable) {
      await this.vouchers.disable(voucher.id);
      // Best-effort — disabling radcheck already stops the *next* reconnect regardless of
      // whether this succeeds; a live kick is a bonus, not a requirement for blocking to work.
      const result = await this.coa.disconnectVoucher(voucher.code);
      if (result.success) disconnectedCount++;
      if (result.attempted) {
        this.logger.log(`Disconnect attempt for ${voucher.code}: ${result.message}`);
      }
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
    await this.audit.record({
      adminEmail,
      adminId,
      action: 'unblock_mac',
      targetType: 'mac',
      targetId: existing.macAddress,
    });
    return { unblocked: true };
  }
}
