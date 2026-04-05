import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, RefreshCw, UserCheck, MessageSquare, Building2, Music2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { MatchResult } from '@/hooks/useMatches'

interface Props {
  role: 'musician' | 'venue'
  matches: MatchResult[]
  loading: boolean
  error: string | null
  hasProfile: boolean | null
  onApprove: (userIds: string[]) => Promise<void>
  onRefresh: () => void
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-emerald-600' :
    score >= 65 ? 'text-amber-500' :
    'text-orange-400'
  const bg =
    score >= 80 ? 'bg-emerald-50 border-emerald-200' :
    score >= 65 ? 'bg-amber-50 border-amber-200' :
    'bg-orange-50 border-orange-200'

  return (
    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 shrink-0 ${bg}`}>
      <span className={`text-lg font-bold leading-none ${color}`}>{score}</span>
      <span className={`text-[9px] font-semibold uppercase tracking-wide ${color}`}>%</span>
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-emerald-500' :
    score >= 65 ? 'bg-amber-400' :
    'bg-orange-400'
  return (
    <div className="h-1 w-full bg-border rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

function MatchCard({
  match, role, selected, onToggle,
}: {
  match: MatchResult
  role: 'musician' | 'venue'
  selected: boolean
  onToggle: () => void
}) {
  const Icon = role === 'musician' ? Building2 : Music2
  const detail = role === 'musician'
    ? match.profile.atmosphere || match.profile.venue_type || null
    : match.profile.style || (match.profile.genres?.length ? match.profile.genres.join(', ') : null)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer
        ${selected
          ? 'border-foreground/50 bg-secondary/60 shadow-sm'
          : 'border-border hover:border-foreground/25 hover:shadow-sm bg-background'}
      `}
      onClick={onToggle}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          className="mt-0.5 shrink-0"
          onClick={e => e.stopPropagation()}
        />

        {/* Icon placeholder */}
        <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-display font-semibold text-foreground leading-tight">
              {match.display_name}
            </h3>
            <ScoreRing score={match.score} />
          </div>

          {detail && (
            <p className="text-xs text-muted-foreground mb-2 truncate">{detail}</p>
          )}

          <ScoreBar score={match.score} />

          <div className="flex items-start gap-1.5 mt-2.5">
            <Sparkles className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              „{match.justification}"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ProposalList({ role, matches, loading, error, hasProfile, onApprove, onRefresh }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [approving, setApproving] = useState(false)

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleApprove = async () => {
    if (!selected.size) return
    setApproving(true)
    await onApprove([...selected])
    setSelected(new Set())
    setApproving(false)
  }

  // ── Empty / loading states ───────────────────────────────────────────────

  if (!hasProfile && hasProfile !== null) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
          <Music2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground mb-1">Uzupełnij profil</p>
        <p className="text-sm text-muted-foreground">
          Wypełnij preferencje muzyczne, aby AI mogło Cię dopasować do lokali.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">AI analizuje dopasowania…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-destructive mb-4">{error}</p>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" /> Spróbuj ponownie
        </Button>
      </div>
    )
  }

  if (!matches.length) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground mb-1">Brak dopasowań powyżej 50%</p>
        <p className="text-sm text-muted-foreground mb-4">
          Gdy pojawią się nowi {role === 'musician' ? 'lokale' : 'muzycy'}, AI automatycznie je oceni.
        </p>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Odśwież
        </Button>
      </div>
    )
  }

  const targetLabel = role === 'musician' ? 'lokali' : 'muzyków'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{matches.length}</span> {targetLabel} · próg 50%
        </p>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Odśwież
        </Button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {matches.map(match => (
            <MatchCard
              key={match.user_id}
              match={match}
              role={role}
              selected={selected.has(match.user_id)}
              onToggle={() => toggle(match.user_id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Sticky approve bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="sticky bottom-4 z-20"
          >
            <div className="bg-background border border-border rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
                  <span className="text-background text-xs font-bold">{selected.size}</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {selected.size === 1 ? `1 ${role === 'musician' ? 'lokal' : 'muzyk'}` : `${selected.size} ${targetLabel}`} zaznaczone
                </span>
              </div>
              <Button
                variant="pill"
                size="sm"
                onClick={handleApprove}
                disabled={approving}
                className="gap-2 shrink-0"
              >
                {approving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <MessageSquare className="w-4 h-4" />
                }
                {approving ? 'Otwieranie…' : 'Zatwierdź i czatuj'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
