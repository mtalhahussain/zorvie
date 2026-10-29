// ─────────────────────────────────────────────────────────────
// Canvix Translate runner — client-side orchestration: batches the design's
// strings to /api/ai/translate (parallel, with retries for anything the model
// dropped), loads script fonts, then applies everything as one undo step.
// ─────────────────────────────────────────────────────────────
import Konva from 'konva'
import type { PageData, TextElement } from './types'
import {
  applyTranslations,
  chunkUnits,
  collectUnits,
  fontFor,
  type Language,
  type TranslationUnit,
} from './translate'

export interface TranslateProgress {
  done: number
  total: number
}

export interface TranslateResult {
  pages: PageData[]
  translated: number
  failed: number
  total: number
}

export class TranslateError extends Error {
  constructor(message: string, readonly code?: 'unavailable' | 'rate_limited' | 'empty') {
    super(message)
  }
}

let measurer: Konva.Text | null = null

/** Wrapped height of a text element, exactly as the canvas lays it out. */
export function measureTextHeight(t: TextElement): number {
  measurer ??= new Konva.Text({ wrap: 'word' })
  measurer.setAttrs({
    text: t.uppercase ? t.text.toUpperCase() : t.text,
    width: t.width,
    fontSize: t.fontSize,
    fontFamily: t.fontFamily,
    fontStyle: `${t.italic ? 'italic ' : ''}${t.bold ? 'bold' : 'normal'}`,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    direction: t.direction ?? 'inherit',
  })
  return measurer.height()
}

/** The Konva canvas does not repaint when a web font arrives — load the faces first. */
async function loadFonts(families: Set<string>, sample: string) {
  if (typeof document === 'undefined' || !document.fonts) return
  const loads = [...families].flatMap((f) => [
    document.fonts.load(`400 32px "${f}"`, sample),
    document.fonts.load(`700 32px "${f}"`, sample),
  ])
  await Promise.race([Promise.allSettled(loads), new Promise((r) => setTimeout(r, 4000))])
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function requestBatch(language: string, batch: TranslationUnit[], attempt = 0): Promise<(string | null)[]> {
  const res = await fetch('/api/ai/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, texts: batch.map((u) => u.text) }),
  })
  if (res.status === 503) throw new TranslateError('AI is not available right now.', 'unavailable')
  if (res.status === 429) {
    if (attempt >= 3) throw new TranslateError('Too many translate requests — try again in a minute.', 'rate_limited')
    const wait = Math.min(15, Number(res.headers.get('Retry-After')) || 5)
    await sleep(wait * 1000)
    return requestBatch(language, batch, attempt + 1)
  }
  const data = (await res.json().catch(() => ({}))) as { translations?: (string | null)[] }
  if (!res.ok || !Array.isArray(data.translations)) {
    // transient model / parse failure — one retry, then give up on this batch only
    if (attempt < 1) return requestBatch(language, batch, attempt + 1)
    return batch.map(() => null)
  }
  return batch.map((_, i) => (typeof data.translations![i] === 'string' ? data.translations![i] : null))
}

/** Run `fn` over `items` with at most `limit` in flight. */
async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) await fn(items[i++])
    })
  )
}

/** Translate the whole design (or just `onlyIds`) into `lang`.
 *  Strings the model drops are retried in smaller batches, so a design is
 *  never left half-translated because of one bad reply. */
export async function translateDesign(
  pages: PageData[],
  lang: Language,
  opts: { fixFonts: boolean; autoFit: boolean; onlyIds?: Set<string>; onProgress?: (p: TranslateProgress) => void }
): Promise<TranslateResult> {
  const units = collectUnits(pages, opts.onlyIds)
  if (!units.length) throw new TranslateError('Nothing to translate in this design.', 'empty')
  const language = `${lang.name} (${lang.native})`
  const results = new Map<string, string>()
  const report = () => opts.onProgress?.({ done: results.size, total: units.length })
  report()

  let pending = units
  // pass 1: normal batches · pass 2–3: whatever is missing, in smaller batches
  for (const [maxCount, maxChars] of [[25, 3500], [8, 1500], [3, 800]] as const) {
    if (!pending.length) break
    await pool(chunkUnits(pending, maxCount, maxChars), 3, async (batch) => {
      const out = await requestBatch(language, batch)
      out.forEach((t, k) => {
        if (t !== null && t.trim()) results.set(batch[k].key, t)
      })
      report()
    })
    pending = pending.filter((u) => !results.has(u.key))
  }

  if (opts.fixFonts) {
    const families = new Set([fontFor('Inter', lang)])
    const walk = (els: PageData['elements']) => {
      for (const el of els) {
        if (el.type === 'group') walk(el.children)
        else if (el.type === 'text' || el.type === 'table') families.add(fontFor(el.i18n?.sourceFontFamily ?? el.fontFamily, lang))
      }
    }
    pages.forEach((p) => walk(p.elements))
    await loadFonts(families, [...results.values()].slice(0, 8).join(' '))
  }

  const next = applyTranslations(pages, lang, results, {
    fixFonts: opts.fixFonts,
    autoFit: opts.autoFit,
    measure: measureTextHeight,
  })
  return { pages: next, translated: results.size, failed: units.length - results.size, total: units.length }
}

/** Load the original fonts again before restoring (they may never have been used this session). */
export async function prepareRestore(pages: PageData[]) {
  const families = new Set<string>()
  const walk = (els: PageData['elements']) => {
    for (const el of els) {
      if (el.type === 'group') walk(el.children)
      else if (el.type === 'text' && el.i18n) families.add(el.i18n.sourceFontFamily)
      else if (el.type === 'table' && el.i18n) families.add(el.i18n.sourceFontFamily)
    }
  }
  pages.forEach((p) => walk(p.elements))
  await loadFonts(families, 'AaBb')
}
