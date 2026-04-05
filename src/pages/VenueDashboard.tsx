import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Music, MapPin, MessageSquare, Calendar, Building2, LogOut, Loader2, Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useMatches } from '@/hooks/useMatches'
import { useChat } from '@/hooks/useChat'
import { ProposalList } from '@/components/ProposalList'
import { ChatPanel } from '@/components/ChatPanel'
import { supabase } from '@/lib/supabase'
import { useTranslation } from 'react-i18next'

type View = 'proposals' | 'chat' | 'post-gig' | 'profile'

interface MyProfile {
  name: string
  venue_name: string
  venue_type: string | null
  location: string | null
}

export default function VenueDashboard() {
  const { user, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [activeView, setActiveView] = useState<View>('proposals')
  const [myProfile, setMyProfile] = useState<MyProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Gig form state
  const [gigTitle, setGigTitle] = useState('')
  const [gigDate, setGigDate] = useState('')
  const [gigTime, setGigTime] = useState('')
  const [gigBudget, setGigBudget] = useState('')
  const [gigRequirements, setGigRequirements] = useState('')
  const [gigPosting, setGigPosting] = useState(false)

  const { matches, loading: matchLoading, error: matchError, hasProfile, refresh } = useMatches('venue')
  const chat = useChat('venue')

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  // Load own profile for sidebar
  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('profiles').select('name').eq('user_id', user.id).single(),
      supabase.from('venue_profiles').select('venue_name, venue_type, location').eq('user_id', user.id).maybeSingle(),
    ]).then(([profileRes, vpRes]) => {
      setMyProfile({
        name: profileRes.data?.name ?? '—',
        venue_name: vpRes.data?.venue_name ?? profileRes.data?.name ?? '—',
        venue_type: vpRes.data?.venue_type ?? null,
        location: vpRes.data?.location ?? null,
      })
      setProfileLoading(false)
    })
  }, [user])

  const handleApprove = async (userIds: string[]) => {
    for (const id of userIds) {
      await chat.openConversation(id)
    }
    setActiveView('chat')
  }

  const handlePostGig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !gigTitle || !gigDate) return
    setGigPosting(true)

    const dateTime = gigTime ? `${gigDate}T${gigTime}:00` : `${gigDate}T20:00:00`

    const { error } = await supabase.from('gigs').insert({
      venue_id: user.id,
      title: gigTitle,
      date: dateTime,
      budget: gigBudget ? parseFloat(gigBudget) : null,
      genre: gigRequirements || null,
      status: 'open',
    })

    setGigPosting(false)

    if (error) {
      toast({ title: t('venueDashNew.error'), description: error.message, variant: 'destructive' })
    } else {
      toast({ title: t('venueDashNew.gigPublished'), description: t('venueDashNew.gigPublishedDesc') })
      setGigTitle('')
      setGigDate('')
      setGigTime('')
      setGigBudget('')
      setGigRequirements('')
      setActiveView('proposals')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const navItems: { icon: typeof MapPin; label: string; view: View }[] = [
    { icon: MapPin, label: t('venueDashNew.findMusiciansNav'), view: 'proposals' },
    { icon: MessageSquare, label: t('venueDashNew.messagesTitle'), view: 'chat' },
    { icon: Calendar, label: t('venueDashNew.myGigsNav'), view: 'post-gig' },
    { icon: Building2, label: t('venueDashNew.venueProfileNav'), view: 'profile' },
  ]

  const displayName = myProfile?.venue_name ?? '…'
  const subtitle = [myProfile?.venue_type, myProfile?.location].filter(Boolean).join(' · ') || 'Lokal'

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Music className="w-5 h-5 text-foreground" />
            <span className="font-display text-lg font-bold text-foreground">GigMatch</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Wyloguj">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0 space-y-4">
            <div className="p-5 rounded-xl border border-border">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Building2 className="w-7 h-7 text-muted-foreground" />
              </div>
              {profileLoading ? (
                <div className="h-5 w-32 bg-secondary rounded animate-pulse mb-1" />
              ) : (
                <h2 className="font-display text-lg font-bold text-foreground">{displayName}</h2>
              )}
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeView === item.view
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {item.view === 'chat' && chat.conversations.length > 0 && (
                    <span className="ml-auto bg-foreground text-background text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.conversations.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <Button
              variant="pill"
              className="w-full"
              onClick={() => setActiveView('post-gig')}
            >
              <Plus className="w-4 h-4 mr-1" /> {t('venueDashNew.addGig')}
            </Button>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {activeView === 'proposals' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  {t('venueDashNew.findMusiciansTitle')}
                </h1>
                <p className="text-muted-foreground text-sm mb-6">
                  {t('venueDashNew.findMusiciansDesc')}
                </p>
                <ProposalList
                  role="venue"
                  matches={matches}
                  loading={matchLoading}
                  error={matchError}
                  hasProfile={hasProfile}
                  onApprove={handleApprove}
                  onRefresh={refresh}
                />
              </motion.div>
            )}

            {activeView === 'chat' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  {t('venueDashNew.messagesTitle')}
                </h1>
                <p className="text-muted-foreground text-sm mb-6">
                  {t('venueDashNew.messagesDesc')}
                </p>
                <ChatPanel
                  role="venue"
                  conversations={chat.conversations}
                  convLoading={chat.convLoading}
                  activeConvId={chat.activeConvId}
                  messages={chat.messages}
                  msgLoading={chat.msgLoading}
                  onSelectConv={chat.setActiveConvId}
                  onSend={chat.sendMessage}
                />
              </motion.div>
            )}

            {activeView === 'post-gig' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-2xl font-bold text-foreground">{t('venueDashNew.addGig')}</h1>
                  <Button variant="ghost" size="sm" onClick={() => setActiveView('proposals')}>
                    {t('venueDashNew.addGigCancel')}
                  </Button>
                </div>
                <form onSubmit={handlePostGig} className="space-y-4 p-6 rounded-xl border border-border">
                  <div className="space-y-2">
                    <Label>{t('venueDashNew.gigTitleLabel')}</Label>
                    <Input
                      placeholder={t('venueDashNew.gigTitlePlaceholder')}
                      value={gigTitle}
                      onChange={e => setGigTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('venueDashNew.gigDate')}</Label>
                      <Input
                        type="date"
                        value={gigDate}
                        onChange={e => setGigDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('venueDashNew.gigTime')}</Label>
                      <Input
                        type="time"
                        value={gigTime}
                        onChange={e => setGigTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('venueDashNew.gigBudget')}</Label>
                    <Input
                      type="number"
                      placeholder="np. 500"
                      value={gigBudget}
                      onChange={e => setGigBudget(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('venueDashNew.gigRequirements')}</Label>
                    <Textarea
                      placeholder={t('venueDashNew.gigRequirementsPlaceholder')}
                      value={gigRequirements}
                      onChange={e => setGigRequirements(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    variant="pill"
                    className="w-full"
                    size="lg"
                    type="submit"
                    disabled={gigPosting}
                  >
                    {gigPosting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {gigPosting ? t('venueDashNew.publishing') : t('venueDashNew.publishBtn')}
                  </Button>
                </form>
              </motion.div>
            )}

            {activeView === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  {t('venueDashNew.profileTitle')}
                </h1>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('venueDashNew.profileDesc')}
                </p>
                <Link to="/onboarding">
                  <Button variant="pill">{t('venueDashNew.editPreferences')}</Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
