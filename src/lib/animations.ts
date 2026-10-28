// ─────────────────────────────────────────────────────────────
// Canvix animation engine (v0.5)
//
// Pure functions of time — completely independent from Konva.
// The same engine drives: editor preview playback, PreviewOverlay
// page playback + transitions, and video export frame rendering.
// Static exports (PNG/JPG/PDF/SVG) ignore animations entirely.
// ─────────────────────────────────────────────────────────────

import type {
  AnimationEasing,
  AnimationKind,
  AnyElement,
  ElementAnimation,
  PageData,
} from '@/lib/types'

// ── easings ──────────────────────────────────────────────────

export function applyEasing(t: number, easing: AnimationEasing): number {
  switch (easing) {
    case 'linear':
      return t
    case 'easeIn':
      return t * t * t
    case 'easeOut':
      return 1 - Math.pow(1 - t, 3)
    case 'easeInOut':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    case 'spring': {
      // damped spring approximation
      const c = 2 * Math.PI * 0.9 // frequency
      const decay = 4.5
      return 1 - Math.exp(-decay * t) * Math.cos(c * t)
    }
    default:
      return t
  }
}

// ── per-element animation state at time t ────────────────────

export interface AnimatedElementState {
  /** 0..1 multiplier over the element's base opacity */
  opacity: number
  /** page-space translation deltas */
  dx: number
  dy: number
  /** scale multipliers (relative to base size) */
  scaleX: number
  scaleY: number
  /** additional rotation in degrees */
  rotation: number
  /** wipe reveal: 0..1 fraction of the width visible from the anchor edge */
  reveal: number
}

const IDENTITY: AnimatedElementState = {
  opacity: 1,
  dx: 0,
  dy: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  reveal: 1,
}

/** Travel distance for pan/rise — relative to element size / page. */
function travelDistance(el: { width: number; height: number }): { x: number; y: number } {
  return { x: Math.max(80, el.width * 0.35), y: Math.max(80, el.height * 0.35) }
}

/**
 * Compute an element's animated state at time `t` (seconds since the page
 * was shown). Returns IDENTITY when the animation is finished or absent.
 */
export function animateElementAt(
  el: { width: number; height: number; animation?: ElementAnimation },
  t: number
): AnimatedElementState {
  const a = el.animation
  if (!a || a.kind === 'none' || a.kind === undefined) return IDENTITY

  const local = t - (a.delay || 0)
  if (local <= 0) {
    // before the animation starts: element is at its "from" state (hidden)
    return startState(el, a)
  }
  const dur = Math.max(0.05, a.duration || 0.9)
  if (a.kind === 'breathe') {
    // continuous loop — scale pulse 1 → 1.04 → 1
    const phase = (local % dur) / dur
    const s = 1 + 0.04 * Math.sin(phase * Math.PI * 2)
    return { ...IDENTITY, scaleX: s, scaleY: s }
  }
  if (local >= dur) return IDENTITY

  const p = applyEasing(local / dur, a.easing || 'easeOut')
  const inv = 1 - p
  const travel = travelDistance(el)
  const dir = a.direction ?? 'up'

  switch (a.kind) {
    case 'fade':
      return { ...IDENTITY, opacity: p }
    case 'rise': {
      // rise = travel in from the chosen side + fade in (default: up from below)
      const off = entryOffset(dir, travel)
      return { ...IDENTITY, opacity: p, dx: inv * off.dx, dy: inv * off.dy }
    }
    case 'pan': {
      const off = entryOffset(dir, travel)
      return { ...IDENTITY, dx: inv * off.dx, dy: inv * off.dy }
    }
    case 'pop': {
      // overshoot springy scale-in
      const s = 0.6 + 0.4 * p * (1 + 0.25 * Math.sin(p * Math.PI))
      return { ...IDENTITY, scaleX: s, scaleY: s, opacity: Math.min(1, p * 1.6) }
    }
    case 'wipe': {
      // reveal from the anchor edge (scale-on-one-axis approximation)
      return { ...IDENTITY, reveal: p, opacity: 1 }
    }
    case 'zoom': {
      const s = 0.65 + 0.35 * p
      return { ...IDENTITY, scaleX: s, scaleY: s, opacity: p }
    }
    case 'rotate': {
      const s = Math.max(0.1, 0.8 + 0.2 * p)
      return { ...IDENTITY, rotation: inv * (dir === 'left' ? -90 : 90), opacity: p, scaleX: s, scaleY: s }
    }
    default:
      return IDENTITY
  }
}

