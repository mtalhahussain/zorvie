'use client'

import { ArrowRight, MousePointer2 } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Logo } from '@/components/logo'

// ── Hero preview — one quiet editor window, one design ───────

function EditorPreview() {
  return (
    <div className="relative animate-fade-up delay-200" aria-hidden="true">
      <div className="rounded-xl border border-[var(--zv-line)] bg-white overflow-hidden shadow-[0_30px_60px_-30px_rgba(23,19,15,0.25)]">
        {/* window bar */}
        <div className="h-10 flex items-center gap-3 px-4 border-b border-[var(--zv-line)]">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--zv-ink)]/12" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--zv-ink)]/12" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--zv-ink)]/12" />
          </div>
          <span className="zv-mono text-[10px] uppercase text-[var(--zv-muted)]">Spring poster · A3</span>
          <span className="ml-auto zv-mono text-[10px] text-[var(--zv-muted)]">Saved</span>
        </div>

        <div className="grid grid-cols-[44px_1fr] sm:grid-cols-[52px_1fr]">
          {/* tool rail */}
          <div className="border-r border-[var(--zv-line)] py-4 flex flex-col items-center gap-4">
            {['T', '◯', '▢', '↗'].map((g, i) => (
              <span
                key={g}
                className={`h-7 w-7 rounded-md flex items-center justify-center text-[12px] ${i === 0 ? 'bg-[var(--zv-ink)] text-[var(--zv-paper)]' : 'text-[var(--zv-muted)]'}`}
              >
                {g}
              </span>
            ))}
          </div>

          {/* canvas */}
          <div className="bg-[var(--zv-paper-2)]/60 p-6 sm:p-10 flex items-center justify-center h-[300px] sm:h-[460px]">
            <div className="relative h-full aspect-[3/4] bg-[var(--zv-paper)] shadow-[0_1px_2px_rgba(23,19,15,0.12)] p-4 sm:p-6 flex flex-col justify-between">
              <div className="flex justify-between zv-mono text-[8px] sm:text-[9px] uppercase text-[var(--zv-muted)]">
                <span>No. 04</span>
                <span>21 Mar</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="h-[46%] aspect-square rounded-full bg-[var(--zv-orange)]" />
              </div>
              <div className="relative">
                <div className="zv-display text-[22px] sm:text-[34px] leading-[0.92]">
                  Spring
                  <br />
                  <span className="italic">Market</span>
                </div>
                {/* selection on the headline */}
                <div className="absolute -inset-1.5 border border-[var(--zv-orange)] pointer-events-none">
                  {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos) => (
                    <span key={pos} className={`absolute ${pos} h-2 w-2 bg-white border border-[var(--zv-orange)]`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* a collaborator, quietly */}
      <div className="absolute right-[12%] bottom-[22%] flex items-start gap-1">
        <MousePointer2 size={16} className="fill-[var(--zv-ink)] text-[var(--zv-ink)]" />
        <span className="mt-3 bg-[var(--zv-ink)] text-[var(--zv-paper)] zv-mono text-[9px] px-1.5 py-0.5">Sara</span>
      </div>
    </div>
  )
}

// ── Content ──────────────────────────────────────────────────

const FORMATS = ['Social posts', 'Stories', 'Presentations', 'Posters', 'Logos', 'Thumbnails', 'Business cards', 'Documents']

const FEATURES = [
  { title: 'Templates for every size', text: 'Posts, stories, decks, posters and thumbnails — or start from a blank canvas.' },
  { title: 'Real typography', text: 'A curated library of Google Fonts, pairings and text effects.' },
  { title: 'Translate in one click', text: 'Turn a whole design into 40+ languages — Urdu and Arabic included — and switch back anytime.' },
  { title: 'Magic Resize', text: 'Reflow one design into every format without rebuilding it.' },
  { title: 'Work together, live', text: 'Share a link, see cursors, leave comments. Private until you share it.' },
  { title: 'Export without strings', text: 'PNG, JPG, PDF, SVG or video. No watermark, ever.' },
]

const TEMPLATES = [
  { label: 'Instagram post', size: '1080 × 1080', title: 'Open studio', bg: 'var(--zv-ink)', fg: 'var(--zv-paper)', ratio: 'aspect-[4/5]' },
  { label: 'Story', size: '1080 × 1920', title: 'New season', bg: 'var(--zv-orange)', fg: 'var(--zv-ink)', ratio: 'aspect-[4/5]' },
  { label: 'Poster', size: 'A3', title: 'Spring Market', bg: 'var(--zv-paper-2)', fg: 'var(--zv-ink)', ratio: 'aspect-[4/5]' },
  { label: 'Presentation', size: '1920 × 1080', title: 'Q3 review', bg: '#ffffff', fg: 'var(--zv-ink)', ratio: 'aspect-[4/5]' },
]

