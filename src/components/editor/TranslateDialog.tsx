'use client'

import { useMemo, useState } from 'react'
import { Languages, Loader2, Globe, Check, AlertTriangle, Search, RotateCcw, Type, Maximize2, MousePointer2, ChevronDown } from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { useAICapabilities } from '@/hooks/use-ai-capabilities'
import { LANGUAGES, collectUnits, currentLanguage, isTranslated, restoreOriginal, type Language } from '@/lib/translate'
import { prepareRestore, translateDesign, TranslateError, type TranslateProgress } from '@/lib/translate-client'

const RECENT_KEY = 'cv-translate-recent'
const POPULAR = ['en', 'ur', 'ar', 'hi', 'es', 'fr', 'zh', 'tr']

function readRecent(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string').slice(0, 4) : []
  } catch {
    return []
  }
}
function pushRecent(code: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([code, ...readRecent().filter((c) => c !== code)].slice(0, 4)))
  } catch { /* storage blocked — recents are a convenience only */ }
}

/** Restore the design to its pre-translation text, fonts and layout (one undo step). */
export async function restoreDesignOriginal() {
  const { pages, replacePagesForTranslate } = useEditorStore.getState()
  if (!isTranslated(pages)) return
  await prepareRestore(pages)
  replacePagesForTranslate(restoreOriginal(useEditorStore.getState().pages))
  toast({ title: 'Original restored', description: 'Text, fonts and alignment are back. Ctrl+Z to undo.' })
}