/**
 * Start offset for directional entries. Direction names the side the element
 * comes FROM, matching the panel labels: left = from left, right = from right,
 * up = from bottom (moves up), down = from top (moves down).
 */
function entryOffset(dir: ElementAnimation['direction'], travel: { x: number; y: number }): { dx: number; dy: number } {
  switch (dir) {
    case 'left':
      return { dx: -travel.x, dy: 0 }
    case 'right':
      return { dx: travel.x, dy: 0 }
    case 'down':
      return { dx: 0, dy: -travel.y }
    case 'up':
    default:
      return { dx: 0, dy: travel.y }
  }
}

/** the state an element sits in before its animation starts */
function startState(
  el: { width: number; height: number },
  a: ElementAnimation
): AnimatedElementState {
  const travel = travelDistance(el)
  const dir = a.direction ?? 'up'
  switch (a.kind) {
    case 'fade':
    case 'rise':
    case 'zoom':
    case 'pop':
    case 'rotate':
      return { ...IDENTITY, opacity: 0 }
    case 'pan': {
      const off = entryOffset(dir, travel)
      return { ...IDENTITY, dx: off.dx, dy: off.dy }
    }
    case 'wipe':
      return { ...IDENTITY, reveal: 0 }
    case 'breathe':
      return IDENTITY
    default:
      return IDENTITY
  }
}

// ── timing helpers ───────────────────────────────────────────

/** Total playback time of a page's element animations (seconds). */
export function pageAnimationDuration(page: PageData): number {
  let max = 0
  for (const el of page.elements) {
    const a = el.animation
    if (!a || a.kind === 'none') continue
    if (a.kind === 'breathe') continue // looping — does not extend the timeline
    max = Math.max(max, (a.delay || 0) + Math.max(0.05, a.duration || 0.9))
  }
  return max
}

/** Minimum seconds a page stays visible in autoplay (canva-like pacing). */
export function pageHoldDuration(page: PageData): number {
  const anim = pageAnimationDuration(page)
  const complexity = Math.min(4, page.elements.length / 4)
  return Math.max(2.2, anim + 0.8 + complexity * 0.4)
}

// ── Magic Animate — deterministic one-click animation pass ──

const HEADING_FONT_RATIO = 0.06 // fontSize > 6% of page height = heading

/**
 * Magic Animate: assign tasteful entry animations to every element of a page
 * (deterministic — no AI needed). Layout-aware rules:
 *   - large text (headline) → rise, slight delay
 *   - body text → fade
 *   - images → pan (from the nearest edge) or zoom
 *   - shapes/decorations → pop / breathe
 *   - page transition → fade
 * Elements keep relative order: delay scales with stacking order.
 */
export function magicAnimatePage(
  page: PageData,
  pageHeight: number,
  speed: 'slow' | 'medium' | 'fast' = 'medium',
  pageWidth = 1080
): PageData {
  const base = speed === 'slow' ? 1.25 : speed === 'fast' ? 0.7 : 1
  let delayCursor = 0
  const elements = page.elements.map((el) => {
    const anim = magicAnimationFor(el, pageHeight, pageWidth, base, delayCursor)
    if (anim) delayCursor = Math.min(delayCursor + 0.12 * base, 1.4)
    return anim ? { ...el, animation: anim } : { ...el, animation: undefined }
  })
  return {
    ...page,
    elements,
    transition: { kind: 'fade', duration: 0.7 },
  }
}

