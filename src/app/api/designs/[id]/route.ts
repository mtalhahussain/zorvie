import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { authorizeDesign, DESIGN_ACCESS, type DesignAccess } from '@/lib/design-access'

// Normalise incoming pages payload (accepts object or legacy JSON string)
// into a value suitable for the Postgres jsonb column.
function toPages(value: unknown): Prisma.InputJsonValue {
  if (typeof value === 'string') {
    try { return JSON.parse(value) as Prisma.InputJsonValue } catch { return [] }
  }
  return (value ?? []) as Prisma.InputJsonValue
}

// GET /api/designs/[id] — full design incl. pages
// (owner, or anyone with the link when the design is shared)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await authorizeDesign(req, id, 'edit')
    if (auth.error) return auth.error
    const design = await db.design.findUnique({ where: { id } })
    if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // never hand the owner's session id to collaborators
    const { ownerId: _ownerId, ...rest } = design
    return NextResponse.json({ ...rest, pages: design.pages ?? [], isOwner: auth.grant.isOwner })
  } catch (error) {
    console.error('GET /api/designs/[id] failed', error)
    return NextResponse.json({ error: 'Failed to get design' }, { status: 500 })
  }
}

// PUT /api/designs/[id] — save design (name / size / pages / thumbnail)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const auth = await authorizeDesign(req, id, body.access !== undefined ? 'own' : 'edit')
    if (auth.error) return auth.error
    const data: Record<string, unknown> = {}
    // share setting — owner only (checked above)
    if (DESIGN_ACCESS.includes(body.access as DesignAccess)) data.access = body.access
    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim().slice(0, 120)
    if (body.pages !== undefined) data.pages = toPages(body.pages)
    // canvas size (Magic Resize in place / restoring a differently-sized version)
    for (const key of ['width', 'height'] as const) {
      const v = body[key]
      if (typeof v === 'number' && Number.isFinite(v) && v >= 1 && v <= 8000) data[key] = Math.round(v)
    }
    if (body.thumbnail !== undefined) data.thumbnail = typeof body.thumbnail === 'string' ? body.thumbnail : null
    const design = await db.design.update({ where: { id }, data })
    return NextResponse.json({
      id: design.id,
      name: design.name,
      access: design.access,
      updatedAt: design.updatedAt,
    })
  } catch (error) {
    console.error('PUT /api/designs/[id] failed', error)
    return NextResponse.json({ error: 'Failed to save design' }, { status: 500 })
  }
}

// DELETE /api/designs/[id] — move to Trash (soft delete).
// ?permanent=1 → delete permanently (also removes version snapshots).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await authorizeDesign(req, id, 'own')
    if (auth.error) return auth.error
    if (req.nextUrl.searchParams.get('permanent') === '1') {
      await db.design.delete({ where: { id } })
      return NextResponse.json({ ok: true, permanent: true })
    }
    await db.design.update({ where: { id }, data: { deletedAt: new Date() } })
    return NextResponse.json({ ok: true, trashed: true })
  } catch (error) {
    console.error('DELETE /api/designs/[id] failed', error)
    return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 })
  }
}