/** Canva "Translate" — AI-translate every text in the design, with one-click restore. */
export function TranslateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const pages = useEditorStore((s) => s.pages)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const replacePagesForTranslate = useEditorStore((s) => s.replacePagesForTranslate)
  const [lang, setLang] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [fixFonts, setFixFonts] = useState(true)
  const [autoFit, setAutoFit] = useState(true)
  const [onlySelection, setOnlySelection] = useState(false)
  const [progress, setProgress] = useState<TranslateProgress | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const { loaded: aiLoaded, configured: aiConfigured } = useAICapabilities()
  const aiMissing = aiLoaded && !aiConfigured
  const busy = progress !== null

  const translated = useMemo(() => isTranslated(pages), [pages])
  const shown = useMemo(() => currentLanguage(pages), [pages])
  const scope = useMemo(
    () => (onlySelection && selectedIds.length ? new Set(selectedIds) : undefined),
    [onlySelection, selectedIds]
  )
  const count = useMemo(() => collectUnits(pages, scope).length, [pages, scope])
  const picked = LANGUAGES.find((l) => l.code === lang) ?? null

  const handleOpenChange = (v: boolean) => {
    if (busy) return
    if (v) {
      setRecent(readRecent())
      setOnlySelection(false)
    }
    onOpenChange(v)
  }

  const q = query.trim().toLowerCase()
  const filtered = LANGUAGES.filter(
    (l) => !q || l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q) || l.code.toLowerCase() === q
  )
  const quick = [...new Set([...recent, ...POPULAR])]
    .map((c) => LANGUAGES.find((l) => l.code === c))
    .filter((l): l is Language => !!l)
    .slice(0, 8)

  const run = async () => {
    if (!picked || busy || aiMissing || !count) return
    setProgress({ done: 0, total: count })
    try {
      const res = await translateDesign(useEditorStore.getState().pages, picked, {
        fixFonts,
        autoFit,
        onlyIds: scope,
        onProgress: setProgress,
      })
      if (!res.translated) {
        toast({ title: 'Translate failed', description: 'The AI did not return any text. Please try again.', variant: 'destructive' })
        return
      }
      replacePagesForTranslate(res.pages)
      pushRecent(picked.code)
      toast({
        title: `Translated to ${picked.native}`,
        description: res.failed
          ? `${res.translated} of ${res.total} texts updated — ${res.failed} could not be translated. Run Translate again to retry them.`
          : `All ${res.total} text${res.total === 1 ? '' : 's'} updated. Use “Show original” in the top bar to switch back.`,
        variant: res.failed ? 'destructive' : undefined,
      })
      onOpenChange(false)
    } catch (e) {
      const msg = e instanceof TranslateError ? e.message : 'Translate is unavailable right now.'
      toast({ title: 'Translate failed', description: msg, variant: 'destructive' })
    } finally {
      setProgress(null)
    }
  }

  const restore = async () => {
    await restoreDesignOriginal()
    onOpenChange(false)
  }

  const pct = progress && progress.total ? Math.round((progress.done / progress.total) * 100) : 0

  const langButton = (l: Language, compact = false) => {
    const active = lang === l.code
    const current = shown?.code === l.code
    return (
      <button
        key={l.code}
        onClick={() => setLang(active ? null : l.code)}
        aria-pressed={active}
        disabled={busy}
        className={cn(
          'flex items-center justify-between gap-2 rounded-xl border text-left transition-all',
          compact ? 'px-2.5 py-1.5' : 'px-3 py-2.5',
          active
            ? 'bg-[#7630D7] border-transparent shadow-[0_6px_20px_-6px_rgba(118,48,215,0.7)]'
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        )}
      >
        <span className="min-w-0">
          <span dir={l.rtl ? 'rtl' : undefined} className={cn('block font-semibold truncate', compact ? 'text-[12px]' : 'text-[13px]')}>{l.native}</span>
          {!compact && (
            <span className={cn('block text-[10.5px] truncate', active ? 'text-white/80' : 'text-white/45')}>
              {l.name}{current ? ' · showing now' : ''}
            </span>
          )}
        </span>
        {active ? <Check size={13} className="shrink-0 text-white/90" /> : current && <span className="w-1.5 h-1.5 rounded-full bg-[#02C0CC] shrink-0" />}
      </button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-[28px] bg-[#16181D] border-white/10 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Languages size={17} className="text-[#02C0CC]" /> Translate design
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {count
              ? `${count} text${count === 1 ? '' : 's'}${scope ? ' in your selection' : ` across ${pages.length} page${pages.length === 1 ? '' : 's'}`} — headings, body, table cells and link cards. Layout stays intact; you can always switch back.`
              : 'This design has no text to translate yet.'}
          </DialogDescription>
        </DialogHeader>

        {translated && (
          <div className="rounded-2xl border border-[#02C0CC]/30 bg-[#02C0CC]/10 px-3.5 py-2.5 flex items-center gap-3">
            <Globe size={16} className="text-[#02C0CC] shrink-0" />
            <div className="min-w-0 text-[12.5px] leading-snug">
              <div className="font-semibold">Showing {shown ? `${shown.native} (${shown.name})` : 'a translation'}</div>
              <div className="text-white/55">The original is kept safe — restore it any time.</div>
            </div>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void restore()} className="ml-auto h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-white gap-1.5 shrink-0">
              <RotateCcw size={13} /> Show original
            </Button>
          </div>
        )}

        {aiMissing && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-[12px] text-amber-100 flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-300" />
            <span>
              <span className="font-semibold">AI unavailable.</span> Translate is temporarily unavailable. Your design
              is unchanged.
            </span>
          </div>
        )}

        {busy ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <Loader2 size={26} className="animate-spin text-[#02C0CC]" />
            <div className="text-sm font-semibold">Translating to {picked?.native}…</div>
            <div className="w-full max-w-xs h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#02C0CC] to-[#7630D7] transition-[width] duration-300" style={{ width: `${Math.max(4, pct)}%` }} />
            </div>
            <div className="text-[11.5px] text-white/50">{progress?.done ?? 0} of {progress?.total ?? 0} texts</div>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${LANGUAGES.length} languages`}
                className="w-full h-10 rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 text-[13px] outline-none focus:border-[#7630D7] placeholder:text-white/35"
                aria-label="Search languages"
              />
            </div>

            {!q && (
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-white/40 font-semibold mb-1.5">{recent.length ? 'Recent & popular' : 'Popular'}</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {quick.map((l) => langButton(l, true))}
                </div>
              </div>
            )}

            <div className="max-h-[30vh] overflow-y-auto cv-scroll pr-1">
              {!q && <div className="text-[10.5px] uppercase tracking-wider text-white/40 font-semibold mb-1.5">All languages</div>}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {filtered.map((l) => langButton(l))}
              </div>
              {!filtered.length && <p className="text-center text-[12px] text-white/45 py-6">No language matches “{query}”.</p>}
            </div>

            <div className="rounded-2xl bg-white/[0.04] border border-white/10 divide-y divide-white/10">
              <label className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer">
                <Type size={14} className="text-white/55 shrink-0" />
                <span className="text-[12.5px] min-w-0">
                  <span className="font-semibold block">Match fonts to the script</span>
                  <span className="text-white/45 text-[11px]">Switches to a font that has Urdu, Arabic, Hindi, Chinese… letters</span>
                </span>
                <Switch checked={fixFonts} onCheckedChange={setFixFonts} className="ml-auto" />
              </label>
              <label className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer">
                <Maximize2 size={14} className="text-white/55 shrink-0" />
                <span className="text-[12.5px] min-w-0">
                  <span className="font-semibold block">Auto-fit text</span>
                  <span className="text-white/45 text-[11px]">Shrinks longer translations so they stay inside their box</span>
                </span>
                <Switch checked={autoFit} onCheckedChange={setAutoFit} className="ml-auto" />
              </label>
              {selectedIds.length > 0 && (
                <label className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer">
                  <MousePointer2 size={14} className="text-white/55 shrink-0" />
                  <span className="text-[12.5px] min-w-0">
                    <span className="font-semibold block">Selected elements only</span>
                    <span className="text-white/45 text-[11px]">{selectedIds.length} selected — leave off to translate the whole design</span>
                  </span>
                  <Switch checked={onlySelection} onCheckedChange={setOnlySelection} className="ml-auto" />
                </label>
              )}
            </div>
          </>
        )}

        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] text-white/45 flex items-center gap-1.5 min-w-0">
            <Globe size={12} className="shrink-0" />
            {picked ? `Target: ${picked.native}` : 'Pick a language'}
          </span>
          <Button
            className="btn-cv h-11 rounded-xl ml-auto px-5"
            disabled={!picked || !count || busy || aiMissing}
            onClick={() => void run()}
          >
            {busy ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <Languages size={15} className="mr-1.5" />}
            {busy ? `Translating… ${pct}%` : 'Translate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Top-bar language switcher — always one click back to the original. */
export function TranslateChip({ onOpenDialog, className }: { onOpenDialog: () => void; className?: string }) {
  const pages = useEditorStore((s) => s.pages)
  const translated = useMemo(() => isTranslated(pages), [pages])
  const shown = useMemo(() => currentLanguage(pages), [pages])
  const item = "gap-2 text-white focus:bg-white/10 focus:text-white [&_svg:not([class*='text-'])]:text-white/70"

  if (!translated) {
    return (
      <button onClick={onOpenDialog} className={className} aria-label="Translate design" title="Translate design">
        <Languages size={14} /> <span className="hidden lg:inline">Translate</span>
      </button>
    )
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(className, 'bg-white/15')} aria-label="Design language">
          <Globe size={14} />
          <span dir={shown?.rtl ? 'rtl' : undefined} className="max-w-[90px] truncate">{shown?.native ?? 'Translated'}</span>
          <ChevronDown size={12} className="opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 bg-[#16181D] border-white/10 text-white">
        <div className="px-2 py-1.5 text-[11px] text-white/50">Showing {shown ? `${shown.native} · ${shown.name}` : 'a translation'}</div>
        <DropdownMenuItem className={item} onClick={() => void restoreDesignOriginal()}>
          <RotateCcw size={15} /> Show original
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className={item} onClick={onOpenDialog}>
          <Languages size={15} /> Translate to another language…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
