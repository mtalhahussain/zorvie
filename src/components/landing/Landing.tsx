'use client'

import type { CSSProperties, ReactNode } from 'react'
import { ArrowRight, MousePointer2, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Logo } from '@/components/logo'

// ── Small pieces ─────────────────────────────────────────────

/** Selection frame with corner handles — the editor's "this is selected" look. */
function Selected({ children, color = 'var(--zv-violet)', className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <span className="absolute -inset-x-2 -inset-y-1 border-[1.5px] pointer-events-none" style={{ borderColor: color }} aria-hidden="true">
        {['-top-[5px] -left-[5px]', '-top-[5px] -right-[5px]', '-bottom-[5px] -left-[5px]', '-bottom-[5px] -right-[5px]'].map((pos) => (
          <span key={pos} className={`absolute ${pos} h-2.5 w-2.5 bg-white border-[1.5px]`} style={{ borderColor: color }} />
        ))}
      </span>
    </span>
  )
}

function Cursor({ name, color, className = '', style }: { name: string; color: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={`absolute flex items-start gap-0.5 pointer-events-none ${className}`} style={style} aria-hidden="true">
      <MousePointer2 size={18} style={{ fill: color, color }} />
      <span className="mt-3.5 rounded-full px-2 py-0.5 zv-mono text-[10px] font-semibold text-white" style={{ background: color }}>
        {name}
      </span>
    </div>
  )
}

