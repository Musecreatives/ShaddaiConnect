import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

export interface AdminJwtPayload {
  sub: 'admin';
  email: string;
  /** Present for DB-backed admins, absent for the env-configured root login. */
  adminId?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Two ways in: the env-configured "root" admin (always works, can't be locked out even if
   * admin_users is empty/misconfigured), or a matching active row in admin_users. See
   * docs/DECISIONS.md and prisma/manual-migrations/001_admin_users.sql for why it's designed
   * this way.
   */
  async login(email: string, password: string): Promise<{ access_token: string }> {
    const rootEmail = this.config.getOrThrow<string>('ADMIN_EMAIL');
    const rootPassword = this.config.getOrThrow<string>('ADMIN_PASSWORD');

    if (email === rootEmail && password === rootPassword) {
      const payload: AdminJwtPayload = { sub: 'admin', email: rootEmail };
      return { access_token: await this.jwt.signAsync(payload) };
    }

    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (admin?.active && (await bcrypt.compare(password, admin.passwordHash))) {
      const payload: AdminJwtPayload = { sub: 'admin', email: admin.email, adminId: admin.id };
      return { access_token: await this.jwt.signAsync(payload) };
    }

    throw new UnauthorizedException('Invalid email or password');
  }
}
