'use client'

import { useState, type CSSProperties } from 'react'
import {
  ArrowRight,
  ArrowDown,
  Check,
  Shapes,
  Type,
  Download,
  Smartphone,
  Layers,
  Palette,
  Undo2,
  Heart,
  Github,
  Menu,
  X,
  MousePointer2,
  LayoutTemplate,
  Wand2,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Logo, LogoMark } from '@/components/logo'

const REPO_URL = 'https://github.com/mtalhahussain/zorvie'

// ── Hero collage — three "printed" designs on the desk ───────

function HeroCollage() {
  return (
    <div className="relative h-[360px] sm:h-[460px] lg:h-[540px] w-full" aria-hidden="true">
      {/* colour blobs */}
      <div className="absolute left-[8%] top-[10%] h-48 w-48 rounded-full bg-[var(--zv-pink)] opacity-30 blur-3xl" />
      <div className="absolute right-[4%] bottom-[8%] h-56 w-56 rounded-full bg-[var(--zv-teal)] opacity-30 blur-3xl" />
      <div className="absolute right-[30%] top-[30%] h-40 w-40 rounded-full bg-[var(--zv-violet)] opacity-25 blur-3xl" />

      {/* poster */}
      <div
        className="zv-drop absolute left-[2%] top-[4%] w-[50%] aspect-[4/5] rounded-[14px] border-2 border-[var(--zv-ink)] overflow-hidden shadow-[6px_6px_0_var(--zv-ink)]"
        style={{ '--zv-r': '-7deg', animationDelay: '0.15s', background: 'var(--zv-sun)' } as CSSProperties}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--zv-pink)]" />
        <div className="absolute right-6 top-16 h-10 w-10 rounded-full bg-[var(--zv-sky)] border-2 border-[var(--zv-ink)]" />
        <div className="absolute left-4 right-4 bottom-4">
          <div className="zv-mono text-[9px] sm:text-[10px] uppercase text-[var(--zv-ink)]/70">Fri · 21:00 · Hall B</div>
          <div className="zv-display text-[28px] sm:text-[40px] lg:text-[48px] font-black leading-[0.85] text-[var(--zv-ink)]">
            Live
            <br />
            Music
          </div>
        </div>
      </div>

      {/* social post */}
      <div
        className="zv-drop absolute right-[1%] top-0 w-[46%] aspect-square rounded-[14px] border-2 border-[var(--zv-ink)] overflow-hidden shadow-[6px_6px_0_var(--zv-ink)]"
        style={{ '--zv-r': '6deg', animationDelay: '0.3s', background: 'var(--zv-violet)' } as CSSProperties}
      >
        <div className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-[var(--zv-teal)]" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="zv-mono text-[9px] sm:text-[10px] uppercase text-white/75">@studio · 1080²</div>
          <div className="relative">
            <div className="zv-display text-[44px] sm:text-[64px] lg:text-[76px] font-black leading-[0.8] text-[var(--zv-sun)]">50%</div>
            <div className="zv-display italic text-[16px] sm:text-[22px] text-white">mega sale</div>
          </div>
        </div>
      </div>

      {/* story — currently selected in the editor */}
      <div
        className="zv-drop absolute left-[30%] bottom-0 w-[42%] aspect-[4/5]"
        style={{ '--zv-r': '-1.5deg', animationDelay: '0.45s' } as CSSProperties}
      >
        <div className="absolute inset-0 rounded-[14px] border-2 border-[var(--zv-ink)] overflow-hidden shadow-[6px_6px_0_var(--zv-ink)] bg-[linear-gradient(160deg,var(--zv-orange),var(--zv-pink))]">
          <div className="absolute inset-x-4 top-4 h-[46%] rounded-lg bg-[var(--zv-paper)] flex items-center justify-center">
            <LogoMark size={44} className="animate-float" />
          </div>
          <div className="absolute left-4 right-4 bottom-4">
            <div className="zv-display text-[22px] sm:text-[30px] lg:text-[34px] font-black leading-[0.9] text-white">
              New
              <br />
              drop.
            </div>
          </div>
        </div>
        {/* selection box + handles */}
        <div className="absolute -inset-2 border-2 border-dashed border-[var(--zv-violet)] rounded-[18px] pointer-events-none">
          {['-top-[7px] -left-[7px]', '-top-[7px] -right-[7px]', '-bottom-[7px] -left-[7px]', '-bottom-[7px] -right-[7px]'].map((pos) => (
            <span key={pos} className={`absolute ${pos} h-3 w-3 rounded-full bg-white border-2 border-[var(--zv-violet)]`} />
          ))}
        </div>
        {/* floating text toolbar */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--zv-ink)] text-[var(--zv-paper)] zv-mono text-[10px] px-3 py-1.5 flex items-center gap-2">
          <span className="font-bold text-[var(--zv-sun)]">Aa</span>
          <span className="opacity-40">|</span> Fraunces <span className="opacity-40">|</span> 72
          <span className="h-3 w-3 rounded-full bg-[var(--zv-pink)] border border-white/40" />
        </div>
        {/* collaborator cursor */}
        <div className="absolute -right-10 sm:-right-14 top-[38%] flex items-start gap-1 animate-float">
          <MousePointer2 size={20} className="fill-[var(--zv-teal)] text-[var(--zv-ink)]" />
          <span className="mt-4 rounded-full bg-[var(--zv-teal)] text-white zv-mono text-[10px] px-2 py-0.5 border border-[var(--zv-ink)]">you</span>
        </div>
      </div>
    </div>
  )
}

