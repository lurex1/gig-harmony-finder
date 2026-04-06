import { useState, useEffect, useCallback } from 'react'
import {
  User, Music2, Building2, Banknote, CalendarDays,
  CheckCircle2, Loader2,
} from 'lucide-react'
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider }   from '@/components/ui/slider'
import { Switch }   from '@/components/ui/switch'
import { AvatarUpload } from '@/components/AvatarUpload'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

// ─── Constants ────────────────────────────────────────────────────────────────

const GENRES = [
  'Jazz','Blues','Rock','Pop','Klasyczna','Folk','Country','R&B/Soul',
  'Elektroniczna','Hip-hop','Reggae','Metal','Funk','Gospel','Bossa Nova',
  'Flamenco','Muzyka góralska','Muzyka filmowa',
]
const INSTRUMENTS = [
  'Gitara akustyczna','Gitara elektryczna','Gitara basowa','Fortepian',
  'Keyboard','Skrzypce','Wiolonczela','Kontrabas','Perkusja','Saksofon',
  'Trąbka','Klarnet','Flet','Akordeon','Ukulele','Wokal','DJ / Elektronika',
]
const PERFORMANCE_TYPES = [
  { value: 'akustyczny',     label: 'Akustyczny' },
  { value: 'elektryczny',    label: 'Elektryczny' },
  { value: 'elektroakustyczny', label: 'Elektroakustyczny' },
]
const VENUE_SIZES = [
  { value: 'male_lokale', label: 'Małe lokale (do 50 os.)' },
  { value: 'srednie',     label: 'Średnie (50–200 os.)' },
  { value: 'duze_sceny',  label: 'Duże sceny (200+ os.)' },
  { value: 'plenerowe',   label: 'Koncerty plenerowe' },
]
const ATMOSPHERES = [
  { value: 'kameralna', label: 'Kameralna' },
  { value: 'klubowa',   label: 'Klubowa' },
  { value: 'eventowa',  label: 'Eventowa / biznesowa' },
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

// ─── Small helpers ─────────────────────────────────────────────────────────────

function TagPicker({
  options, selected, onChange,
}: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (item: string) =>
    onChange(selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item])
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(item => (
        <button
          key={item} type="button" onClick={() => toggle(item)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selected.includes(item)
              ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-indigo-500'
              : 'bg-background text-muted-foreground border-border hover:border-indigo-300'
          }`}
        >{item}</button>
      ))}
    </div>
  )
}

function RadioGroup({
  options, value, onChange,
}: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
            value === opt.value
              ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-indigo-500'
              : 'bg-background text-muted-foreground border-border hover:border-indigo-300'
          }`}
        >{opt.label}</button>
      ))}
    </div>
  )
}

