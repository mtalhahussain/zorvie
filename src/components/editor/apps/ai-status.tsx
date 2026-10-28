'use client'

import { AlertTriangle } from 'lucide-react'

/** Shared "AI not configured" notice for AI-powered apps (dark panel styling). */
export function AINotConfiguredNotice({ feature }: { feature: string }) {
  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-2.5 text-[11px] text-amber-200/90 mb-2.5 leading-relaxed">
      <div className="flex items-center gap-1.5 font-bold">
        <AlertTriangle size={12} className="shrink-0" /> AI unavailable
      </div>
      <p className="mt-1 text-amber-200/75">
        {feature} is temporarily unavailable. Please try again later.
      </p>
    </div>
  )
}

/**
 * POST JSON to an AI route and return the parsed body. Never throws on a
 * non-JSON body (e.g. an HTML 504 from a proxy) — it yields a readable error.
 */
export async function postAI<T extends object>(
  url: string,
  body: unknown
): Promise<{ ok: boolean; data: T & { error?: string; code?: string } }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; code?: string }
  if (!res.ok && !data.error) {
    data.error = res.status === 503 ? 'AI is temporarily unavailable. Please try again later.' : `The AI service failed (HTTP ${res.status}). Please try again.`
  }
  return { ok: res.ok, data }
}