function magicAnimationFor(
  el: AnyElement,
  pageHeight: number,
  pageWidth: number,
  base: number,
  delay: number
): ElementAnimation | undefined {
  const duration = 0.8 * base
  const direction = pickDirection(el, pageWidth)

  if (el.type === 'text') {
    const isHeading = el.fontSize / pageHeight > HEADING_FONT_RATIO || el.bold
    return {
      kind: isHeading ? 'rise' : 'fade',
      duration,
      delay: Math.min(delay, isHeading ? 0.1 : 0.5 * base),
      easing: 'easeOut',
      direction: isHeading ? 'up' : undefined,
    }
  }
  if (el.type === 'image' || el.type === 'sticker') {
    return { kind: 'pan', duration: duration * 1.15, delay: Math.min(delay, 0.8 * base), easing: 'easeOut', direction }
  }
  if (el.type === 'rect' || el.type === 'ellipse' || el.type === 'triangle' || el.type === 'star' || el.type === 'path') {
    return { kind: 'pop', duration: duration * 0.9, delay: Math.min(delay, 1.0 * base), easing: 'spring' }
  }
  if (el.type === 'line' || el.type === 'stroke') {
    return { kind: 'wipe', duration, delay: Math.min(delay, 1.1 * base), easing: 'easeOut', direction: 'left' }
  }
  return { kind: 'fade', duration, delay: Math.min(delay, 1.2 * base), easing: 'easeOut' }
}

function pickDirection(el: { x: number; y: number; width: number; height: number }, pageWidth: number): 'left' | 'right' | 'down' {
  // pan in from the nearest edge of the element (direction = side it comes from)
  const distLeft = el.x
  const distRight = Math.abs(pageWidth - (el.x + el.width))
  const distTop = el.y
  const min = Math.min(distLeft, distTop, distRight)
  if (min === distTop) return 'down' // 'down' = enters from the top
  if (min === distLeft) return 'left'
  return 'right'
}

/** Remove animations from every element on a page. */
export function clearPageAnimations(page: PageData): PageData {
  return {
    ...page,
    elements: page.elements.map((el) => ({ ...el, animation: undefined })),
    transition: undefined,
  }
}

/** Human labels for the animation panel. */
export const ANIMATION_KINDS: { kind: AnimationKind; label: string; hint: string }[] = [
  { kind: 'none', label: 'None', hint: 'Remove animation' },
  { kind: 'fade', label: 'Fade', hint: 'Softly fades in' },
  { kind: 'rise', label: 'Rise', hint: 'Floats up into place' },
  { kind: 'pan', label: 'Pan', hint: 'Slides in from an edge' },
  { kind: 'pop', label: 'Pop', hint: 'Springy scale-in' },
  { kind: 'wipe', label: 'Wipe', hint: 'Reveals from an edge' },
  { kind: 'zoom', label: 'Zoom', hint: 'Scales up into view' },
  { kind: 'rotate', label: 'Rotate', hint: 'Spins in' },
  { kind: 'breathe', label: 'Breathe', hint: 'Gently pulses (loops)' },
]

export const TRANSITION_KINDS: { kind: 'none' | 'fade' | 'slide' | 'morph'; label: string; hint: string }[] = [
  { kind: 'none', label: 'None', hint: 'Instant cut' },
  { kind: 'fade', label: 'Fade', hint: 'Crossfade between pages' },
  { kind: 'slide', label: 'Slide', hint: 'Slides across' },
  { kind: 'morph', label: 'Morph', hint: 'Zoom + fade blend' },
]

/** normalize/clamp an incoming animation config (used by store + AI actions) */
export function sanitizeAnimation(input: unknown): ElementAnimation | undefined {
  if (!input || typeof input !== 'object') return undefined
  const a = input as Partial<ElementAnimation>
  const kind = a.kind
  if (!kind || !ANIMATION_KINDS.some((k) => k.kind === kind)) return undefined
  if (kind === 'none') return undefined
  const easing = (['linear', 'easeIn', 'easeOut', 'easeInOut', 'spring'] as const).includes(a.easing as never)
    ? (a.easing as AnimationEasing)
    : 'easeOut'
  const direction = (['left', 'right', 'up', 'down'] as const).includes(a.direction as never)
    ? (a.direction as ElementAnimation['direction'])
    : undefined
  return {
    kind,
    duration: Math.min(4, Math.max(0.1, Number(a.duration) || 0.9)),
    delay: Math.min(5, Math.max(0, Number(a.delay) || 0)),
    easing,
    direction,
  }
}

// ── applying a state to a scene-graph node (Konva-compatible) ──
//
// Structural types only, so this module stays independent from Konva.
// Shared by the preview stage and the video exporter so both play the
// exact same motion: scale/rotation pivot on the element's centre, and
// wipes grow from the edge the element is revealed from.

