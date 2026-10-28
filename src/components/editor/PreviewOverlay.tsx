'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Accessibility, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { pageHoldDuration } from '@/lib/animations'

const PreviewStage = dynamic(() => import('./canvas/preview-stage'), { ssr: false })

type TransitionPhase = 'start' | 'run'

/**
 * Page transition CSS. Direction names the side the incoming page enters
 * FROM (matches the Animate panel labels and the video exporter):
 * left = from left, right = from right, up = from bottom, down = from top.
 *  - incoming: mounts in its "from" state (phase start), then animates to rest
 *  - outgoing: starts at rest, then animates to its "exit" state
 */
function incomingClass(kind: string | undefined, direction: string | undefined, phase: TransitionPhase): string {
  if (phase === 'run') return ''
  switch (kind) {
    case 'fade':
      return 'opacity-0'
    case 'slide':
      switch (direction ?? 'left') {
        case 'right':
          return 'translate-x-full'
        case 'up':
          return 'translate-y-full'
        case 'down':
          return '-translate-y-full'
        default:
          return '-translate-x-full'
      }
    case 'morph':
      return 'opacity-0 scale-95'
    default:
      return ''
  }
}

function outgoingClass(kind: string | undefined, direction: string | undefined, phase: TransitionPhase): string {
  if (phase === 'start') return ''
  switch (kind) {
    case 'slide':
      switch (direction ?? 'left') {
        case 'right':
          return '-translate-x-full'
        case 'up':
          return '-translate-y-full'
        case 'down':
          return 'translate-y-full'
        default:
          return 'translate-x-full'
      }
    case 'morph':
      return 'opacity-0 scale-110'
    default:
      // fade: the outgoing page stays put while the new one fades in on top
      return ''
  }
}

const TRANSITION_MS = (page: { transition?: { duration?: number } } | undefined) =>
  Math.round((page?.transition?.duration ?? 0.7) * 1000)