function CheckGroup({
  options, selected, onChange,
}: { options: { value: string; label: string }[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value} type="button" onClick={() => toggle(opt.value)}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
            selected.includes(opt.value)
              ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-indigo-500'
              : 'bg-background text-muted-foreground border-border hover:border-indigo-300'
          }`}
        >{opt.label}</button>
      ))}
    </div>
  )
}

function SaveBtn({ loading, saved }: { loading: boolean; saved: boolean }) {
  const { t } = useTranslation()
  return (
    <Button type="submit" variant="pill" size="sm" disabled={loading} className="mt-4">
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> :
       saved   ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-500" /> : null}
      {loading ? t('musicianProfile.saving') : saved ? t('musicianProfile.saved') : t('musicianProfile.saveSection')}
    </Button>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  userId: string
  onAvatarChange: (url: string) => void
  onNameChange: (name: string) => void
}

export function MusicianProfileEditor({ userId, onAvatarChange, onNameChange }: Props) {
  const { toast } = useToast()
  const { t } = useTranslation()

  // Loading
  const [loading, setLoading] = useState(true)

  // Per-section save state
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved,  setSaved]  = useState<Record<string, boolean>>({})

  // 1. Podstawowe info
  const [avatarUrl,  setAvatarUrl]  = useState<string | null>(null)
  const [stageName,  setStageName]  = useState('')
  const [bio,        setBio]        = useState('')

  // 2. Muzyczne preferencje
  const [genres,      setGenres]      = useState<string[]>([])
  const [instruments, setInstruments] = useState<string[]>([])
  const [perfType,    setPerfType]    = useState('')

  // 3. Preferencje lokali
  const [venueSizes, setVenueSizes]   = useState<string[]>([])
  const [venueAtm,   setVenueAtm]    = useState<string[]>([])

  // 4. Finanse
  const [rateMin,  setRateMin]  = useState(0)
  const [rateMax,  setRateMax]  = useState(500)
  const [proBono,  setProBono]  = useState(false)

  // 5. Dostępność
  const [days,   setDays]   = useState<string[]>([])
  const [radius, setRadius] = useState(50)

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    Promise.all([
      supabase.from('profiles').select('name').eq('user_id', userId).single(),
      supabase.from('musician_profiles').select('*').eq('user_id', userId).maybeSingle(),
    ]).then(([pRes, mpRes]) => {
      const mp = mpRes.data
      setStageName(pRes.data?.name ?? '')
      if (mp) {
        setAvatarUrl(mp.avatar_url ?? null)
        setBio(mp.bio ?? '')
        setGenres(mp.genres ?? [])
        setInstruments(mp.instruments ?? [])
        setPerfType(mp.performance_type ?? '')
        setVenueSizes(mp.venue_size ? mp.venue_size.split(',') : [])
        setVenueAtm(mp.venue_atmosphere ? mp.venue_atmosphere.split(',') : [])
        setRateMin(mp.hourly_rate ?? 0)
        setRateMax((mp as Record<string,unknown>).hourly_rate_max as number ?? 500)
        setProBono((mp as Record<string,unknown>).pro_bono as boolean ?? false)
        setRadius((mp as Record<string,unknown>).radius as number ?? 50)
      }
      setLoading(false)
    })
  }, [userId])

  const flash = useCallback((section: string) => {
    setSaved(s => ({ ...s, [section]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [section]: false })), 2500)
  }, [])

  // ── Save helpers ──────────────────────────────────────────────────────────
  const saveSection = async (section: string, profilePatch: Record<string, unknown>, namePatch?: string) => {
    setSaving(s => ({ ...s, [section]: true }))

    if (namePatch !== undefined) {
      await supabase.from('profiles').update({ name: namePatch }).eq('user_id', userId)
      onNameChange(namePatch)
    }

    const { error } = await supabase.from('musician_profiles')
      .upsert({ user_id: userId, ...profilePatch }, { onConflict: 'user_id' })

    setSaving(s => ({ ...s, [section]: false }))
    if (error) {
      toast({ title: t('musicianProfile.saveError'), description: error.message, variant: 'destructive' })
    } else {
      flash(section)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Accordion type="multiple" defaultValue={['basic']} className="space-y-3">

      {/* ── 1. Podstawowe info ────────────────────────────────────────────── */}
      <AccordionItem value="basic" className="border border-border rounded-xl px-5 overflow-hidden">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{t('musicianProfile.basicTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('musicianProfile.basicDesc')}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <form
            onSubmit={e => {
              e.preventDefault()
              saveSection('basic', { bio: bio || null }, stageName)
            }}
            className="space-y-4"
          >
            <div className="flex items-start gap-4">
              <AvatarUpload
                userId={userId}
                currentUrl={avatarUrl}
                displayName={stageName}
                size="lg"
                onUploaded={url => { setAvatarUrl(url); onAvatarChange(url) }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {t('musicianProfile.avatarHint')}<br />{t('musicianProfile.avatarHint2')}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stageName">{t('musicianProfile.stageName')}</Label>
              <Input
                id="stageName"
                value={stageName}
                onChange={e => setStageName(e.target.value)}
                placeholder={t('musicianProfile.stageNamePlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">{t('musicianProfile.bio')} <span className="text-muted-foreground">{t('musicianProfile.bioOptional')}</span></Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder={t('musicianProfile.bioPlaceholder')}
                rows={3}
              />
            </div>

            <SaveBtn loading={saving['basic']} saved={saved['basic']} />
          </form>
        </AccordionContent>
      </AccordionItem>

      {/* ── 2. Muzyczne preferencje ───────────────────────────────────────── */}
      <AccordionItem value="music" className="border border-border rounded-xl px-5 overflow-hidden">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Music2 className="w-4 h-4 text-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{t('musicianProfile.musicTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('musicianProfile.musicDesc')}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <form
            onSubmit={e => {
              e.preventDefault()
              saveSection('music', {
                genres,
                instruments,
                performance_type: perfType || null,
              })
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label>{t('musicianProfile.genresLabel')}</Label>
              <TagPicker options={GENRES} selected={genres} onChange={setGenres} />
            </div>

            <div className="space-y-2">
              <Label>{t('musicianProfile.instrumentsLabel')}</Label>
              <TagPicker options={INSTRUMENTS} selected={instruments} onChange={setInstruments} />
            </div>

            <div className="space-y-2">
              <Label>{t('musicianProfile.performanceTypeLabel')}</Label>
              <RadioGroup options={PERFORMANCE_TYPES} value={perfType} onChange={setPerfType} />
            </div>

            <SaveBtn loading={saving['music']} saved={saved['music']} />
          </form>
        </AccordionContent>
      </AccordionItem>

      {/* ── 3. Preferencje lokali ─────────────────────────────────────────── */}
      <AccordionItem value="venues" className="border border-border rounded-xl px-5 overflow-hidden">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{t('musicianProfile.venuePrefsTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('musicianProfile.venuePrefsDesc')}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <form
            onSubmit={e => {
              e.preventDefault()
              saveSection('venues', {
                venue_size:        venueSizes.join(',') || null,
                venue_atmosphere:  venueAtm.join(',')  || null,
              })
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label>{t('musicianProfile.venueSizeLabel')}</Label>
              <CheckGroup options={VENUE_SIZES} selected={venueSizes} onChange={setVenueSizes} />
            </div>

            <div className="space-y-2">
              <Label>{t('musicianProfile.venueAtmosphereLabel')}</Label>
              <CheckGroup options={ATMOSPHERES} selected={venueAtm} onChange={setVenueAtm} />
            </div>

            <SaveBtn loading={saving['venues']} saved={saved['venues']} />
          </form>
        </AccordionContent>
      </AccordionItem>

      {/* ── 4. Finanse ────────────────────────────────────────────────────── */}
      <AccordionItem value="finance" className="border border-border rounded-xl px-5 overflow-hidden">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Banknote className="w-4 h-4 text-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{t('musicianProfile.financeTitle')}</p>
              <p className="text-xs text-muted-foreground">
                {proBono ? t('musicianProfile.financeProBonoRate') : `${rateMin}–${rateMax} zł`}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <form
            onSubmit={e => {
              e.preventDefault()
              saveSection('finance', {
                hourly_rate:     rateMin,
                hourly_rate_max: rateMax,
                pro_bono:        proBono,
              })
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('musicianProfile.financeRateLabel')}</Label>
                <span className="text-sm font-semibold text-foreground">
                  {rateMin} – {rateMax} zł
                </span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">{t('musicianProfile.rateFrom')}</p>
                  <Slider
                    min={0} max={5000} step={50}
                    value={[rateMin]}
                    onValueChange={([v]) => setRateMin(Math.min(v, rateMax - 50))}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">{t('musicianProfile.rateTo')}</p>
                  <Slider
                    min={0} max={5000} step={50}
                    value={[rateMax]}
                    onValueChange={([v]) => setRateMax(Math.max(v, rateMin + 50))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <Switch
                id="proBono"
                checked={proBono}
                onCheckedChange={setProBono}
              />
              <div>
                <Label htmlFor="proBono" className="cursor-pointer text-sm font-medium">
                  {t('musicianProfile.proBono')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('musicianProfile.proBonoDesc')}
                </p>
              </div>
            </div>

            <SaveBtn loading={saving['finance']} saved={saved['finance']} />
          </form>
        </AccordionContent>
      </AccordionItem>

      {/* ── 5. Dostępność ─────────────────────────────────────────────────── */}
      <AccordionItem value="availability" className="border border-border rounded-xl px-5 overflow-hidden">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{t('musicianProfile.availabilityTitle')}</p>
              <p className="text-xs text-muted-foreground">
                {days.length ? days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ') : t('musicianProfile.availabilityDays')}
                {' · '}{radius} km {t('musicianProfile.availabilityDaysTitle')}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <form
            onSubmit={e => {
              e.preventDefault()
              saveSection('availability', { radius })
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label>{t('musicianProfile.availabilityDays')}</Label>
              <div className="flex gap-1.5">
                {DAYS.map(day => (
                  <button
                    key={day.value} type="button"
                    onClick={() => setDays(prev =>
                      prev.includes(day.value)
                        ? prev.filter(d => d !== day.value)
                        : [...prev, day.value]
                    )}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                      days.includes(day.value)
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-indigo-500'
                        : 'bg-background text-muted-foreground border-border hover:border-indigo-300'
                    }`}
                  >{day.label}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('musicianProfile.maxRadius')}</Label>
                <span className="text-sm font-semibold text-foreground">{radius} km</span>
              </div>
              <Slider
                min={5} max={300} step={5}
                value={[radius]}
                onValueChange={([v]) => setRadius(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 km</span>
                <span>300 km</span>
              </div>
            </div>

            <SaveBtn loading={saving['availability']} saved={saved['availability']} />
          </form>
        </AccordionContent>
      </AccordionItem>

    </Accordion>
  )
}
