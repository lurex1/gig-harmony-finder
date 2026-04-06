import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music, MapPin, MessageSquare, Calendar, Building2, LogOut, Loader2, Plus,
  Users, CheckCircle2, XCircle, Clock, Menu, X,
} from 'lucide-react'
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

type View = 'proposals' | 'chat' | 'applications' | 'post-gig' | 'profile'

interface GigApplication {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  message: string | null
  musician_id: string
  gig: { id: string; title: string; date: string; budget: number | null; genre: string | null }
  musician_name: string
  musician_stage_name: string | null
  musician_genres: string[]
}

interface MyProfile {
  name: string
  venue_name: string
  venue_type: string | null
  location: string | null
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
function SidebarNav({
  activeView, navItems, onNav,
}: {
  activeView: View
  navItems: { icon: React.ElementType; label: string; view: View; badge?: number }[]
  onNav: (v: View) => void
}) {
  return (
    <nav className="space-y-1">
      {navItems.map(item => {
        const active = activeView === item.view
        return (
          <button
            key={item.view}
            onClick={() => onNav(item.view)}
            style={active ? { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' } : {}}
            className={`
              w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
              ${active ? 'text-white shadow-md' : 'text-gray-500 hover:text-indigo-700 hover:bg-indigo-50'}
            `}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {(item.badge ?? 0) > 0 && (
              <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold
                ${active ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function VenueDashboard() {
  const { user, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()

  const [activeView,     setActiveView]     = useState<View>('proposals')
  const [sidebarOpen,    setSidebarOpen]    = useState(false)
  const [myProfile,      setMyProfile]      = useState<MyProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const [gigTitle,        setGigTitle]       = useState('')
  const [gigDate,         setGigDate]        = useState('')
  const [gigTime,         setGigTime]        = useState('')
  const [gigBudget,       setGigBudget]      = useState('')
  const [gigRequirements, setGigRequirements] = useState('')
  const [gigPosting,      setGigPosting]     = useState(false)

  const [applications, setApplications] = useState<GigApplication[]>([])
  const [appLoading,   setAppLoading]   = useState(false)
  const [acceptingId,  setAcceptingId]  = useState<string | null>(null)

  const { matches, loading: matchLoading, error: matchError, hasProfile, refresh } = useMatches('venue')
  const chat = useChat('venue')

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('profiles').select('name').eq('user_id', user.id).single(),
      supabase.from('venue_profiles').select('venue_name, venue_type, location').eq('user_id', user.id).maybeSingle(),
    ]).then(([profileRes, vpRes]) => {
      setMyProfile({
        name:       profileRes.data?.name ?? '—',
        venue_name: vpRes.data?.venue_name ?? profileRes.data?.name ?? '—',
        venue_type: vpRes.data?.venue_type ?? null,
        location:   vpRes.data?.location ?? null,
      })
      setProfileLoading(false)
    })
  }, [user])

  const fetchApplications = useCallback(async () => {
    if (!user) return
    setAppLoading(true)
    const { data: myGigs } = await supabase.from('gigs').select('id').eq('venue_id', user.id)
    if (!myGigs || myGigs.length === 0) { setApplications([]); setAppLoading(false); return }

    const gigIds = myGigs.map(g => g.id)
    const { data: apps } = await supabase
      .from('gig_applications')
      .select('id, status, created_at, message, musician_id, gig_id')
      .in('gig_id', gigIds)
      .order('created_at', { ascending: false })
    if (!apps || apps.length === 0) { setApplications([]); setAppLoading(false); return }

    const uniqueGigIds      = [...new Set(apps.map(a => a.gig_id))]
    const uniqueMusicianIds = [...new Set(apps.map(a => a.musician_id))]
    const [{ data: gigsData }, { data: profilesData }, { data: musicianData }] = await Promise.all([
      supabase.from('gigs').select('id, title, date, budget, genre').in('id', uniqueGigIds),
      supabase.from('profiles').select('user_id, name').in('user_id', uniqueMusicianIds),
      supabase.from('musician_profiles').select('user_id, stage_name, genres').in('user_id', uniqueMusicianIds),
    ])

    const gigMap      = Object.fromEntries((gigsData ?? []).map(g => [g.id, g]))
    const profileMap  = Object.fromEntries((profilesData ?? []).map(p => [p.user_id, p]))
    const musicianMap = Object.fromEntries((musicianData ?? []).map(m => [m.user_id, m]))

    setApplications(apps.map(app => ({
      id: app.id, status: app.status, created_at: app.created_at,
      message: app.message, musician_id: app.musician_id,
      gig: gigMap[app.gig_id] ?? { id: app.gig_id, title: '—', date: '', budget: null, genre: null },
      musician_name:       profileMap[app.musician_id]?.name ?? '—',
      musician_stage_name: musicianMap[app.musician_id]?.stage_name ?? null,
      musician_genres:     musicianMap[app.musician_id]?.genres ?? [],
    })))
    setAppLoading(false)
  }, [user])

  useEffect(() => {
    if (activeView === 'applications') fetchApplications()
  }, [activeView, fetchApplications])

  const handleAcceptApplication = async (app: GigApplication) => {
    setAcceptingId(app.id)
    const { error } = await supabase.from('gig_applications').update({ status: 'accepted' }).eq('id', app.id)
    if (error) {
      toast({ title: t('venueDashNew.error'), description: error.message, variant: 'destructive' })
      setAcceptingId(null)
      return
    }
    await chat.openConversation(app.musician_id)
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'accepted' } : a))
    setAcceptingId(null)
    setActiveView('chat')
    toast({ title: t('venueDashNew.applicationAccepted'), description: t('venueDashNew.applicationAcceptedDesc') })
  }

  const handleRejectApplication = async (appId: string) => {
    const { error } = await supabase.from('gig_applications').update({ status: 'rejected' }).eq('id', appId)
    if (!error) setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a))
  }

  const handleApprove = async (userIds: string[]) => {
    for (const id of userIds) await chat.openConversation(id)
    setActiveView('chat')
  }

  const handlePostGig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !gigTitle || !gigDate) return
    setGigPosting(true)
    const dateTime = gigTime ? `${gigDate}T${gigTime}:00` : `${gigDate}T20:00:00`
    const { error } = await supabase.from('gigs').insert({
      venue_id: user.id, title: gigTitle, date: dateTime,
      budget: gigBudget ? parseFloat(gigBudget) : null,
      genre: gigRequirements || null, status: 'open',
    })
    setGigPosting(false)
    if (error) {
      toast({ title: t('venueDashNew.error'), description: error.message, variant: 'destructive' })
    } else {
      toast({ title: t('venueDashNew.gigPublished'), description: t('venueDashNew.gigPublishedDesc') })
      setGigTitle(''); setGigDate(''); setGigTime(''); setGigBudget(''); setGigRequirements('')
      setActiveView('proposals')
    }
  }

  const handleSignOut = async () => { await signOut(); navigate('/') }
  const handleNav     = (v: View) => { setActiveView(v); setSidebarOpen(false) }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'linear-gradient(135deg, #f8f6ff 0%, #f0f4ff 100%)' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#6366f1' }} />
      </div>
    )
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length
  const displayName  = myProfile?.venue_name ?? '…'
  const subtitle     = [myProfile?.venue_type, myProfile?.location].filter(Boolean).join(' · ') || 'Lokal'

  const navItems: { icon: React.ElementType; label: string; view: View; badge?: number }[] = [
    { icon: MapPin,        label: t('venueDashNew.findMusiciansNav'), view: 'proposals' },
    { icon: MessageSquare, label: t('venueDashNew.messagesTitle'),    view: 'chat',         badge: chat.conversations.length || undefined },
    { icon: Users,         label: t('venueDashNew.applicationsNav'),  view: 'applications', badge: pendingCount || undefined },
    { icon: Calendar,      label: t('venueDashNew.myGigsNav'),        view: 'post-gig' },
    { icon: Building2,     label: t('venueDashNew.venueProfileNav'),  view: 'profile' },
  ]

  const viewMeta: Record<View, { title: string; desc: string }> = {
    proposals:    { title: t('venueDashNew.findMusiciansTitle'),  desc: t('venueDashNew.findMusiciansDesc') },
    chat:         { title: t('venueDashNew.messagesTitle'),       desc: t('venueDashNew.messagesDesc') },
    applications: { title: t('venueDashNew.applicationsTitle'),   desc: t('venueDashNew.applicationsDesc') },
    'post-gig':   { title: t('venueDashNew.addGig'),              desc: '' },
    profile:      { title: t('venueDashNew.profileTitle'),        desc: t('venueDashNew.profileDesc') },
  }

  const sidebar = (
    <aside className="flex flex-col gap-5 h-full">
      {/* Profile card */}
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 0 20px rgba(0,0,0,0.08)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
             style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
          <Building2 className="w-7 h-7 text-white" />
        </div>
        {profileLoading ? (
          <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-1" />
        ) : (
          <h2 className="font-bold text-gray-900 text-base">{displayName}</h2>
        )}
        <p className="text-xs font-semibold mt-0.5" style={{ color: '#6366f1' }}>
          {t('venueDashNew.venueBadge')}
        </p>
        {subtitle !== 'Lokal' && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Nav */}
      <SidebarNav activeView={activeView} navItems={navItems} onNav={handleNav} />

      {/* CTA */}
      <button
        onClick={() => handleNav('post-gig')}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
      >
        <Plus className="w-4 h-4" /> {t('venueDashNew.addGig')}
      </button>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all mt-auto"
      >
        <LogOut className="w-4 h-4" />
        Wyloguj się
      </button>
    </aside>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f6ff 0%, #f0f4ff 100%)' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">GigMatch</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="lg:hidden text-sm font-semibold text-gray-700">
              {viewMeta[activeView].title}
            </span>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(o => !o)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-500"
              onClick={handleSignOut}
              title="Wyloguj"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-30"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-14 left-0 bottom-0 w-72 z-40 overflow-y-auto p-4"
              style={{ background: 'linear-gradient(135deg, #f8f6ff 0%, #f0f4ff 100%)' }}
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex gap-6">

          {/* Desktop sidebar */}
          <div className="hidden lg:block lg:w-60 xl:w-64 shrink-0">
            <div className="sticky top-[5.5rem]">{sidebar}</div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Section header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">{viewMeta[activeView].title}</h1>
                  {viewMeta[activeView].desc && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                      <p className="text-gray-500 text-sm">{viewMeta[activeView].desc}</p>
                    </div>
                  )}
                </div>

                {/* ── proposals ── */}
                {activeView === 'proposals' && (
                  <ProposalList
                    role="venue"
                    matches={matches}
                    loading={matchLoading}
                    error={matchError}
                    hasProfile={hasProfile}
                    onApprove={handleApprove}
                    onRefresh={refresh}
                  />
                )}

                {/* ── chat ── */}
                {activeView === 'chat' && (
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
                )}

                {/* ── applications ── */}
                {activeView === 'applications' && (
                  appLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#6366f1' }} />
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 0 20px rgba(0,0,0,0.06)' }}>
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-indigo-50">
                        <Users className="w-8 h-8" style={{ color: '#6366f1' }} />
                      </div>
                      <p className="font-semibold text-gray-800 mb-1">{t('venueDashNew.noApplications')}</p>
                      <p className="text-sm text-gray-400">{t('venueDashNew.noApplicationsDesc')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.map(app => (
                        <div key={app.id} className="bg-white rounded-2xl p-5"
                             style={{ boxShadow: '0 0 20px rgba(0,0,0,0.06)' }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  {app.musician_stage_name ?? app.musician_name}
                                </span>
                                {app.musician_genres.length > 0 && (
                                  <span className="text-xs text-gray-400">
                                    · {app.musician_genres.slice(0, 2).join(', ')}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {t('venueDashNew.applicationForGig')}:{' '}
                                <span className="text-gray-800 font-medium">{app.gig.title}</span>
                              </p>
                              {app.gig.date && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(app.gig.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  {app.gig.budget ? ` · ${app.gig.budget} zł` : ''}
                                </p>
                              )}
                              {app.message && (
                                <p className="text-sm text-gray-400 mt-2 italic">"{app.message}"</p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {app.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleAcceptApplication(app)}
                                    disabled={acceptingId === app.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                                  >
                                    {acceptingId === app.id
                                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      : <><CheckCircle2 className="w-3.5 h-3.5" />{t('venueDashNew.accept')}</>
                                    }
                                  </button>
                                  <button
                                    onClick={() => handleRejectApplication(app.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />{t('venueDashNew.reject')}
                                  </button>
                                </>
                              )}
                              {app.status === 'accepted' && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                  <CheckCircle2 className="w-3.5 h-3.5" />{t('venueDashNew.statusAccepted')}
                                </span>
                              )}
                              {app.status === 'rejected' && (
                                <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                  <XCircle className="w-3.5 h-3.5" />{t('venueDashNew.statusRejected')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-gray-300" />
                            <span className="text-xs text-gray-400">
                              {new Date(app.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* ── post-gig ── */}
                {activeView === 'post-gig' && (
                  <div className="max-w-lg">
                    <form onSubmit={handlePostGig} className="bg-white rounded-2xl p-6 space-y-4"
                          style={{ boxShadow: '0 0 20px rgba(0,0,0,0.08)' }}>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">{t('venueDashNew.gigTitleLabel')}</Label>
                        <Input
                          placeholder={t('venueDashNew.gigTitlePlaceholder')}
                          value={gigTitle}
                          onChange={e => setGigTitle(e.target.value)}
                          required
                          className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">{t('venueDashNew.gigDate')}</Label>
                          <Input type="date" value={gigDate} onChange={e => setGigDate(e.target.value)} required
                                 className="border-gray-200 focus:border-indigo-300" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">{t('venueDashNew.gigTime')}</Label>
                          <Input type="time" value={gigTime} onChange={e => setGigTime(e.target.value)}
                                 className="border-gray-200 focus:border-indigo-300" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">{t('venueDashNew.gigBudget')}</Label>
                        <Input type="number" placeholder="np. 500" value={gigBudget}
                               onChange={e => setGigBudget(e.target.value)}
                               className="border-gray-200 focus:border-indigo-300" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">{t('venueDashNew.gigRequirements')}</Label>
                        <Textarea placeholder={t('venueDashNew.gigRequirementsPlaceholder')}
                                  value={gigRequirements} onChange={e => setGigRequirements(e.target.value)}
                                  rows={3} className="border-gray-200 focus:border-indigo-300" />
                      </div>
                      <button
                        type="submit"
                        disabled={gigPosting}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                      >
                        {gigPosting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {gigPosting ? t('venueDashNew.publishing') : t('venueDashNew.publishBtn')}
                      </button>
                    </form>
                  </div>
                )}

                {/* ── profile ── */}
                {activeView === 'profile' && (
                  <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 0 20px rgba(0,0,0,0.08)' }}>
                    <p className="text-gray-500 text-sm mb-4">{t('venueDashNew.profileDesc')}</p>
                    <Link to="/onboarding">
                      <button
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                      >
                        {t('venueDashNew.editPreferences')}
                      </button>
                    </Link>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
