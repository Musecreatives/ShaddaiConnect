import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface AdminJwtPayload {
  sub: 'admin';
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const adminEmail = this.config.getOrThrow<string>('ADMIN_EMAIL');
    const adminPassword = this.config.getOrThrow<string>('ADMIN_PASSWORD');

    if (email !== adminEmail || password !== adminPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: AdminJwtPayload = { sub: 'admin', email: adminEmail };
    return { access_token: await this.jwt.signAsync(payload) };
  }
}