function Star({ className = '', fill = 'var(--zv-sun)' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" fill={fill} stroke="var(--zv-ink)" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

const pressBtn =
  'zv-press h-12 px-6 rounded-full border-2 border-[var(--zv-ink)] font-bold inline-flex items-center gap-2'

// ── Hero preview — the editor, mid-edit ──────────────────────

function EditorPreview() {
  return (
    <div className="relative zv-drop" style={{ animationDelay: '0.35s' }} aria-hidden="true">
      <div className="rounded-2xl border-2 border-[var(--zv-ink)] bg-white overflow-hidden shadow-[10px_10px_0_var(--zv-ink)]">
        {/* window bar */}
        <div className="h-11 flex items-center gap-3 px-4 border-b-2 border-[var(--zv-ink)] bg-[var(--zv-lemon-soft)]">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-red)]" />
            <span className="h-3 w-3 rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-sun)]" />
            <span className="h-3 w-3 rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-teal)]" />
          </div>
          <span className="zv-mono text-[10px] uppercase font-semibold">Spring poster · A3</span>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 zv-mono text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--zv-teal)]" /> 3 editing
          </span>
        </div>

        <div className="grid grid-cols-[44px_1fr] md:grid-cols-[56px_1fr_200px]">
          {/* tool rail */}
          <div className="border-r-2 border-[var(--zv-ink)] py-4 flex flex-col items-center gap-3">
            {['T', '◯', '▢', '★', '↗'].map((g, i) => (
              <span
                key={g}
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-[13px] font-bold ${i === 0 ? 'bg-[var(--zv-orange)] border-2 border-[var(--zv-ink)]' : 'text-[var(--zv-muted)]'}`}
              >
                {g}
              </span>
            ))}
          </div>

          {/* canvas */}
          <div
            className="p-5 sm:p-10 flex items-center justify-center h-[320px] sm:h-[480px]"
            style={{ backgroundImage: 'radial-gradient(var(--zv-line) 1px, transparent 1px)', backgroundSize: '18px 18px', backgroundColor: 'var(--zv-paper)' }}
          >
            <div className="relative h-full aspect-[3/4] bg-[var(--zv-ink)] text-[var(--zv-paper)] p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[0_20px_40px_-20px_rgba(23,19,15,0.6)]">
              <div className="absolute -right-[18%] top-[14%] w-[78%] aspect-square rounded-full bg-[var(--zv-orange)]" />
              <div className="absolute left-[8%] top-[38%] w-[34%] aspect-square rounded-full bg-[var(--zv-pink)] mix-blend-screen" />
              <Star className="absolute left-[10%] top-[12%] w-[16%] zv-spin-slow" />
              <div className="relative flex justify-between zv-mono text-[8px] sm:text-[9px] uppercase opacity-70">
                <span>No. 04</span>
                <span>21 Mar</span>
              </div>
              <div className="relative">
                <Selected color="var(--zv-sky)">
                  <span className="zv-display block text-[26px] sm:text-[44px] leading-[0.88]">
                    Spring
                    <br />
                    <span className="italic text-[var(--zv-sun)]">Market</span>
                  </span>
                </Selected>
                <div className="mt-3 zv-mono text-[7px] sm:text-[9px] uppercase opacity-70">Old Town Square · 10–6</div>
              </div>
            </div>
          </div>

          {/* layers panel */}
          <div className="hidden md:flex flex-col border-l-2 border-[var(--zv-ink)] p-4 gap-2 bg-white">
            <span className="zv-mono text-[10px] uppercase text-[var(--zv-muted)] mb-1">Layers</span>
            {[
              { n: 'Headline', c: 'var(--zv-sky)', on: true },
              { n: 'Star', c: 'var(--zv-sun)' },
              { n: 'Pink circle', c: 'var(--zv-pink)' },
              { n: 'Sun', c: 'var(--zv-orange)' },
              { n: 'Background', c: 'var(--zv-ink)' },
            ].map((l) => (
              <div
                key={l.n}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-semibold ${l.on ? 'bg-[var(--zv-sky-soft)] border-2 border-[var(--zv-ink)]' : ''}`}
              >
                <span className="h-3.5 w-3.5 rounded border-[1.5px] border-[var(--zv-ink)]" style={{ background: l.c }} />
                {l.n}
              </div>
            ))}
            <span className="zv-mono text-[10px] uppercase text-[var(--zv-muted)] mt-4 mb-1">Palette</span>
            <div className="flex gap-1.5">
              {['--zv-orange', '--zv-pink', '--zv-sun', '--zv-violet', '--zv-teal'].map((c) => (
                <span key={c} className="h-6 w-6 rounded-full border-2 border-[var(--zv-ink)]" style={{ background: `var(${c})` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Cursor name="Sara" color="var(--zv-pink)" className="right-[30%] bottom-[18%] animate-float" />
      <Cursor name="Omar" color="var(--zv-teal)" className="left-[24%] top-[30%] animate-float" style={{ animationDelay: '-3s' }} />
    </div>
  )
}

// ── Feature demos ────────────────────────────────────────────

function DemoTemplates() {
  const tiles = ['var(--zv-orange)', 'var(--zv-ink)', 'var(--zv-sun)', 'var(--zv-violet)', 'var(--zv-paper)', 'var(--zv-pink)']
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[220px]">
      {tiles.map((c, i) => (
        <span key={i} className="aspect-[4/5] rounded-md border-2 border-[var(--zv-ink)] transition-transform duration-300 group-hover:-translate-y-1" style={{ background: c, transitionDelay: `${i * 40}ms` }} />
      ))}
    </div>
  )
}

function DemoType() {
  return (
    <div className="flex items-end gap-3 leading-none">
      <span className="zv-display text-[72px] italic">Aa</span>
      <span className="text-[56px] font-extrabold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Aa</span>
      <span className="text-[52px] text-[var(--zv-violet)]" style={{ fontFamily: "'Pacifico', cursive" }}>Aa</span>
    </div>
  )
}

function DemoTranslate() {
  return (
    <div className="flex flex-col gap-2 w-full max-w-[240px]">
      <span className="self-start rounded-xl rounded-bl-sm bg-white border-2 border-[var(--zv-ink)] px-3 py-1.5 font-bold">Grand opening</span>
      <span className="self-end rounded-xl rounded-br-sm bg-[var(--zv-teal)] text-white border-2 border-[var(--zv-ink)] px-3 py-1 text-[20px]" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }} dir="rtl" lang="ur">
        شاندار افتتاح
      </span>
      <span className="self-start rounded-xl rounded-bl-sm bg-white border-2 border-[var(--zv-ink)] px-3 py-1.5 font-bold" dir="rtl" lang="ar" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
        الافتتاح الكبير
      </span>
    </div>
  )
}

function DemoResize() {
  return (
    <div className="relative h-[110px] w-[180px]">
      <span className="absolute left-0 bottom-0 h-[110px] w-[62px] rounded-md border-2 border-[var(--zv-ink)] bg-[var(--zv-pink)] transition-transform duration-500 group-hover:-rotate-6" />
      <span className="absolute left-[50px] bottom-0 h-[78px] w-[78px] rounded-md border-2 border-[var(--zv-ink)] bg-[var(--zv-sun)] transition-transform duration-500 group-hover:rotate-3" />
      <span className="absolute left-[110px] bottom-0 h-[44px] w-[74px] rounded-md border-2 border-[var(--zv-ink)] bg-[var(--zv-sky)] transition-transform duration-500 group-hover:rotate-6" />
    </div>
  )
}

