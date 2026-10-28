'use client'

import { useRef } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { GRADIENT_PRESETS, SOLID_SWATCHES } from '@/lib/editor-utils'
import { ColorPicker } from './color-picker'

export function BackgroundPanel() {
  const page = useEditorStore((s) => s.pages[s.currentPage])
  const setBackground = useEditorStore((s) => s.setPageBackground)
  const setBackgroundLive = useEditorStore((s) => s.setPageBackgroundLive)
  const bg = page?.background
  /** true while a live colour drag is running (its undo snapshot is already pushed) */
  const liveRef = useRef(false)

  /** custom picker: snapshot once at the start of a drag, update live, settle on commit */
  const applyCustom = (color: string, committed: boolean) => {
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) return
    const same = bg?.type === 'solid' && bg.color === color
    if (!liveRef.current) {
      if (same) return
      if (committed) { setBackground({ type: 'solid', color }); return }
      useEditorStore.getState().pushHistory()
      liveRef.current = true
    }
    if (!same) setBackgroundLive({ type: 'solid', color })
    if (committed) liveRef.current = false
  }

  const applySolid = (color: string) => {
    liveRef.current = false
    // ignore half-typed hex values from the custom colour input
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) return
    if (bg?.type === 'solid' && bg.color === color) return
    setBackground({ type: 'solid', color })
  }

  const applyGradient = (from: string, to: string, angle: number) => {
    liveRef.current = false
    if (bg?.type === 'gradient' && bg.from === from && bg.to === to && bg.angle === angle) return
    setBackground({ type: 'gradient', from, to, angle })
  }

  return (
    <div className="flex flex-col h-full bg-[#16181D] text-[#EDEEF2]">
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.07]">
        <h3 className="font-bold text-sm">Background</h3>
        <p className="text-xs text-white/50 mt-0.5">Applies to the current page. White works great for print.</p>
      </div>
      <div className="flex-1 overflow-y-auto cv-scroll-dark p-4">
        <h4 className="text-xs font-semibold text-white/50 mb-2">Solid colors</h4>
        <div className="grid grid-cols-8 gap-1.5">
          {SOLID_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => applySolid(c)}
              className={`h-7 w-7 rounded-md border border-white/15 hover:scale-110 transition-transform ${
                bg?.type === 'solid' && bg.color === c ? 'ring-2 ring-[#02C0CC] ring-offset-1 ring-offset-[#16181D]' : ''
              }`}
              style={{ background: c }}
              aria-label={`Background ${c}`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-semibold text-white/50">Custom</span>
          <ColorPicker
            value={bg?.type === 'solid' ? bg.color : '#FFFFFF'}
            onChange={applyCustom}
            label="Custom background color"
          />
        </div>

        <h4 className="text-xs font-semibold text-white/50 mt-6 mb-2">Gradients</h4>
        <div className="grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((g, i) => (
            <button
              key={i}
              onClick={() => applyGradient(g.from, g.to, g.angle)}
              className={`h-16 rounded-lg border border-white/15 hover:scale-[1.03] transition-transform ${
                bg?.type === 'gradient' && bg.from === g.from && bg.to === g.to ? 'ring-2 ring-[#02C0CC] ring-offset-1 ring-offset-[#16181D]' : ''
              }`}
              style={{ background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})` }}
              aria-label={`Gradient ${g.from} to ${g.to}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
