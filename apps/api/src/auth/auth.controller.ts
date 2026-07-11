import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { ADMIN_JWT_COOKIE, ADMIN_JWT_MAX_AGE_MS } from './auth.constants';
import { AuthService, type AdminJwtPayload } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto.email, dto.password);
    res.cookie(ADMIN_JWT_COOKIE, result.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('NODE_ENV') === 'production',
      maxAge: ADMIN_JWT_MAX_AGE_MS,
    });
    // access_token is also returned in the body for curl/script use (see scripts/test-webhook.js
    // style tooling); the browser admin console relies on the cookie, not this field.
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ADMIN_JWT_COOKIE);
    return { loggedOut: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: AdminJwtPayload }) {
    return { email: req.user.email };
  }
}