function DemoCollab() {
  return (
    <div className="relative h-[110px] w-full max-w-[240px]">
      <div className="absolute left-0 top-2 rounded-xl rounded-tl-sm bg-white border-2 border-[var(--zv-ink)] px-3 py-2 text-[13px] font-semibold max-w-[170px]">
        Bigger logo? 👀
      </div>
      <Cursor name="Ali" color="var(--zv-violet)" className="right-8 top-0" />
      <Cursor name="Hina" color="var(--zv-orange)" className="right-20 bottom-0 transition-transform duration-500 group-hover:translate-x-6" />
    </div>
  )
}

function DemoExport() {
  return (
    <div className="flex flex-wrap gap-2 max-w-[240px]">
      {['PNG', 'JPG', 'PDF', 'SVG', 'MP4'].map((f, i) => (
        <span
          key={f}
          className="zv-mono text-[13px] font-bold rounded-full border-2 border-[var(--zv-ink)] px-3 py-1 bg-white transition-colors group-hover:bg-[var(--zv-ink)] group-hover:text-[var(--zv-paper)]"
          style={{ transitionDelay: `${i * 50}ms` }}
        >
          .{f.toLowerCase()}
        </span>
      ))}
    </div>
  )
}

// ── Content ──────────────────────────────────────────────────

const FORMATS = ['Social posts', 'Stories', 'Presentations', 'Posters', 'Logos', 'Thumbnails', 'Business cards', 'Documents']

const FEATURES = [
  { title: 'Templates for every size', text: 'Posts, stories, decks, posters and thumbnails — or a blank canvas.', bg: 'var(--zv-peach-soft)', span: 'lg:col-span-2', demo: <DemoTemplates /> },
  { title: 'Real typography', text: 'A curated library of Google Fonts, pairings and text effects.', bg: 'var(--zv-lemon-soft)', span: '', demo: <DemoType /> },
  { title: 'Translate in one click', text: 'Turn a whole design into 40+ languages — Urdu and Arabic included — and switch back anytime.', bg: 'var(--zv-teal-soft)', span: 'lg:row-span-2', demo: <DemoTranslate /> },
  { title: 'Magic Resize', text: 'Reflow one design into every format without rebuilding it.', bg: 'var(--zv-pink-soft)', span: '', demo: <DemoResize /> },
  { title: 'Work together, live', text: 'Share a link, see cursors, leave comments. Private until you share it.', bg: 'var(--zv-violet-soft)', span: '', demo: <DemoCollab /> },
  { title: 'Export without strings', text: 'PNG, JPG, PDF, SVG or video. No watermark, ever.', bg: 'var(--zv-sky-soft)', span: 'lg:col-span-3', demo: <DemoExport /> },
]

const TEMPLATES = [
  { label: 'Instagram post', size: '1080 × 1080', title: 'Open studio', bg: 'var(--zv-ink)', fg: 'var(--zv-paper)', accent: 'var(--zv-orange)', r: '-4deg' },
  { label: 'Story', size: '1080 × 1920', title: 'New season', bg: 'var(--zv-orange)', fg: 'var(--zv-ink)', accent: 'var(--zv-sun)', r: '3deg' },
  { label: 'Poster', size: 'A3', title: 'Spring Market', bg: 'var(--zv-violet)', fg: 'var(--zv-paper)', accent: 'var(--zv-pink)', r: '-2deg' },
  { label: 'Presentation', size: '1920 × 1080', title: 'Q3 review', bg: 'var(--zv-sun)', fg: 'var(--zv-ink)', accent: 'var(--zv-teal)', r: '5deg' },
]

const BADGE_TEXT = 'FREE FOREVER ✦ NO SIGN-UP ✦ NO WATERMARK ✦ '

// ── Page ─────────────────────────────────────────────────────