export function Landing() {
  const goDashboard = useAppStore((s) => s.goDashboard)

  return (
    <div className="zv-landing min-h-screen flex flex-col overflow-x-hidden">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-[var(--zv-paper)]/90 backdrop-blur-md border-b border-[var(--zv-line)]">
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Zorvie home">
            <Logo size={28} />
          </button>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:inline text-sm text-[var(--zv-muted)] hover:text-[var(--zv-ink)] transition-colors">Features</a>
            <a href="#templates" className="hidden sm:inline text-sm text-[var(--zv-muted)] hover:text-[var(--zv-ink)] transition-colors">Templates</a>
            <button
              onClick={goDashboard}
              className="h-9 px-4 rounded-full bg-[var(--zv-ink)] text-[var(--zv-paper)] text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-[var(--zv-orange)] hover:text-[var(--zv-ink)] transition-colors"
            >
              Open editor <ArrowRight size={14} />
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-28 pb-20 sm:pb-28">
          <div className="max-w-3xl">
            <p className="zv-mono text-[11px] uppercase text-[var(--zv-muted)] animate-fade-up">A design studio in your browser</p>
            <h1 className="zv-display mt-6 font-normal leading-[0.95] text-[14vw] sm:text-[84px] lg:text-[104px] animate-fade-up delay-100">
              Design anything.
              <br />
              <span className="italic text-[var(--zv-orange)]">Keep it simple.</span>
            </h1>
            <p className="mt-8 max-w-lg text-[17px] leading-relaxed text-[var(--zv-muted)] animate-fade-up delay-200">
              Posts, decks, posters and logos — made, translated and exported in one place. No sign-up,
              no watermark.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 animate-fade-up delay-300">
              <button
                onClick={goDashboard}
                className="h-12 px-6 rounded-full bg-[var(--zv-ink)] text-[var(--zv-paper)] font-semibold inline-flex items-center gap-2 hover:bg-[var(--zv-orange)] hover:text-[var(--zv-ink)] transition-colors"
              >
                Start designing <ArrowRight size={16} />
              </button>
              <a href="#templates" className="text-sm font-semibold underline underline-offset-[6px] decoration-[var(--zv-line)] hover:decoration-[var(--zv-ink)] transition-colors">
                Browse templates
              </a>
            </div>
          </div>

          <div className="mt-16 sm:mt-24">
            <EditorPreview />
          </div>
        </section>

        {/* ── Formats ── */}
        <section className="border-y border-[var(--zv-line)]" aria-label="Things you can design">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-wrap gap-x-3 gap-y-1 text-[15px] text-[var(--zv-muted)]">
            {FORMATS.map((f, i) => (
              <span key={f} className="whitespace-nowrap">
                {f}
                {i < FORMATS.length - 1 && <span className="ml-3 text-[var(--zv-line)]">/</span>}
              </span>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 scroll-mt-16">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
            <h2 className="zv-display font-normal text-4xl sm:text-5xl leading-[1.02]">
              Everything you need.
              <br />
              <span className="italic text-[var(--zv-muted)]">Nothing you don&apos;t.</span>
            </h2>
            <dl className="grid sm:grid-cols-2 border-t border-[var(--zv-line)]">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className={`py-7 border-b border-[var(--zv-line)] sm:pr-8 ${i % 2 === 1 ? 'sm:pl-8 sm:border-l' : ''}`}
                >
                  <dt className="flex items-baseline gap-3">
                    <span className="zv-mono text-[11px] text-[var(--zv-orange)]">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-semibold text-[17px]">{f.title}</span>
                  </dt>
                  <dd className="mt-2 pl-8 text-[15px] leading-relaxed text-[var(--zv-muted)]">{f.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Templates ── */}
        <section id="templates" className="bg-[var(--zv-paper-2)]/50 border-y border-[var(--zv-line)] py-20 sm:py-28 scroll-mt-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <h2 className="zv-display font-normal text-4xl sm:text-5xl leading-[1.02]">
                Start from a <span className="italic">template.</span>
              </h2>
              <button onClick={goDashboard} className="self-start sm:self-auto text-sm font-semibold inline-flex items-center gap-1.5 hover:text-[var(--zv-orange)] transition-colors">
                See all templates <ArrowRight size={14} />
              </button>
            </div>

            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 items-end">
              {TEMPLATES.map((t) => (
                <button key={t.label} onClick={goDashboard} className="group text-left" aria-label={`Open ${t.label} templates`}>
                  <div
                    className={`${t.ratio} border border-[var(--zv-line)] p-4 flex flex-col justify-between transition-transform duration-300 ease-out group-hover:-translate-y-1.5`}
                    style={{ background: t.bg, color: t.fg }}
                  >
                    <span className="zv-mono text-[9px] uppercase opacity-60">{t.size}</span>
                    <span className="zv-display text-[22px] sm:text-[26px] leading-[0.95]">{t.title}</span>
                  </div>
                  <div className="mt-3 text-sm font-semibold">{t.label}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32 text-center">
          <h2 className="zv-display font-normal text-4xl sm:text-6xl leading-[1.02]">
            Your next design <span className="italic text-[var(--zv-orange)]">starts here.</span>
          </h2>
          <p className="mt-5 text-[var(--zv-muted)]">Free, in your browser. Your work stays private until you share it.</p>
          <button
            onClick={goDashboard}
            className="mt-10 h-12 px-6 rounded-full bg-[var(--zv-ink)] text-[var(--zv-paper)] font-semibold inline-flex items-center gap-2 hover:bg-[var(--zv-orange)] hover:text-[var(--zv-ink)] transition-colors"
          >
            Start designing <ArrowRight size={16} />
          </button>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--zv-line)]">
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
