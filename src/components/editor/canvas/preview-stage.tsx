'use client'

import { useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { Layer, Rect, Stage } from 'react-konva'
import type { PageData } from '@/lib/types'
import { gradientProps } from '@/lib/editor-utils'
import {
  animateElementAt,
  applyAnimationState,
  captureAnimationBase,
  pageAnimationDuration,
  pageHasLoopingAnimation,
  restoreAnimationBase,
  type AnimationNodeBase,
} from '@/lib/animations'
import { PreviewElements } from './element-node'

interface PreviewStageProps {
  page: PageData
  designWidth: number
  designHeight: number
  /** v0.5: play element animations (preview mode). Off by default so
   *  thumbnails (page bar, dashboard, templates) stay static. */
  animated?: boolean
  /** reset the timeline (bump = restart) */
  playKey?: number
  /** reduce-motion accessibility — jumps to the final state */
  reduceMotion?: boolean
}

/**
 * Renders one page of a design, scaled to fit its parent box. Non-interactive,
 * clipped to page bounds. When `animated`, runs a rAF timeline that applies
 * entry animations to the element nodes (never mutates the document).
 */
export default function PreviewStage({ page, designWidth, designHeight, animated = false, playKey = 0, reduceMotion = false }: PreviewStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<Konva.Layer | null>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect
      setSize({ w: r.width, h: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scale = size.w > 0 && size.h > 0 ? Math.min(size.w / designWidth, size.h / designHeight) : 0
  const offsetX = size.w > 0 ? (size.w - designWidth * scale) / 2 : 0
  const offsetY = size.h > 0 ? (size.h - designHeight * scale) / 2 : 0

  const bg = page.background
  const bgProps =
    bg.type === 'gradient'
      ? gradientProps(bg.from, bg.to, bg.angle, designWidth, designHeight)
      : { fill: bg.color }

  // ── v0.5: element animation playback (rAF timeline over Konva nodes) ──
  const hasAnimations = animated && page.elements.some((e) => e.animation && e.animation.kind !== 'none')
  // the Stage only mounts once the container is measured — re-run then, or playback never starts
  const stageReady = scale > 0
  useEffect(() => {
    const layer = layerRef.current
    const stage = stageRef.current
    if (!stageReady || !layer || !stage) return
    if (!hasAnimations || reduceMotion) {
      // static: nodes already sit at their final (document) state
      layer.batchDraw()
      return
    }

    // look up by id with a predicate — `#id` selectors break on ids with
    // selector characters (spaces, commas, dots)
    const findNode = (id: string) => layer.findOne((n: Konva.Node) => n.id() === id)
    const animatable = page.elements.filter((e) => e.visible && e.animation && e.animation.kind !== 'none')
    // capture base attrs once per play
    const tracks: { el: (typeof animatable)[number]; node: Konva.Node; base: AnimationNodeBase }[] = []
    for (const el of animatable) {
      const node = findNode(el.id)
      if (!node) continue
      tracks.push({ el, node, base: captureAnimationBase(node, el) })
    }

    const start = performance.now()
    const total = pageAnimationDuration(page) + 0.1
    // breathe loops forever — keep the clock running while the preview is open
    const loops = pageHasLoopingAnimation(page)
    let raf = 0
    let stopped = false

    const tick = (now: number) => {
      if (stopped) return
      const elapsed = Math.max(0, (now - start) / 1000)
      const t = loops ? elapsed : Math.min(elapsed, total)
      for (const { el, node, base } of tracks) {
        const state = animateElementAt(el, t)
        applyAnimationState(node, base, state, el.animation?.direction)
      }
      layer.batchDraw()
      if (loops || t < total) raf = requestAnimationFrame(tick)
    }
    // first frame synchronously — otherwise elements flash at their final state
    tick(start)
    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      for (const { node, base } of tracks) restoreAnimationBase(node, base)
      layer.batchDraw()
    }
  }, [page, hasAnimations, reduceMotion, playKey, designWidth, designHeight, stageReady])

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden" data-testid="preview-stage">
      {scale > 0 && (
        <Stage ref={stageRef} width={size.w} height={size.h}>
          <Layer listening={false} x={offsetX} y={offsetY} scale={{ x: scale, y: scale }}>
            <Rect width={designWidth} height={designHeight} {...bgProps} />
          </Layer>
          <Layer
            ref={layerRef}
            listening={false}
            x={offsetX}
            y={offsetY}
            scale={{ x: scale, y: scale }}
            clip={{ x: 0, y: 0, width: designWidth, height: designHeight }}
          >
            <PreviewElements elements={page.elements} />
          </Layer>
          {/* v0.6: embed cards are clickable in preview — open in a new tab */}
          <Layer x={offsetX} y={offsetY} scale={{ x: scale, y: scale }}>
            {page.elements
              .filter((el): el is import('@/lib/types').EmbedElement => el.type === 'embed' && el.visible)
              .map((el) => (
                <Rect
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  fill="transparent"
                  cursor="pointer"
                  onClick={() => window.open(el.url, '_blank', 'noopener,noreferrer')}
                  onTap={() => window.open(el.url, '_blank', 'noopener,noreferrer')}
                />
              ))}
          </Layer>
        </Stage>
      )}
    </div>
  )
}
