import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionId } from '@/lib/session'

export type DesignAccess = 'private' | 'link' | 'public'
export const DESIGN_ACCESS: readonly DesignAccess[] = ['private', 'link', 'public']

/**
 * What a session may do with a design:
 *   own  — the owner: everything (rename, share settings, trash, delete)
 *   edit — anyone with the link when access is link/public: open, edit, comment, collaborate
 * A private design is invisible to everyone but its owner (404, not 403 —
 * never confirm that someone else's design exists).
 */
export type Need = 'edit' | 'own'

export interface DesignGrant {
  id: string
  ownerId: string | null
  access: string
  sessionId: string
  isOwner: boolean
}

export function canAccess(
  design: { ownerId: string | null; access: string },
  sessionId: string | null,
  need: Need
): boolean {
  if (!sessionId) return false
  if (design.ownerId === sessionId) return true
  return need === 'edit' && (design.access === 'link' || design.access === 'public')
}

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 })

/**
 * Authorize the caller against a design. Legacy designs (created before
 * sessions, ownerId = null) are claimed by the first session that opens them.
 */
export async function authorizeDesign(
  req: NextRequest,
  designId: string,
  need: Need
): Promise<{ grant: DesignGrant; error?: never } | { grant?: never; error: NextResponse }> {
  const sessionId = getSessionId(req)
  if (!sessionId) return { error: NextResponse.json({ error: 'No session — enable cookies and reload.' }, { status: 401 }) }
  const design = await db.design.findUnique({ where: { id: designId }, select: { id: true, ownerId: true, access: true } })
  if (!design) return { error: notFound() }

  let ownerId = design.ownerId
  if (ownerId === null) {
    // updateMany + ownerId:null guard → only one session can win the claim
    const claimed = await db.design.updateMany({ where: { id: designId, ownerId: null }, data: { ownerId: sessionId } })
    if (claimed.count) ownerId = sessionId
    else ownerId = (await db.design.findUnique({ where: { id: designId }, select: { ownerId: true } }))?.ownerId ?? null
  }

  const resolved = { ownerId, access: design.access }
  if (!canAccess(resolved, sessionId, need)) return { error: notFound() }
  return { grant: { id: design.id, ownerId, access: design.access, sessionId, isOwner: ownerId === sessionId } }
}
