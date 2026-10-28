'use client'

import { useEffect, useState } from 'react'
import { Clock, FolderOpen } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { useEditorStore } from '@/store/editor-store'
import { PanelShell } from './panel-shell'
import { fetchDesign } from '@/components/dashboard/hooks'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface DesignRow {
  id: string
  name: string
  width: number
  height: number
  updatedAt: string
  thumbnail?: string | null
}

/** Canva Projects panel — your recent designs, open one straight in the editor. */
export function ProjectsPanel() {
  const openEditor = useAppStore((s) => s.openEditor)
  const designId = useEditorStore((s) => s.designId)
  const loadDesign = useEditorStore((s) => s.loadDesign)
  const [designs, setDesigns] = useState<DesignRow[] | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let alive = true
    fetch('/api/designs')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: DesignRow[]) => { if (alive) setDesigns(rows) })
      .catch(() => { if (alive) setDesigns([]) })
    return () => { alive = false }
  }, [])

  const [opening, setOpening] = useState<string | null>(null)

  const open = async (row: DesignRow) => {
    if (row.id === designId) {
      toast({ title: `“${row.name}” is already open` })
      return
    }
    if (opening) return
    setOpening(row.id)
    try {
      // flush unsaved edits of the current design before switching away
      const current = useEditorStore.getState()
      if (current.designId && current.dirty) {
        await fetch(`/api/designs/${current.designId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: current.designName, pages: current.pages }),
        }).catch(() => undefined)
      }
      const d = await fetchDesign(row.id)
      // The editor is already mounted, so its pendingDesign effect will not
      // re-run: load the design into the editor store directly.
      loadDesign(d)
      openEditor(d)
      toast({ title: `Opened “${d.name}”` })
    } catch {
      toast({ title: 'Could not open that design', variant: 'destructive' })
    } finally {
      setOpening(null)
    }
  }

  const filtered = (designs ?? []).filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <PanelShell title="Projects" subtitle="Your saved designs" searchPlaceholder="Search your designs" onSearch={setQuery}>
      {designs === null ? (
        <div className="py-10 text-center text-white/40 text-sm">Loading your projects…</div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center">
          <FolderOpen size={28} className="mx-auto text-white/25" />
          <p className="mt-2 text-sm text-white/50">{designs.length === 0 ? 'No saved designs yet' : 'No matches'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {filtered.map((d) => (
            <button
              key={d.id}
              onClick={() => void open(d)}
              disabled={opening !== null}
              className={cn(
                'group text-left rounded-xl overflow-hidden border transition-colors hover:border-[#7630D7] disabled:opacity-60',
                d.id === designId ? 'border-[#02C0CC]' : 'border-white/10'
              )}
              aria-label={`Open design ${d.name}`}
            >
              <div className="aspect-[4/3] bg-[#0F1015] overflow-hidden relative">
                {d.thumbnail ? (
                  <img src={d.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <FolderOpen size={22} />
                  </div>
                )}
                {d.id === designId && (
                  <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-[#02C0CC] text-black px-1.5 py-0.5 rounded-md uppercase">Open</span>
                )}
              </div>
              <div className="px-2 py-1.5 bg-[#16181D]">
                <div className="text-[11px] font-semibold truncate text-white/90">{d.name}</div>
                <div className="text-[9px] text-white/40 flex items-center gap-1">
                  <Clock size={9} /> {new Date(d.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </PanelShell>
  )
}
