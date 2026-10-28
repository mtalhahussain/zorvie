'use client'

import { useState } from 'react'
import { Plus, Copy, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { DesignPreview } from '@/components/design-preview'
import { cn } from '@/lib/utils'

const THUMB_H = 52

export function PageBar() {
  const pages = useEditorStore((s) => s.pages)
  const currentPage = useEditorStore((s) => s.currentPage)
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage)
  const addPage = useEditorStore((s) => s.addPage)
  const duplicatePage = useEditorStore((s) => s.duplicatePage)
  const deletePage = useEditorStore((s) => s.deletePage)
  const movePage = useEditorStore((s) => s.movePage)
  // drag-to-reorder (HTML5 DnD on the thumbnails)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const width = useEditorStore((s) => s.width)
  const height = useEditorStore((s) => s.height)

  const thumbW = Math.max(28, THUMB_H * (width / height))

  return (
    <div className="absolute bottom-3 left-3 z-30 flex items-end gap-2 max-w-[calc(100%-130px)]">
      <div className="flex items-end gap-1.5 overflow-x-auto cv-scroll pb-1">
        {pages.map((p, i) => (
          <div
            key={p.id}
            className={cn('group relative shrink-0 rounded-md', dragOver === i && dragFrom !== null && dragFrom !== i && 'ring-2 ring-[#02C0CC] ring-offset-2 ring-offset-[#0F1015]')}
            draggable={pages.length > 1}
            onDragStart={(e) => {
              setDragFrom(i)
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('application/x-zorvie-page', String(i))
            }}
            onDragOver={(e) => {
              if (dragFrom === null) return // files etc. — leave to the editor's drop handler
              e.preventDefault()
              e.stopPropagation()
              e.dataTransfer.dropEffect = 'move'
              if (dragOver !== i) setDragOver(i)
            }}
            onDrop={(e) => {
              if (dragFrom === null) return
              e.preventDefault()
              e.stopPropagation()
              movePage(dragFrom, i)
              setDragFrom(null)
              setDragOver(null)
            }}
            onDragEnd={() => {
              setDragFrom(null)
              setDragOver(null)
            }}
            title={pages.length > 1 ? 'Drag to reorder' : undefined}
          >
            <button
              onClick={() => setCurrentPage(i)}
              className={cn(
                'block rounded-md overflow-hidden border-2 transition-all bg-white shadow-md',
                i === currentPage ? 'border-[#02C0CC]' : 'border-white/20 hover:border-white/45'
              )}
              style={{ height: THUMB_H, width: thumbW }}
              aria-label={`Go to page ${i + 1}`}
            >
              <div className="w-full h-full">
                <DesignPreview page={p} width={width} height={height} />
              </div>
            </button>
            <span className="absolute -top-1.5 -left-1.5 h-4 min-w-4 px-0.5 rounded-full bg-[#7630D7] text-white text-[9px] font-bold flex items-center justify-center shadow">
              {i + 1}
            </span>
            <div className="absolute top-1 right-1 hidden group-hover:flex group-focus-within:flex gap-0.5">
              <button
                className="h-5 w-5 rounded bg-black/55 text-white flex items-center justify-center hover:bg-black/80"
                onClick={() => duplicatePage(i)}
                title="Duplicate page"
                aria-label={`Duplicate page ${i + 1}`}
              >
                <Copy size={10} />
              </button>
              {pages.length > 1 && (
                <button
                  className="h-5 w-5 rounded bg-black/55 text-white flex items-center justify-center hover:bg-red-600"
                  onClick={() => deletePage(i)}
                  title="Delete page"
                  aria-label={`Delete page ${i + 1}`}
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addPage}
        className="h-9 w-9 rounded-lg border-2 border-dashed border-white/25 text-white/60 hover:border-[#02C0CC] hover:text-[#02C0CC] flex items-center justify-center shrink-0 bg-white/[0.06]"
        title="Add page"
        aria-label="Add page"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