// ── Content ──────────────────────────────────────────────────

const FORMATS = ['Instagram posts', 'Pitch decks', 'Posters', 'Stories', 'Logos', 'Thumbnails', 'Certificates', 'Invoices', 'Business cards', 'Calendars']
const STAR_COLORS = ['var(--zv-sun)', 'var(--zv-pink)', 'var(--zv-teal)', 'var(--zv-sky)', 'var(--zv-orange)']

const STATS = [
  { num: '60+', label: 'Google fonts', bg: 'var(--zv-lemon-soft)', fg: 'var(--zv-orange)' },
  { num: '11', label: 'Starter templates', bg: 'var(--zv-pink-soft)', fg: 'var(--zv-pink)' },
  { num: '3×', label: 'Export resolution', bg: 'var(--zv-teal-soft)', fg: 'var(--zv-teal)' },
  { num: '0', label: 'Watermarks, ever', bg: 'var(--zv-violet-soft)', fg: 'var(--zv-violet)' },
]

const STEPS = [
  { icon: LayoutTemplate, title: 'Pick a template', text: 'Choose a ready-made size or start from a blank canvas.', color: 'var(--zv-pink)', soft: 'var(--zv-pink-soft)' },
  { icon: Wand2, title: 'Make it yours', text: 'Drop in text, photos, shapes and your brand colours.', color: 'var(--zv-violet)', soft: 'var(--zv-violet-soft)' },
  { icon: Download, title: 'Download & share', text: 'Export PNG, JPG, PDF, SVG or video — free, no watermark.', color: 'var(--zv-teal)', soft: 'var(--zv-teal-soft)' },
]

const FEATURES = [
  { icon: Type, title: 'Beautiful typography', text: '60+ hand-picked Google Fonts, styles and pairings at your fingertips.', color: 'var(--zv-orange)', soft: 'var(--zv-peach-soft)' },
  { icon: Palette, title: 'Templates for everything', text: 'Posts, stories, decks, posters, logos and thumbnails.', color: 'var(--zv-pink)', soft: 'var(--zv-pink-soft)' },
  { icon: Layers, title: 'Layers & smart guides', text: 'Reorder, lock and snap everything into perfect alignment.', color: 'var(--zv-violet)', soft: 'var(--zv-violet-soft)' },
  { icon: Undo2, title: 'Undo, redo & autosave', text: 'A full history stack plus automatic saving — work is never lost.', color: 'var(--zv-sky)', soft: 'var(--zv-sky-soft)' },
  { icon: Download, title: 'Export anywhere', text: 'Crisp PNG, JPG, PDF, SVG and video. Your files, no watermarks.', color: 'var(--zv-teal)', soft: 'var(--zv-teal-soft)' },
  { icon: Smartphone, title: 'Every device', text: 'Desktop, tablet or phone — touch-native, same editor.', color: 'var(--zv-orange)', soft: 'var(--zv-lemon-soft)' },
]

