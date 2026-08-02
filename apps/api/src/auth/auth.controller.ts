import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
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

  /** Stricter than the app-wide default (100/min) — this is the one endpoint where an
   * attacker gets direct feedback on password guesses, so brute-forcing it is the actual
   * threat rate limiting exists to stop. */
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto.email, dto.password);
    res.cookie(ADMIN_JWT_COOKIE, result.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.cookieSecure(),
      domain: this.cookieDomain(),
      maxAge: ADMIN_JWT_MAX_AGE_MS,
    });
    // access_token is also returned in the body for curl/script use (see scripts/test-webhook.js
    // style tooling); the browser admin console relies on the cookie, not this field.
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // clearCookie must be called with the same domain/path the cookie was set with, or the
    // browser won't recognize it as the same cookie and won't actually remove it.
    res.clearCookie(ADMIN_JWT_COOKIE, { domain: this.cookieDomain() });
    return { loggedOut: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: AdminJwtPayload }) {
    return { email: req.user.email };
  }

  /** Whether we're actually reachable over HTTPS right now — NOT the same question as "is this
   * a production deployment". A `Secure` cookie is silently dropped by the browser on a plain-HTTP
   * origin, which broke login on the real server before it had TLS in front of it (see
   * .docs/DECISIONS.md). `COOKIE_SECURE` lets this be set independently of `NODE_ENV`; falls back
   * to the NODE_ENV heuristic only if unset. */
  private cookieSecure(): boolean {
    const explicit = this.config.get<string>('COOKIE_SECURE');
    if (explicit !== undefined) return explicit === 'true';
    return this.config.get('NODE_ENV') === 'production';
  }

  /** Without this, the cookie defaults to being scoped to the exact host that set it
   * (api.shaddaicommunications.com) and the browser will never attach it to requests made to
   * admin.shaddaicommunications.com's own server — breaking proxy.ts's server-side cookie check
   * even though client-side fetches to the api still work fine (same-origin there). Undefined in
   * local dev, where api/admin share a hostname (127.0.0.1, different ports only) and don't need
   * this — a `Domain` attribute on "localhost"/"127.0.0.1" isn't meaningful anyway. */
  private cookieDomain(): string | undefined {
    return this.config.get<string>('COOKIE_DOMAIN') || undefined;
  }
}