/** Canva-style fullscreen Preview — animated pages, transitions, autoplay. */
export function PreviewOverlay() {
  const open = useEditorStore((s) => s.previewOpen)
  const setOpen = useEditorStore((s) => s.setPreviewOpen)
  const pages = useEditorStore((s) => s.pages)
  const currentPage = useEditorStore((s) => s.currentPage)
  const width = useEditorStore((s) => s.width)
  const height = useEditorStore((s) => s.height)
  const [index, setIndex] = useState(0)
  /** previous index during a transition (rendered under the new page) */
  const [outgoing, setOutgoing] = useState<number | null>(null)
  const [phase, setPhase] = useState<TransitionPhase>('run')
  const [autoPlay, setAutoPlay] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const [wasOpen, setWasOpen] = useState(open)

  // each time the preview opens, start on the page being edited
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setIndex(currentPage)
      setOutgoing(null)
      setPhase('run')
      setPlayKey((k) => k + 1)
    }
  }

  // clamp when pages shrink — derived at render, no effect needed
  const safeIndex = Math.max(0, Math.min(index, pages.length - 1))

  const goTo = useCallback(
    (nextIdx: number) => {
      const target = Math.max(0, Math.min(nextIdx, pages.length - 1))
      if (target === safeIndex) return
      const tr = pages[target]?.transition
      const animate = !reduceMotion && !!tr && tr.kind !== 'none'
      setOutgoing(animate ? safeIndex : null)
      setPhase(animate ? 'start' : 'run')
      setIndex(target)
      setPlayKey((k) => k + 1)
    },
    [pages, safeIndex, reduceMotion]
  )

  const next = useCallback(
    () => goTo(safeIndex >= pages.length - 1 && autoPlay ? 0 : safeIndex + 1),
    [goTo, safeIndex, pages.length, autoPlay]
  )
  const prev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex])
  const replay = useCallback(() => {
    setOutgoing(null)
    setPhase('run')
    setPlayKey((k) => k + 1)
  }, [])

  // run the transition: flip to the "run" phase after the incoming page has
  // painted in its start state, then drop the outgoing page when it's done
  useEffect(() => {
    if (outgoing === null) return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase('run'))
    })
    const t = setTimeout(() => setOutgoing(null), TRANSITION_MS(pages[safeIndex]) + 60)
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      clearTimeout(t)
    }
  }, [outgoing, playKey, safeIndex, pages])

  // keyboard
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next() }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev() }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0) }
      else if (e.key === 'End') { e.preventDefault(); goTo(pages.length - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, next, prev, goTo, pages.length, setOpen])

  // autoplay: advance after each page's hold duration (loops at the end)
  useEffect(() => {
    if (!open || !autoPlay) return
    const page = pages[safeIndex]
    if (!page) return
    // reduce motion skips transitions but keeps the reading time
    const hold = pageHoldDuration(page) * 1000 + (reduceMotion ? 0 : TRANSITION_MS(page))
    const timer = setTimeout(next, Math.max(400, hold))
    return () => clearTimeout(timer)
  }, [open, autoPlay, safeIndex, pages, next, reduceMotion, playKey])

  if (!open) return null
  const page = pages[safeIndex]
  const outgoingPage = outgoing !== null ? pages[outgoing] : null
  const transitionKind = outgoingPage ? page?.transition?.kind ?? 'none' : 'none'
  const transitionDir = page?.transition?.direction
  const durationMs = TRANSITION_MS(page)
  const inClass = incomingClass(transitionKind, transitionDir, phase)
  const outClass = outgoingClass(transitionKind, transitionDir, phase)

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F1015] flex flex-col" role="dialog" aria-label="Design preview">
      <div className="h-14 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/90 px-2">
          Preview <span className="text-white/50 font-normal">— page {safeIndex + 1} of {pages.length}</span>
        </div>
        <div className="flex items-center gap-1">
          {pages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className={cn('rounded-full text-white hover:bg-white/15 hover:text-white', autoPlay && 'bg-white/15')}
              onClick={() => setAutoPlay((v) => !v)}
              aria-label={autoPlay ? 'Pause autoplay' : 'Play presentation'}
              title={autoPlay ? 'Pause' : 'Auto-play'}
            >
              {autoPlay ? <Pause size={17} /> : <Play size={17} />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-white/15 hover:text-white"
            onClick={replay}
            aria-label="Replay animations"
            title="Replay animations"
          >
            <RotateCcw size={17} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn('rounded-full text-white hover:bg-white/15 hover:text-white', reduceMotion && 'bg-white/15 text-[#02C0CC] hover:text-[#02C0CC]')}
            onClick={() => setReduceMotion((v) => !v)}
            aria-label="Reduce motion"
            aria-pressed={reduceMotion}
            title={reduceMotion ? 'Reduce motion: on (animations and transitions skipped)' : 'Reduce motion (accessibility)'}
          >
            <Accessibility size={17} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/15 hover:text-white" onClick={() => setOpen(false)} aria-label="Close preview">
            <X size={19} />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative bg-[#0F1015]">
        <div className="absolute inset-0 p-4 pb-16">
          <div className="relative w-full h-full overflow-hidden max-w-[min(100%,calc((100vh-10rem)*var(--ar)))] mx-auto" style={{ ['--ar' as string]: `${width / height}` }}>
            {/* outgoing page (during a transition) */}
            {outgoingPage && (
              <div
                key={`out-${outgoing}-${playKey}`}
                className={cn('absolute inset-0 transition-all ease-in-out', outClass)}
                style={{ transitionDuration: `${durationMs}ms` }}
              >
                <PreviewStage page={outgoingPage} designWidth={width} designHeight={height} animated={false} />
              </div>
            )}
            {/* current page */}
            {page && (
              <div
                key={`in-${page.id}-${playKey}`}
                className={cn('absolute inset-0 transition-all ease-in-out', inClass)}
                style={{ transitionDuration: `${durationMs}ms` }}
              >
                <PreviewStage page={page} designWidth={width} designHeight={height} animated playKey={playKey} reduceMotion={reduceMotion} />
              </div>
            )}
          </div>
        </div>

        {pages.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={safeIndex === 0}
              className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#16171D]/90 text-white flex items-center justify-center hover:bg-[#7630D7] transition-colors disabled:opacity-30 disabled:hover:bg-[#16171D]/90')}
              aria-label="Previous page"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={next}
              disabled={safeIndex === pages.length - 1 && !autoPlay}
              className={cn('absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#16171D]/90 text-white flex items-center justify-center hover:bg-[#7630D7] transition-colors disabled:opacity-30 disabled:hover:bg-[#16171D]/90')}
              aria-label="Next page"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {pages.length > 1 && (
        <div className="h-14 flex items-center justify-center gap-2 shrink-0">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn('h-2 rounded-full transition-all', i === safeIndex ? 'w-7 bg-[#02C0CC]' : 'w-2 bg-white/25 hover:bg-white/50')}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === safeIndex ? 'page' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
