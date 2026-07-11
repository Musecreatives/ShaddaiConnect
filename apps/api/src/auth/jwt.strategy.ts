import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AdminJwtPayload } from './auth.service';
import { ADMIN_JWT_COOKIE } from './auth.constants';

/** Cookie first (browser admin console), Bearer header as a fallback (curl/scripts/CI). */
function cookieExtractor(req: Request): string | null {
  return (req?.cookies?.[ADMIN_JWT_COOKIE] as string | undefined) ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: AdminJwtPayload): AdminJwtPayload {
    return payload;
  }
}
