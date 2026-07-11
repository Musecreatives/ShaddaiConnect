import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';

export interface AdminUserDto {
  id: number;
  email: string;
  name: string | null;
  active: boolean;
  createdAt: Date;
}

const SALT_ROUNDS = 10;

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<AdminUserDto[]> {
    const admins = await this.prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } });
    return admins.map(toDto);
  }

  async create(dto: CreateAdminDto): Promise<AdminUserDto> {
    const existing = await this.prisma.adminUser.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException(`An admin with email ${dto.email} already exists`);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const admin = await this.prisma.adminUser.create({
      data: { email: dto.email, passwordHash, name: dto.name },
    });
    return toDto(admin);
  }

  async setActive(id: number, active: boolean): Promise<AdminUserDto> {
    const existing = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Admin ${id} not found`);

    const admin = await this.prisma.adminUser.update({ where: { id }, data: { active } });
    return toDto(admin);
  }
}

function toDto(admin: { id: number; email: string; name: string | null; active: boolean; createdAt: Date }): AdminUserDto {
  // Deliberately excludes passwordHash — never returned by the API, even to other admins.
  return { id: admin.id, email: admin.email, name: admin.name, active: admin.active, createdAt: admin.createdAt };
}