const TEMPLATES = [
  { label: 'Instagram post', size: '1080 × 1080', title: 'Mega sale', bg: 'var(--zv-pink)', fg: '#fff', r: '-3deg' },
  { label: 'Story', size: '1080 × 1920', title: 'New drop', bg: 'var(--zv-violet)', fg: 'var(--zv-sun)', r: '2deg' },
  { label: 'Presentation', size: '1920 × 1080', title: 'Nimbus', bg: 'var(--zv-sky)', fg: '#fff', r: '-1deg' },
  { label: 'Poster', size: 'A3', title: 'Live music', bg: 'var(--zv-sun)', fg: 'var(--zv-ink)', r: '3deg' },
  { label: 'Thumbnail', size: '1280 × 720', title: 'Top 10', bg: 'var(--zv-teal)', fg: '#fff', r: '-2deg' },
  { label: 'Logo', size: '500 × 500', title: 'Nova', bg: 'var(--zv-orange)', fg: 'var(--zv-ink)', r: '1.5deg' },
]

const NAV_LINKS: [string, string, string][] = [
  ['01', 'Features', '#features'],
  ['02', 'Templates', '#templates'],
  ['03', 'Open source', '#opensource'],
]

function SectionLabel({ n, children, color = 'var(--zv-orange)' }: { n: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="zv-mono text-[11px] uppercase inline-flex items-center gap-2.5 rounded-full border-2 border-[var(--zv-ink)] bg-white px-3 py-1 text-[var(--zv-ink)]">
      <span className="font-bold" style={{ color }}>{n}</span>
      {children}
    </div>
  )
}

