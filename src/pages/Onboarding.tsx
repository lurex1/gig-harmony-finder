import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Guitar, Building2, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const PERFORMANCE_TYPES = [
  { value: 'muzyka_w_tle', label: 'Muzyka w tle' },
  { value: 'koncert_glowny', label: 'Koncert główny' },
  { value: 'muzyka_do_tanca', label: 'Muzyka do tańca' },
]

const OCCASION_TYPES = [
  { value: 'regularny_wieczor', label: 'Regularny wieczór' },
  { value: 'event_specjalny', label: 'Event specjalny' },
  { value: 'wesele', label: 'Wesele' },
]

const EXPECTATIONS_TYPES = [
  { value: 'tlo_muzyczne', label: 'Tło muzyczne' },
  { value: 'glowna_atrakcja', label: 'Główna atrakcja' },
  { value: 'muzyka_taneczna', label: 'Muzyka taneczna' },
]

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState<'musician' | 'venue' | null>(null)
  const [step, setStep] = useState(0) // 0 = loading role, 1 = form
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Musician fields
  const [style, setStyle] = useState('')
  const [repertoire, setRepertoire] = useState('')
  const [performanceType, setPerformanceType] = useState('')

  // Venue fields
  const [atmosphere, setAtmosphere] = useState('')
  const [occasion, setOccasion] = useState('')
  const [expectations, setExpectations] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login')
      return
    }

    supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.role) {
          setRole(data.role as 'musician' | 'venue')
          setStep(1)
        } else {
          navigate('/login')
        }
      })
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !role) return
    setSubmitting(true)
    setError(null)

    if (role === 'musician') {
      const { error } = await supabase.from('musician_profiles').upsert(
        {
          user_id: user.id,
          style: style || null,
          repertoire: repertoire || null,
          performance_type: performanceType || null,
        },
        { onConflict: 'user_id' }
      )
      if (error) {
        setError(error.message)
        setSubmitting(false)
        return
      }
      navigate('/musician')
    } else {
      const { error } = await supabase.from('venue_profiles').upsert(
        {
          user_id: user.id,
          venue_name: '', // already set or can be empty for now
          atmosphere: atmosphere || null,
          occasion: occasion || null,
          expectations: expectations || null,
        },
        { onConflict: 'user_id' }
      )
      if (error) {
        setError(error.message)
        setSubmitting(false)
        return
      }
      navigate('/venue')
    }
  }

  const handleSkip = () => navigate(role === 'venue' ? '/venue' : '/musician')

  if (step === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Music className="w-7 h-7 text-foreground" />
          <span className="font-display text-2xl font-bold text-foreground">GigMatch</span>
        </div>

        <div className="p-8 rounded-2xl border border-border bg-background">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs font-medium text-foreground">
              {role === 'musician' ? <Guitar className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
              {role === 'musician' ? 'Muzyk' : 'Lokal'}
            </div>
            <span className="text-xs text-muted-foreground">Krok 2 z 2 — preferencje</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            {role === 'musician' ? 'Twój styl muzyczny' : 'Charakter miejsca'}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {role === 'musician'
              ? 'AI dopasuje Cię do najlepszych gigów na podstawie Twojego stylu.'
              : 'AI dobierze muzyków idealnie pasujących do atmosfery Twojego lokalu.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {role === 'musician' ? (
                <motion.div
                  key="musician"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="style">Styl / gatunek muzyczny</Label>
                    <Input
                      id="style"
                      placeholder="np. bard gitarowy, jazz, DJ elektroniczny"
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Opisz swój styl własnymi słowami — AI to zrozumie.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repertoire">Repertuar</Label>
                    <Textarea
                      id="repertoire"
                      placeholder="np. piosenki góralskie, jazz standards, własne kompozycje"
                      value={repertoire}
                      onChange={(e) => setRepertoire(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Charakter występu</Label>
                    <Select value={performanceType} onValueChange={setPerformanceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ występu" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERFORMANCE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="venue"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="atmosphere">Atmosfera miejsca</Label>
                    <Input
                      id="atmosphere"
                      placeholder="np. spokojna restauracja fine dining, energiczny klub nocny"
                      value={atmosphere}
                      onChange={(e) => setAtmosphere(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Opisz charakter miejsca — AI dobierze muzyków pasujących do klimatu.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Typ okazji</Label>
                    <Select value={occasion} onValueChange={setOccasion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ okazji" />
                      </SelectTrigger>
                      <SelectContent>
                        {OCCASION_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Oczekiwania wobec muzyki</Label>
                    <Select value={expectations} onValueChange={setExpectations}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz oczekiwania" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPECTATIONS_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              variant="pill"
              className="w-full"
              size="lg"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              {submitting ? 'Zapisuję...' : 'Przejdź do dashboardu'}
            </Button>
          </form>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-4 transition-colors"
          >
            Pomiń na razie — uzupełnię później
          </button>
        </div>
      </motion.div>
    </div>
  )
}
