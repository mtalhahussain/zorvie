/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test'
import {
  applyTranslations,
  chunkUnits,
  collectUnits,
  currentLanguage,
  findLanguage,
  fontFor,
  isTranslated,
  needsTranslation,
  restoreOriginal,
} from './translate'
import {
  createEmbedElement,
  createGroupElement,
  createPage,
  createTableElement,
  createTextElement,
  type PageData,
  type TableElement,
  type TextElement,
} from './types'

function design(): PageData[] {
  const title = createTextElement({ text: 'Summer Sale', fontFamily: 'Archivo Black', align: 'left', fontSize: 64 })
  const price = createTextElement({ text: '$49.99' })
  const nested = createTextElement({ text: 'Shop now', fontFamily: 'Poppins' })
  const table = createTableElement({ rows: 2, cols: 2, header: ['Plan', 'Price'] })
  table.cells[2] = { text: 'Pro' }
  table.cells[3] = { text: '20' }
  const embed = createEmbedElement('https://youtube.com/watch?v=x', { title: 'Watch the video' })
  const p1 = createPage()
  p1.elements = [title, price, createGroupElement([nested])]
  const p2 = createPage()
  p2.elements = [table, embed]
  return [p1, p2]
}

const ur = findLanguage('ur')!
const fr = findLanguage('French')!

function fakeTranslate(pages: PageData[], prefix: string) {
  return new Map(collectUnits(pages).map((u) => [u.key, `${prefix}:${u.text}`]))
}

describe('collectUnits', () => {
  test('finds text, grouped text, table cells and embed titles on every page — skips numbers', () => {
    const texts = collectUnits(design()).map((u) => u.text)
    expect(texts).toEqual(['Summer Sale', 'Shop now', 'Plan', 'Price', 'Pro', 'Watch the video'])
  })

  test('needsTranslation ignores prices, emoji and bare URLs', () => {
    expect(needsTranslation('$49.99')).toBe(false)
    expect(needsTranslation('🔥🔥')).toBe(false)
    expect(needsTranslation('www.canvix.app')).toBe(false)
    expect(needsTranslation('Hello')).toBe(true)
  })
})

describe('apply + restore', () => {
  test('Urdu: RTL, right-aligned, Nastaliq font, original kept', () => {
    const pages = design()
    const out = applyTranslations(pages, ur, fakeTranslate(pages, 'UR'), { fixFonts: true, autoFit: false })
    const title = out[0].elements[0] as TextElement
    expect(title.text).toBe('UR:Summer Sale')
    expect(title.direction).toBe('rtl')
    expect(title.align).toBe('right')
    expect(title.fontFamily).toBe('Noto Nastaliq Urdu')
    expect(title.lineHeight).toBeGreaterThanOrEqual(1.75)
    expect(title.i18n?.source).toBe('Summer Sale')
    expect(isTranslated(out)).toBe(true)
    expect(currentLanguage(out)?.code).toBe('ur')
  })

  test('restoreOriginal returns the exact pre-translation design', () => {
    const pages = design()
    const out = applyTranslations(pages, ur, fakeTranslate(pages, 'UR'), { fixFonts: true, autoFit: false })
    const back = restoreOriginal(out)
    expect(JSON.parse(JSON.stringify(back))).toEqual(JSON.parse(JSON.stringify(pages)))
    expect(isTranslated(back)).toBe(false)
  })

  test('switching languages translates from the original, not the previous translation', () => {
    const pages = design()
    const urdu = applyTranslations(pages, ur, fakeTranslate(pages, 'UR'), { fixFonts: true, autoFit: false })
    const units = collectUnits(urdu)
    expect(units[0].text).toBe('Summer Sale')
    const french = applyTranslations(urdu, fr, fakeTranslate(urdu, 'FR'), { fixFonts: true, autoFit: false })
    const title = french[0].elements[0] as TextElement
    expect(title.text).toBe('FR:Summer Sale')
    expect(title.direction).toBe('ltr')
    expect(title.align).toBe('left')
    expect(title.fontFamily).toBe('Archivo Black')
    const table = french[1].elements[0] as TableElement
    expect(table.cells[2]).toMatchObject({ text: 'FR:Pro', source: 'Pro' })
    expect(JSON.parse(JSON.stringify(restoreOriginal(french)))).toEqual(JSON.parse(JSON.stringify(pages)))
  })

  test('auto-fit shrinks text whose translation grows taller than the original', () => {
    const pages = design()
    // fake measure: height grows with characters × font size
    const measure = (t: TextElement) => t.text.length * t.fontSize
    const long = new Map([[collectUnits(pages)[0].key, 'Summer Sale but three times longer']])
    const out = applyTranslations(pages, fr, long, { fixFonts: true, autoFit: true, measure })
    const title = out[0].elements[0] as TextElement
    expect(title.fontSize).toBeLessThan(64)
    expect(title.fontSize).toBeGreaterThanOrEqual(64 * 0.55)
    expect(restoreOriginal(out)[0].elements[0]).toMatchObject({ fontSize: 64 })
  })
})

describe('fonts + batching', () => {
  test('fontFor keeps fonts that cover the script, swaps the rest', () => {
    expect(fontFor('Poppins', findLanguage('hi')!)).toBe('Poppins')
    expect(fontFor('Archivo Black', findLanguage('hi')!)).toBe('Noto Sans Devanagari')
    expect(fontFor('Inter', findLanguage('ru')!)).toBe('Inter')
    expect(fontFor('Lora', findLanguage('ja')!)).toBe('Noto Sans JP')
    expect(fontFor('Noto Nastaliq Urdu', findLanguage('en')!)).toBe('Inter')
  })

  test('chunkUnits respects count and character budgets', () => {
    const units = Array.from({ length: 60 }, (_, i) => ({ key: `t:${i}`, text: 'x'.repeat(100) }))
    const chunks = chunkUnits(units, 25, 1000)
    expect(chunks.every((c) => c.length <= 10)).toBe(true)
    expect(chunks.flat().length).toBe(60)
  })
})