export function Landing() {
  const goDashboard = useAppStore((s) => s.goDashboard)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="zv-landing zv-grain min-h-screen flex flex-col overflow-x-hidden">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--zv-line)] bg-[var(--zv-paper)]/85 backdrop-blur-md">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Zorvie home">
            <Logo size={30} />
          </button>
          <div className="hidden md:flex items-center gap-7 zv-mono text-[11px] uppercase text-[var(--zv-muted)]">
            {NAV_LINKS.map(([n, label, href]) => (
              <a key={href} href={href} className="group hover:text-[var(--zv-ink)] transition-colors">
                <span className="text-[var(--zv-orange)] mr-1.5">{n}</span>
                <span className="bg-[linear-gradient(var(--zv-pink),var(--zv-pink))] bg-[length:0%_2px] bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_2px] transition-[background-size] duration-300 pb-0.5">
                  {label}
                </span>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goDashboard}
              className="rounded-full bg-[var(--zv-ink)] text-[var(--zv-paper)] text-sm font-bold px-4 sm:px-5 h-10 inline-flex items-center gap-2 hover:bg-[var(--zv-orange)] hover:text-[var(--zv-ink)] transition-colors"
            >
              <span className="hidden sm:inline">Start designing</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden h-10 w-10 rounded-full border-2 border-[var(--zv-ink)] flex items-center justify-center"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="md:hidden border-t border-[var(--zv-line)] px-4 py-3 flex flex-col">
            {NAV_LINKS.map(([n, label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="py-3 flex items-center gap-3 font-bold border-b border-[var(--zv-line)] last:border-0"
              >
                <span className="zv-mono text-[11px] text-[var(--zv-orange)]">{n}</span> {label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-lemon-soft)] px-3 py-1.5 text-[13px] font-bold animate-fade-up">
                <span className="h-2 w-2 rounded-full bg-[var(--zv-pink)] animate-pulse" /> Free design studio for everyone
              </div>

              <h1 className="zv-display mt-7 font-black leading-[0.9] text-[15vw] sm:text-[88px] lg:text-[104px] animate-fade-up delay-100">
                Design
                <br />
                anything.
                <span className="block mt-2 font-normal italic text-[11vw] sm:text-[64px] lg:text-[76px] leading-[1.05]">
                  <span className="zv-sunset-text">Free for</span>{' '}
                  <span className="relative inline-block zv-sunset-text pr-1">
                    everyone.
                    <svg className="absolute left-0 -bottom-2 w-full h-4" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
                      <path className="zv-draw" d="M3 11 C 60 3, 120 3, 170 8 S 260 14, 297 5" fill="none" stroke="var(--zv-pink)" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </span>
              </h1>

              <p className="mt-8 max-w-md text-[17px] leading-relaxed text-[var(--zv-muted)] animate-fade-up delay-200">
                Make social posts, presentations, posters, logos and more. Drag, drop, download — right in
                your browser, on any device.
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold animate-fade-up delay-200">
                {[
                  ['No sign-up', 'var(--zv-teal)'],
                  ['No watermark', 'var(--zv-violet)'],
                  ['Works on mobile', 'var(--zv-pink)'],
                ].map(([t, c]) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full flex items-center justify-center text-white" style={{ background: c }}>
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-up delay-300">
                <button
                  onClick={goDashboard}
                  className="zv-press rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-orange)] text-[var(--zv-ink)] font-extrabold text-base h-14 px-8 inline-flex items-center justify-center gap-2"
                >
                  Start designing — it&apos;s free <ArrowRight size={18} />
                </button>
                <a
                  href="#templates"
                  className="inline-flex items-center justify-center gap-2 h-14 px-4 font-bold text-[var(--zv-ink)] hover:text-[var(--zv-violet)] transition-colors"
                >
                  See templates <ArrowDown size={16} />
                </a>
              </div>
            </div>

            <HeroCollage />
          </div>
        </section>

        {/* ── Formats marquee ── */}
        <section className="border-y-2 border-[var(--zv-ink)] bg-[var(--zv-ink)] text-[var(--zv-paper)] overflow-hidden" aria-label="Things you can design">
          <div className="zv-marquee flex w-max py-4">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                {FORMATS.map((f, i) => (
                  <span key={f} className="zv-display italic text-2xl sm:text-3xl px-6 flex items-center gap-6 whitespace-nowrap">
                    {f}
                    <span className="not-italic text-xl" style={{ color: STAR_COLORS[i % STAR_COLORS.length] }}>✺</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 sm:pt-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border-2 border-[var(--zv-ink)] p-5 sm:p-7" style={{ background: s.bg }}>
                <div className="zv-display font-black text-5xl sm:text-6xl leading-none" style={{ color: s.fg }}>{s.num}</div>
                <div className="mt-3 zv-mono text-[11px] uppercase text-[var(--zv-ink)]/70">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-28">
          <div className="text-center">
            <h2 className="zv-display font-black text-4xl sm:text-5xl leading-[0.95]">
              Ready in <span className="italic font-normal zv-sunset-text">three steps.</span>
            </h2>
            <p className="mt-4 text-[var(--zv-muted)]">No design skills needed.</p>
          </div>
          <ol className="mt-12 grid md:grid-cols-3 gap-5 relative">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border-2 border-[var(--zv-ink)] bg-white p-7 overflow-hidden">
                <span className="zv-display absolute -right-2 -top-6 font-black text-[120px] leading-none opacity-15" style={{ color: s.color }} aria-hidden="true">
                  {i + 1}
                </span>
                <div className="relative h-12 w-12 rounded-xl flex items-center justify-center border-2 border-[var(--zv-ink)]" style={{ background: s.soft, color: s.color }}>
                  <s.icon size={22} />
                </div>
                <div className="relative mt-5 zv-mono text-[11px] uppercase" style={{ color: s.color }}>Step {i + 1}</div>
                <h3 className="relative zv-display mt-1 text-2xl font-black">{s.title}</h3>
                <p className="relative mt-2 text-sm text-[var(--zv-muted)] leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <button
              onClick={goDashboard}
              className="zv-press rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-violet)] text-white font-extrabold h-12 px-7 inline-flex items-center gap-2"
            >
              Create your first design <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* ── Features (bento) ── */}
        <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 scroll-mt-16">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6 lg:gap-16 items-end">
            <div>
              <SectionLabel n="01">Features</SectionLabel>
              <h2 className="zv-display mt-5 font-black text-4xl sm:text-6xl leading-[0.95]">
                Everything you need <span className="italic font-normal zv-sunset-text">to create.</span>
              </h2>
            </div>
            <p className="text-[var(--zv-muted)] text-[17px] leading-relaxed max-w-xl">
              A serious editor, not a toy. Zorvie packs the features people actually use from commercial
              design tools — minus the price tag.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* headline card */}
            <div className="sm:col-span-2 lg:row-span-2 rounded-2xl border-2 border-[var(--zv-ink)] bg-[var(--zv-violet)] text-white p-7 sm:p-9 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-[var(--zv-pink)]" aria-hidden="true" />
              <div className="absolute right-20 bottom-28 h-20 w-20 rotate-12 rounded-lg bg-[var(--zv-sun)] border-2 border-[var(--zv-ink)]" aria-hidden="true" />
              <div className="absolute right-44 bottom-12 h-12 w-12 rounded-full bg-[var(--zv-teal)] border-2 border-[var(--zv-ink)]" aria-hidden="true" />
              <div className="relative h-12 w-12 rounded-xl bg-[var(--zv-sun)] text-[var(--zv-ink)] border-2 border-[var(--zv-ink)] flex items-center justify-center">
                <Shapes size={22} />
              </div>
              <div className="relative max-w-sm">
                <div className="zv-mono text-[11px] uppercase text-[var(--zv-sun)]">The canvas</div>
                <h3 className="zv-display mt-3 text-3xl sm:text-4xl font-black leading-[0.95]">Drag, drop &amp; done.</h3>
                <p className="mt-4 text-white/80 leading-relaxed">
                  Shapes, lines, graphics, stickers and images — move, resize and rotate everything with
                  buttery-smooth canvas rendering.
                </p>
              </div>
            </div>

            {FEATURES.map((f) => (
              <div key={f.title} className="zv-press rounded-2xl border-2 border-[var(--zv-ink)] p-6 flex flex-col" style={{ background: f.soft }}>
                <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white border-2 border-[var(--zv-ink)]" style={{ background: f.color }}>
                  <f.icon size={20} />
                </div>
                <h3 className="zv-display mt-5 text-xl font-bold leading-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-[var(--zv-ink)]/70 leading-relaxed">{f.text}</p>
              </div>
            ))}

            {/* wide closing card */}
            <div className="sm:col-span-2 rounded-2xl border-2 border-[var(--zv-ink)] bg-[var(--zv-sun)] p-6 sm:p-7 flex items-center gap-5">
              <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--zv-pink)] text-white border-2 border-[var(--zv-ink)] flex items-center justify-center">
                <Heart size={20} className="fill-current" />
              </div>
              <div>
                <h3 className="zv-display text-xl sm:text-2xl font-black leading-tight">Free &amp; open source</h3>
                <p className="mt-1 text-sm text-[var(--zv-ink)]/75 leading-relaxed">
                  MIT licensed and self-hostable. No accounts, no paywalls, no locked premium elements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Templates ── */}
        <section
          id="templates"
          className="border-y-2 border-[var(--zv-ink)] py-20 sm:py-28 scroll-mt-16 overflow-hidden bg-[linear-gradient(135deg,var(--zv-violet-soft)_0%,var(--zv-pink-soft)_50%,var(--zv-peach-soft)_100%)]"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <SectionLabel n="02" color="var(--zv-pink)">Templates</SectionLabel>
                <h2 className="zv-display mt-5 font-black text-4xl sm:text-6xl leading-[0.95]">
                  Start from a <span className="italic font-normal text-[var(--zv-pink)]">template.</span>
                </h2>
                <p className="mt-4 text-[var(--zv-ink)]/70 max-w-md">Sized and styled for every platform. Open one, tweak everything.</p>
              </div>
              <button
                onClick={goDashboard}
                className="self-start sm:self-auto zv-press rounded-full border-2 border-[var(--zv-ink)] bg-white font-bold h-12 px-6 inline-flex items-center gap-2"
              >
                Browse all templates <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-10">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={goDashboard}
                  className="group text-left"
                  aria-label={`Open ${t.label} templates`}
                >
                  <div
                    className="aspect-[4/5] rounded-xl border-2 border-[var(--zv-ink)] p-3.5 flex flex-col justify-between shadow-[4px_4px_0_var(--zv-ink)] transition-transform duration-300 ease-out [transform:rotate(var(--zv-r))] group-hover:[transform:translateY(-8px)_rotate(0deg)]"
                    style={{ background: t.bg, color: t.fg, '--zv-r': t.r } as CSSProperties}
                  >
                    <span className="zv-mono text-[9px] uppercase opacity-80">{t.size}</span>
                    <span className="zv-display font-black text-[26px] sm:text-[30px] leading-[0.85]">{t.title}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm font-bold">
                    {t.label}
                    <span className="h-6 w-6 rounded-full bg-[var(--zv-ink)] text-white flex items-center justify-center opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Open source / CTA ── */}
        <section id="opensource" className="relative overflow-hidden bg-[linear-gradient(135deg,var(--zv-orange)_0%,var(--zv-pink)_100%)] border-b-2 border-[var(--zv-ink)] scroll-mt-16">
          {/* rotating sun */}
          <svg
            className="zv-spin-slow absolute -right-40 -top-40 h-[520px] w-[520px] opacity-90"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <rect key={i} x="98" y="4" width="4" height="34" rx="2" fill="var(--zv-sun)" transform={`rotate(${i * 15} 100 100)`} />
            ))}
            <circle cx="100" cy="100" r="46" fill="var(--zv-sun)" />
          </svg>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel n="03" color="var(--zv-violet)">Open source</SectionLabel>
              <h2 className="zv-display mt-5 font-black text-4xl sm:text-6xl leading-[0.95] text-[var(--zv-ink)]">
                The design tool that <span className="italic font-normal text-white">belongs to you.</span>
              </h2>
              <p className="mt-6 text-[var(--zv-ink)]/85 text-[17px] leading-relaxed max-w-lg">
                Commercial design tools lock your creativity behind subscriptions. Zorvie is different — the
                code is open source, the license is MIT, and every design you make is exportable at full
                quality. Self-host it, fork it, improve it.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={goDashboard}
                  className="zv-press rounded-full border-2 border-[var(--zv-ink)] bg-[var(--zv-ink)] text-[var(--zv-paper)] font-extrabold h-14 px-8 inline-flex items-center justify-center gap-2"
                >
                  Try it now <ArrowRight size={18} />
                </button>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="zv-press rounded-full border-2 border-[var(--zv-ink)] bg-white text-[var(--zv-ink)] font-extrabold h-14 px-8 inline-flex items-center justify-center gap-2"
                >
                  <Github size={18} /> View on GitHub
                </a>
              </div>
            </div>

            <div className="zv-mono text-xs sm:text-sm leading-relaxed bg-[var(--zv-ink)] text-[var(--zv-paper)] rounded-2xl border-2 border-[var(--zv-ink)] shadow-[8px_8px_0_rgba(23,19,15,0.35)] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--zv-pink)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--zv-sun)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--zv-teal)]" />
                <span className="ml-3 text-[10px] uppercase text-white/40">~/zorvie</span>
              </div>
              <div className="p-5 sm:p-6 overflow-x-auto whitespace-nowrap">
                <div className="text-white/40"># run your own design studio</div>
                <div><span className="text-[var(--zv-pink)]">$</span> git clone {REPO_URL}.git</div>
                <div><span className="text-[var(--zv-pink)]">$</span> cd zorvie &amp;&amp; bun install</div>
                <div><span className="text-[var(--zv-pink)]">$</span> bun run db:push &amp;&amp; bun run db:seed</div>
                <div><span className="text-[var(--zv-pink)]">$</span> bun run dev</div>
                <div className="mt-3 text-[var(--zv-teal)]">✓ ready on http://localhost:3000</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[var(--zv-ink)] text-[var(--zv-paper)] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <Logo size={28} />
            <div className="flex flex-wrap items-center gap-6 zv-mono text-[11px] uppercase text-[var(--zv-paper)]/60">
              <a href="#features" className="hover:text-[var(--zv-sun)] transition-colors">Features</a>
              <a href="#templates" className="hover:text-[var(--zv-pink)] transition-colors">Templates</a>
              <a href="#opensource" className="hover:text-[var(--zv-teal)] transition-colors">Open source</a>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--zv-sky)] transition-colors">
                <Github size={13} /> GitHub
              </a>
            </div>
          </div>
          <div className="zv-display zv-sunset-text opacity-90 font-black leading-[0.85] text-[26vw] lg:text-[300px] mt-10 select-none text-center" aria-hidden="true">
            Zorvie
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[var(--zv-paper)]/55">
            <span>© 2026 Zorvie</span>
            <span>
              Developed by <span className="font-bold text-[var(--zv-sun)]">Talha Hussain</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