export function Landing() {
  const goDashboard = useAppStore((s) => s.goDashboard)

  return (
    <div className="zv-landing zv-grain min-h-screen flex flex-col overflow-x-hidden">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-[var(--zv-paper)]/85 backdrop-blur-md border-b-2 border-[var(--zv-ink)]">
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Zorvie home">
            <Logo size={28} />
          </button>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:inline text-sm font-semibold hover:text-[var(--zv-orange)] transition-colors">Features</a>
            <a href="#templates" className="hidden sm:inline text-sm font-semibold hover:text-[var(--zv-orange)] transition-colors">Templates</a>
            <button
              onClick={goDashboard}
              className="zv-press h-10 px-4 rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-orange)] text-sm font-bold inline-flex items-center gap-1.5"
              style={{ boxShadow: '3px 3px 0 var(--zv-ink)' }}
            >
              Open editor <ArrowRight size={14} />
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-24 pb-20 sm:pb-28">
          {/* floating collage bits */}
          <Star className="hidden md:block absolute right-[6%] top-[9%] w-20 zv-spin-slow" />
          <div className="hidden md:block absolute right-[20%] top-[22%] h-16 w-16 rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-pink)] animate-float" aria-hidden="true" />
          <div
            className="hidden lg:flex absolute right-[3%] top-[34%] zv-drop items-center gap-2 rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-teal)] text-white px-4 py-2 font-bold text-sm shadow-[4px_4px_0_var(--zv-ink)]"
            style={{ '--zv-r': '8deg', animationDelay: '0.6s' } as CSSProperties}
            aria-hidden="true"
          >
            <Sparkles size={14} /> No watermark
          </div>

          <div className="relative max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-lemon-soft)] px-3 py-1 zv-mono text-[11px] uppercase font-semibold animate-fade-up">
              <span className="h-2 w-2 rounded-full bg-[var(--zv-orange)]" /> A design studio in your browser
            </p>
            <h1 className="zv-display mt-8 font-normal leading-[0.92] text-[15vw] sm:text-[92px] lg:text-[124px] animate-fade-up delay-100">
              Design{' '}
              <span
                className="inline-block -rotate-3 bg-[var(--zv-orange)] border-2 border-[var(--zv-ink)] px-3 sm:px-4 rounded-2xl shadow-[6px_6px_0_var(--zv-ink)] italic"
              >
                anything
              </span>
              <br />
              <Selected className="mt-3">
                <span className="relative">
                  with <span className="italic zv-sunset-text">joy.</span>
                  <svg viewBox="0 0 300 24" className="absolute left-0 -bottom-2 w-full h-4 sm:h-6" preserveAspectRatio="none" aria-hidden="true">
                    <path className="zv-draw" d="M4 16 C 60 4, 120 22, 180 10 S 280 8, 296 14" fill="none" stroke="var(--zv-ink)" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </Selected>
            </h1>
            <p className="mt-10 max-w-lg text-[18px] leading-relaxed text-[var(--zv-ink-soft)] animate-fade-up delay-200">
              Posts, decks, posters and logos — made, translated and exported in one place.{' '}
              <strong className="font-bold text-[var(--zv-ink)]">No sign-up, no watermark.</strong>
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 animate-fade-up delay-300">
              <button onClick={goDashboard} className={`${pressBtn} bg-[var(--zv-ink)] text-[var(--zv-paper)]`} style={{ boxShadow: '5px 5px 0 var(--zv-orange)' }}>
                Start designing <ArrowRight size={16} />
              </button>
              <a href="#templates" className={`${pressBtn} bg-white`}>
                Browse templates
              </a>
            </div>
          </div>

          <div className="mt-16 sm:mt-24">
            <EditorPreview />
          </div>
        </section>

        {/* ── Formats marquee ── */}
        <section className="bg-[var(--zv-ink)] text-[var(--zv-paper)] -rotate-1 scale-[1.02] border-y-2 border-[var(--zv-ink)] overflow-hidden" aria-label="Things you can design">
          <div className="zv-marquee flex w-max py-5">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                {FORMATS.map((f, i) => (
                  <span key={f} className="flex items-center whitespace-nowrap">
                    <span className={`zv-display text-[32px] sm:text-[44px] px-6 ${i % 2 ? 'italic text-[var(--zv-sun)]' : ''}`}>{f}</span>
                    <Star className="h-6 w-6 sm:h-8 sm:w-8" fill={i % 2 ? 'var(--zv-pink)' : 'var(--zv-orange)'} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32 scroll-mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <h2 className="zv-display font-normal text-[44px] sm:text-[64px] leading-[0.98]">
              Everything you need.
              <br />
              <span className="italic text-[var(--zv-orange)]">Nothing you don&apos;t.</span>
            </h2>
            <p className="max-w-xs text-[var(--zv-muted)]">Six tools that do the heavy lifting, so the fun part stays yours.</p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className={`group zv-press rounded-3xl border-2 border-[var(--zv-ink)] p-6 sm:p-7 flex flex-col gap-6 ${f.span}`}
                style={{ background: f.bg }}
              >
                <div className="flex-1 min-h-[120px] flex items-center justify-center">{f.demo}</div>
                <div>
                  <span className="zv-mono text-[11px] font-bold">{String(i + 1).padStart(2, '0')} /</span>
                  <h3 className="mt-1 font-extrabold text-[20px] leading-tight">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--zv-ink-soft)]">{f.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Templates ── */}
        <section id="templates" className="relative bg-[var(--zv-paper-2)] border-y-2 border-[var(--zv-ink)] py-24 sm:py-32 scroll-mt-16 overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <h2 className="zv-display font-normal text-[44px] sm:text-[64px] leading-[0.98]">
                Start from a <Selected color="var(--zv-orange)"><span className="italic">template.</span></Selected>
              </h2>
              <button onClick={goDashboard} className={`${pressBtn} self-start sm:self-auto bg-[var(--zv-sun)] h-11 text-sm`}>
                See all templates <ArrowRight size={14} />
              </button>
            </div>

            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {TEMPLATES.map((t, i) => (
                <button
                  key={t.label}
                  onClick={goDashboard}
                  className="group text-left zv-drop"
                  style={{ '--zv-r': t.r, animationDelay: `${0.1 * i}s` } as CSSProperties}
                  aria-label={`Open ${t.label} templates`}
                >
                  <div
                    className="relative aspect-[4/5] rounded-xl border-2 border-[var(--zv-ink)] p-4 flex flex-col justify-between overflow-hidden shadow-[6px_6px_0_var(--zv-ink)] transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]"
                    style={{ background: t.bg, color: t.fg }}
                  >
                    <span
                      className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full transition-transform duration-500 group-hover:scale-125"
                      style={{ background: t.accent }}
                    />
                    <span className="relative zv-mono text-[9px] uppercase opacity-70">{t.size}</span>
                    <span className="relative zv-display text-[24px] sm:text-[30px] leading-[0.92]">{t.title}</span>
                  </div>
                  <div className="mt-4 text-sm font-bold flex items-center gap-1.5">
                    {t.label}
                    <ArrowRight size={14} className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="relative bg-[var(--zv-ink)] text-[var(--zv-paper)] overflow-hidden">
          <div className="absolute inset-x-0 top-6 select-none pointer-events-none zv-display italic zv-outline-text text-[22vw] leading-none whitespace-nowrap text-center" aria-hidden="true">
            create
          </div>
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-28 sm:py-40 text-center">
            {/* spinning badge */}
            <div className="hidden sm:block absolute right-10 top-16 h-36 w-36" aria-hidden="true">
              <svg viewBox="0 0 200 200" className="h-full w-full zv-spin-slow">
                <defs>
                  <path id="zv-badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                </defs>
                <text className="zv-mono" fontSize="15" fontWeight="700" letterSpacing="2.2" fill="var(--zv-sun)">
                  <textPath href="#zv-badge-circle">{BADGE_TEXT}</textPath>
                </text>
              </svg>
              <Star className="absolute inset-0 m-auto h-14 w-14" fill="var(--zv-orange)" />
            </div>

            <h2 className="zv-display font-normal text-[48px] sm:text-[88px] leading-[0.95]">
              Your next design
              <br />
              <span className="italic zv-sunset-text">starts here.</span>
            </h2>
            <p className="mt-6 text-[17px] opacity-70">Free, in your browser. Your work stays private until you share it.</p>
            <button
              onClick={goDashboard}
              className={`${pressBtn} mt-12 h-14 px-8 text-[17px] bg-[var(--zv-orange)] text-[var(--zv-ink)] border-[var(--zv-paper)]`}
              style={{ boxShadow: '6px 6px 0 var(--zv-paper)' }}
            >
              Start designing <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-[var(--zv-ink)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--zv-muted)]">
          <Logo size={22} />
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-[var(--zv-ink)] transition-colors">Features</a>
            <a href="#templates" className="hover:text-[var(--zv-ink)] transition-colors">Templates</a>
          </div>
          <span>
            © 2026 Zorvie · Developed by <span className="text-[var(--zv-ink)] font-semibold">Talha Hussain</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
