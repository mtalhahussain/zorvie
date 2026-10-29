'use client'

import { Link2, Check, Copy, Globe, Lock, QrCode } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

type Access = 'private' | 'link' | 'public'

const ACCESS_OPTS: { id: Access; label: string; desc: string; icon: typeof Lock }[] = [
  { id: 'private', label: 'Only me', desc: 'Only this browser can open it', icon: Lock },
  { id: 'link', label: 'Anyone with the link', desc: 'Can view, edit and comment', icon: Link2 },
  { id: 'public', label: 'Public', desc: 'Anyone with the link — fine to post anywhere', icon: Globe },
]

/** Canva-style Share dialog — copy link + server-enforced access level. */
export function ShareDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const designId = useEditorStore((s) => s.designId)
  const designName = useEditorStore((s) => s.designName)
  const [copied, setCopied] = useState(false)

  const link = designId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?design=${designId}` : ''

  const copy = async () => {
    if (!link) {
      toast({ title: 'Save the design first to get a share link', variant: 'destructive' })
      return
    }
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast({ title: 'Share link copied to clipboard' })
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast({ title: 'Could not copy — select and copy manually', description: link })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[28px] bg-[#16181D] border-white/10 text-white sm:max-w-md">
        {open && <ShareBody designId={designId} designName={designName} link={link} copied={copied} onCopy={() => void copy()} />}
      </DialogContent>
    </Dialog>
  )
}

function ShareBody({ designId, designName, link, copied, onCopy }: {
  designId: string | null
  designName: string
  link: string
  copied: boolean
  onCopy: () => void
}) {
  const [access, setAccess] = useState<Access | null>(null)
  const [isOwner, setIsOwner] = useState(true)
  const [saving, setSaving] = useState(false)

  // the access level lives on the server — it decides who can open the link
  useEffect(() => {
    if (!designId) return
    let cancelled = false
    fetch(`/api/designs/${encodeURIComponent(designId)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { access?: string; isOwner?: boolean } | null) => {
        if (cancelled || !d) return
        setAccess(d.access === 'link' || d.access === 'public' ? d.access : 'private')
        setIsOwner(d.isOwner !== false)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [designId])

  const setAccessAndPersist = async (a: Access) => {
    if (!designId || saving || a === access) return
    const prev = access
    setAccess(a)
    setSaving(true)
    try {
      const res = await fetch(`/api/designs/${encodeURIComponent(designId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access: a }),
      })
      if (!res.ok) throw new Error()
      toast({ title: a === 'private' ? 'Only you can open this design now' : 'Anyone with the link can open this design' })
    } catch {
      setAccess(prev)
      toast({ title: 'Could not change sharing', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-bold flex items-center gap-2">
          Share “{designName || 'Untitled design'}”
        </DialogTitle>
        <DialogDescription className="text-white/60">
          {access === 'private'
            ? 'This design is private — set “Anyone with the link” so others can open it.'
            : 'Anyone with this link can open and edit the design.'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 pl-3 pr-1.5 py-1.5 h-12">
          <Link2 size={16} className="text-white/50 shrink-0" />
          <input
            readOnly
            value={link}
            className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-white/80 truncate"
            aria-label="Share link"
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button className="btn-cv h-9 px-4 shrink-0 gap-1.5" onClick={onCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/10">
          {ACCESS_OPTS.map((o) => (
            <button
              key={o.id}
              onClick={() => void setAccessAndPersist(o.id)}
              disabled={!isOwner || saving || access === null}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 text-left transition-colors disabled:cursor-not-allowed',
                access === o.id ? 'bg-[#7630D7]/25' : 'hover:bg-white/5'
              )}
              aria-pressed={access === o.id}
            >
              <o.icon size={17} className={access === o.id ? 'text-[#a78bfa]' : 'text-white/60'} />
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold">{o.label}</span>
                <span className="block text-[11px] text-white/50">{o.desc}</span>
              </span>
              {access === o.id && <Check size={15} className="text-[#a78bfa] shrink-0" />}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-white/40 flex items-center gap-1.5">
          <QrCode size={13} />
          {isOwner
            ? 'Your designs belong to this browser. Other people only see a design you share with them.'
            : 'Only the owner can change who has access.'}
        </p>
      </div>
    </>
  )
}
