import { NextRequest, NextResponse } from 'next/server'
import { withProvider, IMAGE_MODEL } from '@/lib/ai/provider'

export const runtime = 'nodejs'
export const maxDuration = 60

const SUPPORTED_SIZES = ['1024x1024', '1344x768', '768x1344', '1152x864', '864x1152', '1440x720', '720x1440'] as const
type ImgSize = (typeof SUPPORTED_SIZES)[number]

interface ImageBody {
  prompt?: string
  size?: string
}

/** POST /api/ai/image — AI image generation for the canvas. Returns a PNG dataURL. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as ImageBody
  const prompt = (body.prompt ?? '').trim().slice(0, 600)
  const size = (SUPPORTED_SIZES as readonly string[]).includes(body.size ?? '')
    ? (body.size as ImgSize)
    : '1024x1024'

  if (!prompt) {
    return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 })
  }

  return withProvider('image', req, { limit: 12, windowSec: 60 }, async (zai) => {
    const response = await zai.images.generations.create({
      model: IMAGE_MODEL,
      prompt,
      size,
    })

    // Z.ai's public API returns a temporary URL; other providers inline base64
    const item = response.data[0] as { base64?: string; url?: string } | undefined
    let dataUrl = item?.base64 ? `data:image/png;base64,${item.base64}` : null
    if (!dataUrl && item?.url) {
      const img = await fetch(item.url)
      if (img.ok) {
        const type = img.headers.get('content-type') || 'image/png'
        dataUrl = `data:${type};base64,${Buffer.from(await img.arrayBuffer()).toString('base64')}`
      }
    }
    if (!dataUrl) {
      return NextResponse.json({ error: 'The image service returned no image. Try again.' }, { status: 502 })
    }

    const [w, h] = size.split('x').map(Number)
    return NextResponse.json({ dataUrl, width: w, height: h })
  })
}
