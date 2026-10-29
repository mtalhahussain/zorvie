import { NextRequest, NextResponse } from 'next/server'
import { withProvider, TEXT_MODEL } from '@/lib/ai/provider'

export const runtime = 'nodejs'
export const maxDuration = 60

interface TranslateBody {
  texts?: string[]
  language?: string
}

/** Pull translations out of an LLM reply. Accepts a JSON object keyed by the
 *  1-based input number (preferred) or a plain array; tolerates code fences and
 *  trailing junk. Missing / non-string entries come back as null so the client
 *  can retry just those instead of failing the whole design. */
function parseTranslations(raw: string, expected: number): (string | null)[] | null {
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim()
  const tryParse = (open: string, close: string): unknown => {
    const start = cleaned.indexOf(open)
    if (start === -1) return null
    let end = cleaned.lastIndexOf(close)
    while (end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1))
      } catch {
        end = cleaned.lastIndexOf(close, end - 1)
      }
    }
    return null
  }
  const out: (string | null)[] = Array.from({ length: expected }, () => null)
  const obj = tryParse('{', '}')
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const i = Number.parseInt(k, 10) - 1
      if (i >= 0 && i < expected && typeof v === 'string') out[i] = v
    }
  } else {
    const arr = tryParse('[', ']')
    if (!Array.isArray(arr)) return null
    arr.slice(0, expected).forEach((v, i) => { if (typeof v === 'string') out[i] = v })
  }
  return out.some((t) => t !== null) ? out : null
}

/** POST /api/ai/translate — Canva "Translate": translate an array of design texts. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as TranslateBody
  const language = (body.language ?? '').trim()
  const texts = Array.isArray(body.texts) ? body.texts.filter((t) => typeof t === 'string') : []

  if (!language) return NextResponse.json({ error: 'A target language is required.' }, { status: 400 })
  if (!texts.length) return NextResponse.json({ error: 'No texts to translate.' }, { status: 400 })
  // the client batches large designs — one request carries at most 60 strings
  if (texts.length > 60) return NextResponse.json({ error: 'Too many texts in one request (max 60).' }, { status: 400 })
  if (texts.some((t) => t.length > 2000)) {
    return NextResponse.json({ error: 'One of the texts is too long (max 2000 chars).' }, { status: 400 })
  }

  const numbered = texts.map((t, i) => `${i + 1}: ${JSON.stringify(t)}`).join('\n')
  const system =
    'You are a professional design translator for a graphic-design tool. ' +
    'Translate every numbered text into the requested language, keeping the meaning, tone and style. ' +
    'Texts are short design copy (headlines, buttons, captions) — keep them about as short as the original. ' +
    'Preserve line breaks, emoji, numbers and placeholders. Keep brand names, URLs and proper nouns untranslated. ' +
    'Use the native script of the language (e.g. Urdu in Urdu script, Hindi in Devanagari). ' +
    'If a text is already in the target language, return it unchanged. ' +
    'Respond ONLY with a JSON object mapping each input number (as a string key) to its translation, ' +
    'e.g. {"1": "...", "2": "..."}. Include every number. No markdown, no commentary.'

  const user = `Target language: ${language}\n\nTexts:\n${numbered}\n\nRespond with a JSON object with ${texts.length} keys ("1".."${texts.length}").`

  return withProvider('translate', req, { limit: 40, windowSec: 60 }, async (zai) => {
    const completion = await zai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      thinking: { type: 'disabled' },
    })

    const reply = completion.choices[0]?.message?.content ?? ''
    const translations = parseTranslations(reply, texts.length)
    if (!translations) {
      return NextResponse.json({ error: 'Translation failed — please try again.' }, { status: 502 })
    }
    return NextResponse.json({ language, translations })
  })
}