interface NumAttr {
  (): number
  (v: number): unknown
}

export interface AnimatableNode {
  x: NumAttr
  y: NumAttr
  opacity: NumAttr
  rotation: NumAttr
  scaleX: NumAttr
  scaleY: NumAttr
  offsetX: NumAttr
  offsetY: NumAttr
  getClientRect(config?: { skipTransform?: boolean; skipShadow?: boolean; skipStroke?: boolean }): {
    x: number
    y: number
    width: number
    height: number
  }
}

/** a node's resting attributes + its local (untransformed) bounding box */
export interface AnimationNodeBase {
  x: number
  y: number
  opacity: number
  rotation: number
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
  box: { x: number; y: number; width: number; height: number }
}

export function captureAnimationBase(node: AnimatableNode, fallback: { width: number; height: number }): AnimationNodeBase {
  let box = { x: 0, y: 0, width: fallback.width, height: fallback.height }
  try {
    const r = node.getClientRect({ skipTransform: true, skipShadow: true, skipStroke: true })
    if (Number.isFinite(r.width) && Number.isFinite(r.height) && (r.width > 0 || r.height > 0)) box = r
  } catch {
    /* keep the element-size fallback */
  }
  return {
    x: node.x(),
    y: node.y(),
    opacity: node.opacity(),
    rotation: node.rotation(),
    scaleX: node.scaleX(),
    scaleY: node.scaleY(),
    offsetX: node.offsetX(),
    offsetY: node.offsetY(),
    box,
  }
}

/** node-local point → parent space (Konva order: translate · rotate · scale · −offset) */
function localToParent(
  lx: number,
  ly: number,
  t: { x: number; y: number; rotation: number; scaleX: number; scaleY: number; offsetX: number; offsetY: number }
): { x: number; y: number } {
  const px = (lx - t.offsetX) * t.scaleX
  const py = (ly - t.offsetY) * t.scaleY
  const rad = (t.rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return { x: t.x + px * cos - py * sin, y: t.y + px * sin + py * cos }
}

/** Apply an animated state to a node, relative to its captured base. */
export function applyAnimationState(
  node: AnimatableNode,
  base: AnimationNodeBase,
  state: AnimatedElementState,
  direction: ElementAnimation['direction']
): void {
  const b = base.box
  let sx = base.scaleX * state.scaleX
  let sy = base.scaleY * state.scaleY
  // pivot: element centre, or the anchor edge for a wipe
  let ax = b.x + b.width / 2
  let ay = b.y + b.height / 2
  if (state.reveal < 1) {
    const r = Math.max(0.001, state.reveal)
    switch (direction) {
      case 'right':
        ax = b.x + b.width
        sx *= r
        break
      case 'up': // from bottom
        ay = b.y + b.height
        sy *= r
        break
      case 'down': // from top
        ay = b.y
        sy *= r
        break
      case 'left':
      default:
        ax = b.x
        sx *= r
    }
  }
  const rotation = base.rotation + state.rotation
  const pivot = localToParent(ax, ay, base)
  const rel = localToParent(ax, ay, { x: 0, y: 0, rotation, scaleX: sx, scaleY: sy, offsetX: base.offsetX, offsetY: base.offsetY })
  node.opacity(base.opacity * Math.min(1, Math.max(0, state.opacity)))
  node.rotation(rotation)
  node.scaleX(sx)
  node.scaleY(sy)
  node.x(pivot.x + state.dx - rel.x)
  node.y(pivot.y + state.dy - rel.y)
}

/** Restore a node to its captured resting attributes. */
export function restoreAnimationBase(node: AnimatableNode, base: AnimationNodeBase): void {
  node.opacity(base.opacity)
  node.x(base.x)
  node.y(base.y)
  node.rotation(base.rotation)
  node.scaleX(base.scaleX)
  node.scaleY(base.scaleY)
  node.offsetX(base.offsetX)
  node.offsetY(base.offsetY)
}

/** true when a page has a looping (breathe) animation that never "finishes" */
export function pageHasLoopingAnimation(page: PageData): boolean {
  return page.elements.some((el) => el.animation?.kind === 'breathe')
}
