import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw, UserCheck, MessageSquare } from 'lucide-react'
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

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-500/10 text-green-600 border-green-500/20' :
    score >= 65 ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
    'bg-secondary text-foreground border-border'

  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${color}`}>
      {score}% dopasowanie
    </span>
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
    if (selected.size === 0) return
    setApproving(true)
    await onApprove([...selected])
    setSelected(new Set())
    setApproving(false)
  }

  if (!hasProfile && hasProfile !== null) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">Uzupełnij profil, aby zobaczyć dopasowania</p>
        <p className="text-sm">Wróć do onboardingu i podaj swoje preferencje, aby AI mogło Cię dopasować.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>AI analizuje dopasowania…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive text-sm mb-4">{error}</p>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" /> Spróbuj ponownie
        </Button>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="mb-2">Brak dopasowań powyżej 50%</p>
        <p className="text-sm mb-4">Gdy pojawią się nowi {role === 'musician' ? 'lokale' : 'muzycy'}, dopasowania zostaną wyświetlone tutaj.</p>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" /> Odśwież
        </Button>
      </div>
    )
  }

  const targetLabel = role === 'musician' ? 'lokali' : 'muzyków'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {matches.length} {targetLabel} powyżej progu 50%
        </p>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Odśwież
        </Button>
      </div>

      <div className="space-y-3">
        {matches.map((match, i) => (
          <motion.div
            key={match.user_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`p-5 rounded-xl border transition-all ${
              selected.has(match.user_id)
                ? 'border-foreground/40 bg-secondary/50'
                : 'border-border hover:border-foreground/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={`match-${match.user_id}`}
                checked={selected.has(match.user_id)}
                onCheckedChange={() => toggle(match.user_id)}
                className="mt-1 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <label
                    htmlFor={`match-${match.user_id}`}
                    className="font-display text-base font-semibold text-foreground cursor-pointer"
                  >
                    {match.display_name}
                  </label>
                  <ScoreBadge score={match.score} />
                </div>

                {/* Extra profile details */}
                {role === 'musician' && match.profile.atmosphere && (
                  <p className="text-xs text-muted-foreground mb-1">
                    Atmosfera: {match.profile.atmosphere}
                  </p>
                )}
                {role === 'venue' && (match.profile.style || (match.profile.genres?.length > 0)) && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {match.profile.style ?? match.profile.genres?.join(', ')}
                  </p>
                )}

                <p className="text-sm text-muted-foreground italic">„{match.justification}"</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 mt-4"
        >
          <div className="bg-background border border-border rounded-xl p-4 shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MessageSquare className="w-4 h-4" />
              Wybrano {selected.size} {targetLabel}
            </div>
            <Button
              variant="pill"
              size="sm"
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserCheck className="w-4 h-4 mr-2" />
              )}
              {approving ? 'Otwieranie czatu…' : 'Zatwierdź i otwórz czat'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
