import type { NextRequest } from 'next/server'

/** httpOnly cookie holding the anonymous browser session (set by src/proxy.ts). */
export const SESSION_COOKIE = 'cv_sid'
/** one year — the session *is* the user's identity until accounts exist */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidSessionId(v: string | undefined | null): v is string {
  return typeof v === 'string' && UUID.test(v)
}

/** The caller's session id, or null when the cookie is missing / malformed. */
export function getSessionId(req: NextRequest): string | null {
  const v = req.cookies.get(SESSION_COOKIE)?.value
  return isValidSessionId(v) ? v : null
}
