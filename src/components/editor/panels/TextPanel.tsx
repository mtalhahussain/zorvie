'use client'

import { useState } from 'react'
import { Heading1, Heading2, Type as TypeIcon, Plus, Sparkles, BookMarked } from 'lucide-react'
import { addText } from '../add-element'
import { MagicWriteApp } from '../apps/MagicWriteApp'
import { FONT_STYLES } from '@/lib/editor-utils'
import { createTextElement } from '@/lib/types'
import { useEditorStore } from '@/store/editor-store'
import { PanelShell } from './panel-shell'

/** add a heading + body pair stacked (not overlapping), centred on the page, as one undo step */
function addTextPair(
  heading: { text: string; fontFamily: string; bold: boolean; fontSize: number },
  body: { text: string; fontFamily: string; fontSize: number }
) {
  const s = useEditorStore.getState()
  const width = Math.min(760, Math.round(s.width * 0.85))
  const lineHeight = 1.25
  const headingH = Math.round(heading.fontSize * lineHeight * 1.2)
  const bodyH = Math.round(body.fontSize * lineHeight * 2.2)
  const gap = Math.round(body.fontSize * 0.6)
  const x = Math.max(0, Math.round((s.width - width) / 2))
  const top = Math.max(0, Math.round((s.height - (headingH + gap + bodyH)) / 2))
  s.addElementsBulk([
    createTextElement({ ...heading, x, y: top, width, height: headingH, align: 'center', lineHeight }),
    createTextElement({ ...body, bold: false, x, y: top + headingH + gap, width, height: bodyH, align: 'center', lineHeight }),
  ])
}

export function TextPanel() {
  const brand = useEditorStore((s) => s.brand)
  const [magicOpen, setMagicOpen] = useState(false)

  if (magicOpen) {
    return (
      <PanelShell title="Text" subtitle="Generate copy with AI, then add it to the canvas.">
        <MagicWriteApp onClose={() => setMagicOpen(false)} />
      </PanelShell>
    )
  }

  return (
    <PanelShell title="Text" subtitle="Click to add — style it from the toolbar above the canvas.">
      {/* canva signature purple pill */}
      <button
        onClick={() => addText('body')}
        className="w-full h-11 rounded-full bg-[#7630D7] hover:bg-[#8B5CF6] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors mt-1 shadow-lg shadow-[#7630D7]/25"
        aria-label="Add a text box"
      >
        <Plus size={16} /> Add a text box
      </button>

      <div className="flex gap-2 mt-2">
        <button
          className="flex-1 h-10 rounded-xl border border-white/12 bg-white/[0.05] hover:bg-white/10 text-[12px] font-semibold flex items-center justify-center gap-1.5 text-white/85 transition-colors"
          onClick={() => setMagicOpen(true)}
          aria-label="Magic Write"
        >
          <Sparkles size={13} className="text-[#02C0CC]" /> Magic Write
        </button>
      </div>

      <div className="space-y-2 mt-5">
        <button
          onClick={() => addText('heading')}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 hover:border-[#7630D7] hover:bg-[#7630D7]/10 transition-all flex items-center gap-3"
          aria-label="Add a heading"
        >
          <Heading1 size={20} className="text-white/50" />
          <span style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 26 }} className="leading-none text-white">Add a heading</span>
        </button>
        <button
          onClick={() => addText('subheading')}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 hover:border-[#7630D7] hover:bg-[#7630D7]/10 transition-all flex items-center gap-3"
          aria-label="Add a subheading"
        >
          <Heading2 size={18} className="text-white/50" />
          <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 19 }} className="leading-none text-white">Add a subheading</span>
        </button>
        <button
          onClick={() => addText('body')}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 hover:border-[#7630D7] hover:bg-[#7630D7]/10 transition-all flex items-center gap-3"
          aria-label="Add body text"
        >
          <TypeIcon size={16} className="text-white/50" />
          <span style={{ fontFamily: 'Poppins', fontSize: 15 }} className="leading-none text-white/90">Add a little bit of body text</span>
        </button>
      </div>

      <h4 className="mt-6 mb-3 text-xs font-semibold text-white/50 uppercase tracking-wide">Font combinations</h4>
      <div className="grid grid-cols-2 gap-3">
        {FONT_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() =>
              addTextPair(
                { text: style.name.replace(/&/g, 'and'), fontFamily: style.heading.family, bold: style.heading.weight >= 700, fontSize: 72 },
                { text: 'Pair it with a clean, readable body font.', fontFamily: style.body.family, fontSize: 30 }
              )
            }
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-[#7630D7] hover:bg-[#7630D7]/10 transition-all text-left"
            aria-label={`Add ${style.name} font pairing`}
          >
            <div
              style={{ fontFamily: style.heading.family, fontWeight: style.heading.weight, fontSize: 22, lineHeight: 1.15 }}
              className="truncate text-white"
            >
              {style.name.split(' ')[0]}
            </div>
            <div
              style={{ fontFamily: style.body.family, fontWeight: style.body.weight, fontSize: 13, lineHeight: 1.4 }}
              className="mt-1 text-white/55 truncate"
            >
              Body text sample
            </div>
          </button>
        ))}
      </div>

      {/* brand kit section — canva-style */}
      <div className="mt-6 rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/[0.04]">
          <BookMarked size={13} className="text-white/60" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-white/70">Brand Kit</span>
        </div>
        <div className="p-3 flex items-center gap-3">
          <span
            className="text-white truncate"
            style={{ fontFamily: brand.headingFont, fontWeight: 800, fontSize: 18 }}
          >
            {brand.headingFont}
          </span>
          <span className="text-white/40 text-[11px]">+ body font</span>
          <button
            className="ml-auto h-8 px-3 rounded-lg bg-white/10 hover:bg-[#7630D7] text-[11px] font-semibold text-white transition-colors shrink-0"
            onClick={() =>
              addTextPair(
                { text: 'Brand heading sample', fontFamily: brand.headingFont, bold: true, fontSize: 64 },
                { text: 'And its matching brand body font.', fontFamily: brand.bodyFont, fontSize: 26 }
              )
            }
            aria-label="Add brand font pair"
          >
            Use
          </button>
        </div>
      </div>
    </PanelShell>
  )
}
