import { Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  }

  record(input: { filename: string; path: string; mimeType: string; size: number }) {
    return this.prisma.mediaAsset.create({ data: input });
  }

  async delete(id: number) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');
    await this.prisma.mediaAsset.delete({ where: { id } });
    // Best-effort: the DB row is the source of truth for the library listing, so a failed
    // unlink (already gone, permissions) shouldn't block the delete from succeeding.
    const diskPath = join(__dirname, '..', '..', 'uploads', asset.filename);
    await unlink(diskPath).catch(() => undefined);
    return { deleted: true as const };
  }
}
