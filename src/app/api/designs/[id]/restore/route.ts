import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorizeDesign } from '@/lib/design-access'

// POST /api/designs/[id]/restore — restore a design from the Trash
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await authorizeDesign(req, id, 'own')
    if (auth.error) return auth.error
    const design = await db.design.update({
      where: { id },
      data: { deletedAt: null },
    })
    return NextResponse.json({ ok: true, id: design.id })
  } catch (error) {
    console.error('POST /api/designs/[id]/restore failed', error)
    return NextResponse.json({ error: 'Failed to restore design' }, { status: 500 })
  }
}
