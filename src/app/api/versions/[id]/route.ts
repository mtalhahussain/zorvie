import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorizeDesign } from '@/lib/design-access'

// DELETE /api/versions/[id] — remove one saved version snapshot
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const version = await db.designVersion.findUnique({ where: { id }, select: { designId: true } })
    if (!version) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const auth = await authorizeDesign(req, version.designId, 'edit')
    if (auth.error) return auth.error
    await db.designVersion.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/versions/[id] failed', error)
    return NextResponse.json({ error: 'Failed to delete version' }, { status: 500 })
  }
}
