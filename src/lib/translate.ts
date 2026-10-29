// ─────────────────────────────────────────────────────────────
// Canvix Translate engine — pure functions (no React, no fetch)
// Collects every translatable string in a design, applies a translation
// (script-aware fonts, RTL, auto-fit) and restores the original.
// ─────────────────────────────────────────────────────────────
import type { AnyElement, EmbedElement, PageData, TableElement, TextAlign, TextElement } from './types'

export type Script =
  | 'latin' | 'cyrillic' | 'greek' | 'arabic' | 'hebrew' | 'devanagari' | 'bengali'
  | 'tamil' | 'telugu' | 'gujarati' | 'gurmukhi' | 'thai' | 'sc' | 'tc' | 'ja' | 'ko'

export interface Language {
  code: string
  name: string
  native: string
  script: Script
  rtl?: boolean
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', native: 'English', script: 'latin' },
  { code: 'ur', name: 'Urdu', native: 'اردو', script: 'arabic', rtl: true },
  { code: 'ar', name: 'Arabic', native: 'العربية', script: 'arabic', rtl: true },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', script: 'devanagari' },
  { code: 'es', name: 'Spanish', native: 'Español', script: 'latin' },
  { code: 'fr', name: 'French', native: 'Français', script: 'latin' },
  { code: 'de', name: 'German', native: 'Deutsch', script: 'latin' },
  { code: 'pt', name: 'Portuguese', native: 'Português', script: 'latin' },
  { code: 'it', name: 'Italian', native: 'Italiano', script: 'latin' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', script: 'latin' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', script: 'latin' },
  { code: 'fa', name: 'Persian', native: 'فارسی', script: 'arabic', rtl: true },
  { code: 'ps', name: 'Pashto', native: 'پښتو', script: 'arabic', rtl: true },
  { code: 'pa', name: 'Punjabi (Gurmukhi)', native: 'ਪੰਜਾਬੀ', script: 'gurmukhi' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', script: 'bengali' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', script: 'devanagari' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', script: 'devanagari' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', script: 'gujarati' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'tamil' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', script: 'telugu' },
  { code: 'he', name: 'Hebrew', native: 'עברית', script: 'hebrew', rtl: true },
  { code: 'ru', name: 'Russian', native: 'Русский', script: 'cyrillic' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська', script: 'cyrillic' },
  { code: 'bg', name: 'Bulgarian', native: 'Български', script: 'cyrillic' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', script: 'greek' },
  { code: 'pl', name: 'Polish', native: 'Polski', script: 'latin' },
  { code: 'cs', name: 'Czech', native: 'Čeština', script: 'latin' },
  { code: 'ro', name: 'Romanian', native: 'Română', script: 'latin' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar', script: 'latin' },
  { code: 'sv', name: 'Swedish', native: 'Svenska', script: 'latin' },
  { code: 'da', name: 'Danish', native: 'Dansk', script: 'latin' },
  { code: 'no', name: 'Norwegian', native: 'Norsk', script: 'latin' },
  { code: 'fi', name: 'Finnish', native: 'Suomi', script: 'latin' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', script: 'latin' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', script: 'latin' },
  { code: 'fil', name: 'Filipino', native: 'Filipino', script: 'latin' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', script: 'latin' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', script: 'latin' },
  { code: 'th', name: 'Thai', native: 'ไทย', script: 'thai' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '简体中文', script: 'sc' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文', script: 'tc' },
  { code: 'ja', name: 'Japanese', native: '日本語', script: 'ja' },
  { code: 'ko', name: 'Korean', native: '한국어', script: 'ko' },
]

export function findLanguage(codeOrName: string): Language | null {
  const q = codeOrName.trim().toLowerCase()
  if (!q) return null
  return (
    LANGUAGES.find((l) => l.code.toLowerCase() === q) ??
    LANGUAGES.find((l) => l.name.toLowerCase() === q || l.native.toLowerCase() === q) ??
    LANGUAGES.find((l) => l.name.toLowerCase().startsWith(q) || q.startsWith(l.name.toLowerCase())) ??
    null
  )
}

// ── fonts per script ─────────────────────────────────────────

/** Google Fonts families that only cover a non-Latin script (swap them out for Latin targets). */
export const SCRIPT_FONTS: Record<Exclude<Script, 'latin' | 'cyrillic' | 'greek'>, string> = {
  arabic: 'Noto Naskh Arabic',
  hebrew: 'Noto Sans Hebrew',
  devanagari: 'Noto Sans Devanagari',
  bengali: 'Noto Sans Bengali',
  tamil: 'Noto Sans Tamil',
  telugu: 'Noto Sans Telugu',
  gujarati: 'Noto Sans Gujarati',
  gurmukhi: 'Noto Sans Gurmukhi',
  thai: 'Noto Sans Thai',
  sc: 'Noto Sans SC',
  tc: 'Noto Sans TC',
  ja: 'Noto Sans JP',
  ko: 'Noto Sans KR',
}
const URDU_FONT = 'Noto Nastaliq Urdu'
const SCRIPT_ONLY_FONTS = new Set([...Object.values(SCRIPT_FONTS), URDU_FONT])

const CYRILLIC_FONTS = new Set([
  'Inter', 'Montserrat', 'Oswald', 'Raleway', 'Open Sans', 'Nunito', 'Rubik', 'Manrope',
  'Playfair Display', 'Roboto Slab', 'Lora', 'Merriweather', 'EB Garamond', 'Cormorant Garamond',
  'Bitter', 'Prata', 'Lobster', 'Caveat', 'Amatic SC', 'JetBrains Mono', 'Noto Sans', 'Noto Serif',
])
const GREEK_FONTS = new Set(['Inter', 'Open Sans', 'Roboto Slab', 'EB Garamond', 'Manrope', 'JetBrains Mono', 'Noto Sans', 'Noto Serif'])
const DEVANAGARI_FONTS = new Set(['Poppins', 'Kalam', 'Noto Sans Devanagari'])
const SERIF_FAMILIES = new Set([
  'Playfair Display', 'Abril Fatface', 'Roboto Slab', 'Lora', 'Merriweather', 'Libre Baskerville',
  'EB Garamond', 'Cormorant Garamond', 'DM Serif Display', 'Prata', 'Bitter', 'Fraunces', 'Bodoni Moda', 'Cinzel',
])

export function fontSupports(family: string, script: Script): boolean {
  switch (script) {
    case 'latin': return !SCRIPT_ONLY_FONTS.has(family)
    case 'cyrillic': return CYRILLIC_FONTS.has(family)
    case 'greek': return GREEK_FONTS.has(family)
    case 'devanagari': return DEVANAGARI_FONTS.has(family)
    case 'arabic': return family === SCRIPT_FONTS.arabic || family === URDU_FONT
    default: return family === SCRIPT_FONTS[script]
  }
}

/** The font a text in `lang` should use when `family` cannot render its script. */
export function fontFor(family: string, lang: Language): string {
  if (lang.code === 'ur') return family === URDU_FONT ? family : URDU_FONT
  if (fontSupports(family, lang.script)) return family
  if (lang.script === 'latin') return SERIF_FAMILIES.has(family) ? 'Lora' : 'Inter'
  if (lang.script === 'cyrillic' || lang.script === 'greek') return SERIF_FAMILIES.has(family) ? 'Noto Serif' : 'Noto Sans'
  return SCRIPT_FONTS[lang.script]
}

/** Nastaliq has very tall ascenders/descenders — tight line heights clip it. */
function minLineHeight(lang: Language): number {
  if (lang.code === 'ur') return 1.75
  if (lang.script === 'arabic' || lang.script === 'thai' || lang.script === 'devanagari') return 1.35
  return 0
}

// ── collection ───────────────────────────────────────────────

/** One translatable string. `key` addresses it: t:<id> | c:<id>:<cell> | e:<id> */
export interface TranslationUnit {
  key: string
  text: string
}

/** Strings with no letters (numbers, prices, emoji) or bare URLs/emails stay as they are. */
export function needsTranslation(text: string): boolean {
  const t = text.trim()
  if (!t || !/\p{L}/u.test(t)) return false
  if (/^(https?:\/\/|www\.)\S+$/i.test(t) || /^\S+@\S+\.\S+$/.test(t)) return false
  return true
}

function walk(els: AnyElement[], fn: (el: AnyElement) => void) {
  for (const el of els) {
    if (el.type === 'group') walk(el.children, fn)
    else fn(el)
  }
}

/** Every translatable string across all pages — always the *original* text,
 *  so re-translating an already-translated design never compounds errors. */
export function collectUnits(pages: PageData[], onlyIds?: Set<string>): TranslationUnit[] {
  const units: TranslationUnit[] = []
  for (const p of pages) {
    walk(p.elements, (el) => {
      if (onlyIds && !onlyIds.has(el.id)) return
      if (el.type === 'text') {
        const src = el.i18n?.source ?? el.text
        if (needsTranslation(src)) units.push({ key: `t:${el.id}`, text: src })
      } else if (el.type === 'table') {
        el.cells.forEach((c, i) => {
          const src = c.source ?? c.text
          if (needsTranslation(src)) units.push({ key: `c:${el.id}:${i}`, text: src })
        })
      } else if (el.type === 'embed') {
        const src = el.sourceTitle ?? el.title
        if (src && needsTranslation(src)) units.push({ key: `e:${el.id}`, text: src })
      }
    })
  }
  return units
}

/** Language the design is currently shown in (null = original). */
export function currentLanguage(pages: PageData[]): Language | null {
  let code: string | null = null
  for (const p of pages) {
    walk(p.elements, (el) => {
      if (code) return
      if (el.type === 'text' && el.i18n) code = el.i18n.lang
      else if (el.type === 'table' && el.i18n) code = el.i18n.lang
    })
    if (code) break
  }
  return code ? findLanguage(code) ?? { code, name: code, native: code, script: 'latin' } : null
}

export function isTranslated(pages: PageData[]): boolean {
  let found = false
  for (const p of pages) {
    walk(p.elements, (el) => {
      if (found) return
      if (el.type === 'text' && el.i18n) found = true
      else if (el.type === 'table' && (el.i18n || el.cells.some((c) => c.source !== undefined))) found = true
      else if (el.type === 'embed' && el.sourceTitle !== undefined) found = true
    })
    if (found) return true
  }
  return false
}

// ── apply / restore ──────────────────────────────────────────

export interface ApplyOptions {
  /** swap to a font that has the target script's glyphs */
  fixFonts: boolean
  /** shrink font size so the translation fits the original text box */
  autoFit: boolean
  /** measures a text element's wrapped height (client injects Konva). */
  measure?: (t: TextElement) => number
}

const RTL_FLIP: Partial<Record<TextAlign, TextAlign>> = { left: 'right' }

function applyText(el: TextElement, translated: string, lang: Language, opts: ApplyOptions): TextElement {
  const snap = el.i18n ?? {
    lang: lang.code,
    source: el.text,
    sourceFontFamily: el.fontFamily,
    sourceFontSize: el.fontSize,
    sourceAlign: el.align,
    sourceDirection: el.direction,
    sourceLineHeight: el.lineHeight,
    sourceHeight: el.height,
  }
  const fontFamily = opts.fixFonts ? fontFor(snap.sourceFontFamily, lang) : snap.sourceFontFamily
  const lineHeight = Math.max(snap.sourceLineHeight ?? el.lineHeight, minLineHeight(lang))
  const srcRtl = snap.sourceDirection === 'rtl'
  const align = lang.rtl && !srcRtl
    ? RTL_FLIP[snap.sourceAlign] ?? snap.sourceAlign
    : !lang.rtl && srcRtl && snap.sourceAlign === 'right' ? 'left' : snap.sourceAlign
  let next: TextElement = {
    ...el,
    text: translated,
    fontFamily,
    fontSize: snap.sourceFontSize,
    lineHeight,
    align,
    direction: lang.rtl ? 'rtl' : 'ltr',
    i18n: { ...snap, lang: lang.code },
  }
  // curved text is a single line — auto-fit by wrapped height does not apply
  if (opts.measure && !el.curve) {
    const original: TextElement = {
      ...el, text: snap.source, fontFamily: snap.sourceFontFamily, fontSize: snap.sourceFontSize,
      lineHeight: snap.sourceLineHeight ?? el.lineHeight,
    }
    const budget = Math.max(opts.measure(original), snap.sourceHeight ?? 0)
    let h = opts.measure(next)
    if (opts.autoFit) {
      const floor = Math.max(8, snap.sourceFontSize * 0.55)
      while (h > budget * 1.03 && next.fontSize > floor) {
        next = { ...next, fontSize: Math.max(floor, Math.round(next.fontSize * 0.93 * 10) / 10) }
        h = opts.measure(next)
      }
    }
    next.height = h
  }
  return next
}

/** Apply translations (keyed like `TranslationUnit.key`) to every page.
 *  Elements without an entry are left exactly as they are. */
export function applyTranslations(
  pages: PageData[],
  lang: Language,
  translations: Map<string, string>,
  opts: ApplyOptions
): PageData[] {
  const map = (els: AnyElement[]): AnyElement[] =>
    els.map((el): AnyElement => {
      if (el.type === 'group') return { ...el, children: map(el.children) }
      if (el.type === 'text') {
        const tr = translations.get(`t:${el.id}`)
        return tr === undefined ? el : applyText(el, tr, lang, opts)
      }
      if (el.type === 'table') {
        let changed = false
        const cells = el.cells.map((c, i) => {
          const tr = translations.get(`c:${el.id}:${i}`)
          if (tr === undefined) return c
          changed = true
          return { ...c, text: tr, source: c.source ?? c.text }
        })
        if (!changed) return el
        const tb: TableElement = { ...el, cells }
        const sourceFontFamily = el.i18n?.sourceFontFamily ?? el.fontFamily
        tb.fontFamily = opts.fixFonts ? fontFor(sourceFontFamily, lang) : sourceFontFamily
        tb.i18n = { lang: lang.code, sourceFontFamily }
        return tb
      }
      if (el.type === 'embed') {
        const tr = translations.get(`e:${el.id}`)
        if (tr === undefined) return el
        const em: EmbedElement = { ...el, title: tr, sourceTitle: el.sourceTitle ?? el.title }
        return em
      }
      return el
    })
  return pages.map((p) => ({ ...p, elements: map(p.elements) }))
}

/** Undo every translation — text, fonts, sizes, alignment and direction
 *  return to exactly what they were before the first translation. */
export function restoreOriginal(pages: PageData[]): PageData[] {
  const map = (els: AnyElement[]): AnyElement[] =>
    els.map((el): AnyElement => {
      if (el.type === 'group') return { ...el, children: map(el.children) }
      if (el.type === 'text' && el.i18n) {
        const s = el.i18n
        const out: TextElement = {
          ...el,
          text: s.source,
          fontFamily: s.sourceFontFamily,
          fontSize: s.sourceFontSize,
          align: s.sourceAlign,
          direction: s.sourceDirection,
          lineHeight: s.sourceLineHeight ?? el.lineHeight,
          height: s.sourceHeight ?? el.height,
        }
        delete out.i18n
        if (!out.direction) delete out.direction
        return out
      }
      if (el.type === 'table' && (el.i18n || el.cells.some((c) => c.source !== undefined))) {
        const out: TableElement = {
          ...el,
          fontFamily: el.i18n?.sourceFontFamily ?? el.fontFamily,
          cells: el.cells.map((c) => {
            if (c.source === undefined) return c
            const { source, ...rest } = c
            return { ...rest, text: source }
          }),
        }
        delete out.i18n
        return out
      }
      if (el.type === 'embed' && el.sourceTitle !== undefined) {
        const { sourceTitle, ...rest } = el
        return { ...rest, title: sourceTitle }
      }
      return el
    })
  return pages.map((p) => ({ ...p, elements: map(p.elements) }))
}

/** Split units into request-sized batches (count + character budget). */
export function chunkUnits(units: TranslationUnit[], maxCount = 25, maxChars = 3500): TranslationUnit[][] {
  const out: TranslationUnit[][] = []
  let cur: TranslationUnit[] = []
  let chars = 0
  for (const u of units) {
    if (cur.length && (cur.length >= maxCount || chars + u.text.length > maxChars)) {
      out.push(cur)
      cur = []
      chars = 0
    }
    cur.push(u)
    chars += u.text.length
  }
  if (cur.length) out.push(cur)
  return out
}
