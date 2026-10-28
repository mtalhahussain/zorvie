import { cn } from '@/lib/utils'

const SUN_RAYS: [number, number, number, number][] = [
  [24, 12, 24, 8],
  [24, 36, 24, 40],
  [12, 24, 8, 24],
  [36, 24, 40, 24],
  [32.5, 15.5, 35.3, 12.7],
  [15.5, 15.5, 12.7, 12.7],
  [32.5, 32.5, 35.3, 35.3],
  [15.5, 32.5, 12.7, 35.3],
]

/** Zorvie gradient logo mark — a rising sun */
export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="zorvie-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFC93C" />
          <stop offset="0.55" stopColor="#FF8A00" />
          <stop offset="1" stopColor="#FF4E50" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#zorvie-grad)" />
      <circle cx="24" cy="24" r="7.5" fill="#FFFFFF" />
      {SUN_RAYS.map(([x1, y1, x2, y2]) => (
        <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      ))}
    </svg>
  )
}

/** Full wordmark lockup */
export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-2 select-none', className)}>
      <LogoMark size={size} />
      <span
        className="font-extrabold tracking-tight leading-none"
        style={{
          fontSize: size * 0.62,
          background: 'linear-gradient(120deg, #FFB000 0%, #FF8A00 55%, #FF4E50 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Zorvie
      </span>
    </span>
  )
}
