import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Guitar, Building2, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { LocationDetector } from '@/components/LocationDetector'

const GENRES = [
  'Jazz', 'Blues', 'Rock', 'Pop', 'Klasyczna', 'Folk', 'Country', 'R&B/Soul',
  'Elektroniczna', 'Hip-hop', 'Reggae', 'Metal', 'Funk', 'Gospel', 'Bossa Nova',
  'Flamenco', 'Muzyka góralska', 'Muzyka filmowa',
]

const INSTRUMENTS = [
  'Gitara akustyczna', 'Gitara elektryczna', 'Gitara basowa', 'Fortepian', 'Keyboard',
  'Skrzypce', 'Wiolonczela', 'Kontrabas', 'Perkusja', 'Saksofon', 'Trąbka',
  'Klarnet', 'Flet', 'Akordeon', 'Ukulele', 'Wokal', 'DJ / Elektronika',
]

const DAYS = [
  { value: 'pn', label: 'Pn' },
  { value: 'wt', label: 'Wt' },
  { value: 'sr', label: 'Śr' },
  { value: 'cz', label: 'Cz' },
  { value: 'pt', label: 'Pt' },
  { value: 'sb', label: 'Sb' },
  { value: 'nd', label: 'Nd' },
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

function TagSelector({
  options,
  selected,
  onChange,
}: {
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
}) {
  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter((x) => x !== item) : [...selected, item])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => toggle(item)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selected.includes(item)
              ? 'bg-foreground text-background border-foreground'
              : 'bg-background text-muted-foreground border-border hover:border-foreground/40'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState<'musician' | 'venue' | null>(null)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Shared — lokalizacja z LocationDetector
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)

  // Musician fields
  const [genres, setGenres] = useState<string[]>([])
  const [instruments, setInstruments] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [radius, setRadius] = useState(50)
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [bio, setBio] = useState('')

  // Venue fields
  const [atmosphere, setAtmosphere] = useState('')
  const [occasion, setOccasion] = useState('')
  const [expectations, setExpectations] = useState('')

  const handleLocationChange = (newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
  }

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
          genres,
          instruments,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          bio: bio || null,
          lat: lat ?? null,
          lng: lng ?? null,
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
      // Use profile name as venue_name fallback
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single()

      const { error } = await supabase.from('venue_profiles').upsert(
        {
          user_id: user.id,
          venue_name: profileData?.name ?? '',
          atmosphere: atmosphere || null,
          occasion: occasion || null,
          expectations: expectations || null,
          lat: lat ?? null,
          lng: lng ?? null,
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
        className="w-full max-w-lg"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <Music className="w-7 h-7 text-foreground" />
          <span className="font-display text-2xl font-bold text-foreground">GigMatch</span>
        </div>

        <div className="p-8 rounded-2xl border border-border bg-background">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs font-medium text-foreground">
              {role === 'musician' ? <Guitar className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
              {role === 'musician' ? 'Muzyk' : 'Lokal'}
            </div>
            <span className="text-xs text-muted-foreground">Krok 2 z 2 — preferencje</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            {role === 'musician' ? 'Twój profil muzyczny' : 'Charakter miejsca'}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {role === 'musician'
              ? 'AI dopasuje Cię do najlepszych gigów na podstawie Twojego profilu.'
              : 'AI dobierze muzyków idealnie pasujących do atmosfery Twojego lokalu.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {role === 'musician' ? (
                <motion.div
                  key="musician"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  {/* Gatunki */}
                  <div className="space-y-2">
                    <Label>Gatunki muzyczne</Label>
                    <TagSelector options={GENRES} selected={genres} onChange={setGenres} />
                    {genres.length === 0 && (
                      <p className="text-xs text-muted-foreground">Wybierz przynajmniej jeden gatunek.</p>
                    )}
                  </div>

                  {/* Instrumenty */}
                  <div className="space-y-2">
                    <Label>Instrumenty / umiejętności</Label>
                    <TagSelector options={INSTRUMENTS} selected={instruments} onChange={setInstruments} />
                  </div>

                  {/* Stawka */}
                  <div className="space-y-2">
                    <Label htmlFor="rate">Stawka za gig (PLN)</Label>
                    <Input
                      id="rate"
                      type="number"
                      placeholder="np. 500"
                      min={0}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Orientacyjna stawka za jeden występ.</p>
                  </div>

                  {/* Zasięg */}
                  <div className="space-y-3">
                    <Label>Zasięg — max odległość od miejsca zamieszkania</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={5}
                        max={300}
                        step={5}
                        value={[radius]}
                        onValueChange={([val]) => setRadius(val)}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-16 text-right">{radius} km</span>
                    </div>
                  </div>

                  {/* Dostępne dni */}
                  <div className="space-y-2">
                    <Label>Dostępne dni tygodnia</Label>
                    <div className="flex gap-2">
                      {DAYS.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() =>
                            setAvailableDays((prev) =>
                              prev.includes(day.value)
                                ? prev.filter((d) => d !== day.value)
                                : [...prev, day.value]
                            )
                          }
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                            availableDays.includes(day.value)
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-background text-muted-foreground border-border hover:border-foreground/40'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Kilka słów o sobie <span className="text-muted-foreground">(opcjonalnie)</span></Label>
                    <Textarea
                      id="bio"
                      placeholder="np. Gram jazz od 10 lat, grałem na wielu festiwalach..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Lokalizacja */}
                  <div className="space-y-2">
                    <Label>Twoja lokalizacja</Label>
                    <LocationDetector
                      onChange={handleLocationChange}
                      hint="Potrzebne do wyświetlenia Cię na mapie i obliczania odległości od lokali."
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="venue"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Lokalizacja */}
                  <div className="space-y-2">
                    <Label>Lokalizacja lokalu</Label>
                    <LocationDetector
                      onChange={handleLocationChange}
                      hint="Potrzebne do wyświetlenia lokalu na mapie dla muzyków."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="atmosphere">Atmosfera miejsca</Label>
                    <Input
                      id="atmosphere"
                      placeholder="np. spokojna restauracja fine dining, energiczny klub nocny"
                      value={atmosphere}
                      onChange={(e) => setAtmosphere(e.target.value)}
                    />
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
