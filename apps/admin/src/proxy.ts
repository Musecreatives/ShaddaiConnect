import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` (this app was scaffolded on 16.2.10 — see
 * apps/admin/AGENTS.md). This is only a coarse, fast redirect for the common "definitely not
 * logged in" case (no cookie at all) — it does NOT verify the JWT's signature/expiry, since
 * that would mean duplicating JWT_SECRET into this app. Real enforcement happens in
 * lib/auth.ts's requireAdmin(), called at the top of the (protected) layout, which asks the
 * API to actually validate the session.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has('admin_jwt');
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!hasSessionCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (hasSessionCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|icon.png|manifest.json|sw.js).*)'],
};
