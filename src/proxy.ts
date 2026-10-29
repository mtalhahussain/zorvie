import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, SESSION_MAX_AGE, isValidSessionId } from '@/lib/session'

/**
 * Anonymous per-browser sessions. Every visitor gets an httpOnly `cv_sid`
 * cookie (a random UUID) on their first request; designs are owned by it, so
 * one browser never sees another browser's work. The cookie is also injected
 * into the *current* request so API routes see it on the very first call.
 */
export function proxy(req: NextRequest) {
  if (isValidSessionId(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next()

  const sid = crypto.randomUUID()
  req.cookies.set(SESSION_COOKIE, sid)
  const res = NextResponse.next({ request: { headers: req.headers } })
  res.cookies.set(SESSION_COOKIE, sid, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.nextUrl.protocol === 'https:',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return res
}

export const config = {
  // pages + app API; skip static assets and the token-authenticated MCP endpoint
  matcher: ['/((?!_next/static|_next/image|favicon|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|woff2?)$|api/mcp).*)'],
}
