import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music, Zap, MessageSquare, MapPin, User2, LogOut,
  Menu, X,
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useMatches } from '@/hooks/useMatches'
import { useChat } from '@/hooks/useChat'
import { ProposalList } from '@/components/ProposalList'
import { ChatPanel } from '@/components/ChatPanel'
import { AvatarUpload } from '@/components/AvatarUpload'
import { MusicianProfileEditor } from '@/components/MusicianProfileEditor'
import MapView from '@/components/MapView'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

type View = 'proposals' | 'chat' | 'gigs' | 'profile'

interface SidebarProfile {
  name: string
  genres: string[]
  avatarUrl: string | null
}

const NAV_ICONS: { icon: React.ElementType; view: View }[] = [
  { icon: Zap,           view: 'proposals' },
  { icon: MessageSquare, view: 'chat' },
  { icon: MapPin,        view: 'gigs' },
  { icon: User2,         view: 'profile' },
]

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({
  profile, userId, activeView, chatCount,
  onNav, onSignOut, onAvatarChange, onNameChange,
}: {
  profile: SidebarProfile | null
  userId: string
  activeView: View
  chatCount: number
  onNav: (v: View) => void
  onSignOut: () => void
  onAvatarChange: (url: string) => void
  onNameChange: (name: string) => void
}) {
  const { t } = useTranslation()
  const name     = profile?.name ?? '…'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const genre    = profile?.genres?.slice(0, 2).join(' · ') || ''

  const NAV = NAV_ICONS.map(item => ({
    ...item,
    label: t(`musicianDashNew.${item.view}`),
  }))

  return (
    <aside className="flex flex-col gap-5 h-full">
      {/* Profile card */}
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-3"
           style={{ boxShadow: '0 0 20px rgba(0,0,0,0.08)' }}>
        {userId ? (
          <div className="ring-2 ring-offset-2 rounded-full" style={{ ringColor: '#6366f1' }}>
            <AvatarUpload
              userId={userId}
              currentUrl={profile?.avatarUrl ?? null}
              displayName={name}
              size="lg"
              onUploaded={onAvatarChange}
            />
          </div>
        ) : (
          <Avatar className="w-20 h-20 ring-2 ring-offset-2" style={{ '--tw-ring-color': '#6366f1' } as React.CSSProperties}>
            <AvatarFallback className="text-xl font-bold bg-indigo-50 text-indigo-600">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <h2 className="font-bold text-gray-900 text-base leading-tight">{name}</h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#6366f1' }}>
            <Music className="w-3 h-3 inline mr-1" />
            {t('musicianDashNew.musicianBadge')}
          </p>
          {genre && <p className="text-xs text-gray-400 mt-1">{genre}</p>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {NAV.map(item => {
          const active = activeView === item.view
          return (
            <button
              key={item.view}
              onClick={() => onNav(item.view)}
              style={active ? { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' } : {}}
              className={`
                w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active
                  ? 'text-white shadow-md'
                  : 'text-gray-500 hover:text-indigo-700 hover:bg-indigo-50'}
              `}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.view === 'chat' && chatCount > 0 && (
                <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold
                  ${active ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {chatCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
      >
        <LogOut className="w-4 h-4" />
        {t('musicianDashNew.signOut')}
      </button>
    </aside>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MusicianDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [activeView,     setActiveView]     = useState<View>('proposals')
  const [sidebarOpen,    setSidebarOpen]    = useState(false)
  const [profile,        setProfile]        = useState<SidebarProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const { t } = useTranslation()
  const { toast } = useToast()
  const { matches, loading: matchLoading, error: matchError, hasProfile, refresh } = useMatches('musician')
  const chat = useChat('musician')

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('profiles').select('name').eq('user_id', user.id).single(),
      supabase.from('musician_profiles').select('genres, avatar_url').eq('user_id', user.id).maybeSingle(),
    ]).then(([pRes, mpRes]) => {
      setProfile({
        name:      pRes.data?.name ?? '—',
        genres:    mpRes.data?.genres ?? [],
        avatarUrl: mpRes.data?.avatar_url ?? null,
      })
      setProfileLoading(false)
    })
  }, [user])

  const handleApprove = async (userIds: string[]) => {
    for (const id of userIds) await chat.openConversation(id)
    setActiveView('chat')
    setSidebarOpen(false)
  }

  const handleApplyGig = async (gigId: string) => {
    if (!user) return
    const { error } = await supabase.from('gig_applications').insert({
      gig_id: gigId,
      musician_id: user.id,
      status: 'pending',
    })
    if (error && error.code !== '23505') {
      toast({ title: t('gigs.applyError'), description: error.message, variant: 'destructive' })
    } else if (!error) {
      toast({ title: t('gigs.applySuccess'), description: t('gigs.applySuccessDesc') })
    } else {
      toast({ title: t('gigs.alreadyApplied'), variant: 'default' })
    }
  }

  const handleSignOut = async () => { await signOut(); navigate('/') }
  const handleNav     = (view: View) => { setActiveView(view); setSidebarOpen(false) }

  const viewMeta: Record<View, { title: string; desc: string }> = {
    proposals: { title: t('musicianDashNew.proposalsTitle'), desc: t('musicianDashNew.proposalsDesc') },
    chat:      { title: t('musicianDashNew.messagesTitle'),  desc: t('musicianDashNew.messagesDesc') },
    gigs:      { title: t('musicianDashNew.gigsTitle'),      desc: t('musicianDashNew.gigsDesc') },
    profile:   { title: t('musicianDashNew.profileTitle'),   desc: t('musicianDashNew.profileDesc') },
  }

  const sidebarProps = {
    profile,
    userId:        user?.id ?? '',
    activeView,
    chatCount:     chat.conversations.length,
    onNav:         handleNav,
    onSignOut:     handleSignOut,
    onAvatarChange: (url: string) => setProfile(p => p ? { ...p, avatarUrl: url } : p),
    onNameChange:   (name: string) => setProfile(p => p ? { ...p, name } : p),
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f6ff 0%, #f0f4ff 100%)' }}>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">GigMatch</span>
          </Link>

          <span className="lg:hidden text-sm font-semibold text-gray-700">
            {viewMeta[activeView].title}
          </span>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
              <Avatar className="w-7 h-7">
                {profile?.avatarUrl ? <AvatarImage src={profile.avatarUrl} /> : null}
                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600 font-semibold">
                  {profile?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) ?? '?'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden xl:block">{profile?.name}</span>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(o => !o)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Beta notice ──────────────────────────────────────────────────── */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-1.5 text-center text-xs text-indigo-700">
        {t('beta.notice')}
      </div>

      {/* ── Mobile sidebar overlay ───────────────────────────────────────── */}
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
              {!profileLoading && <Sidebar {...sidebarProps} />}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Layout ───────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex gap-6">

          {/* Desktop sidebar */}
          <div className="hidden lg:block lg:w-60 xl:w-64 shrink-0">
            {!profileLoading && (
              <div className="sticky top-[5.5rem]">
                <Sidebar {...sidebarProps} />
              </div>
            )}
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
                  <h1 className="text-2xl font-bold text-gray-900">
                    {viewMeta[activeView].title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                    <p className="text-gray-500 text-sm">{viewMeta[activeView].desc}</p>
                  </div>
                </div>

                {/* Views */}
                {activeView === 'proposals' && (
                  <ProposalList
                    role="musician"
                    matches={matches}
                    loading={matchLoading}
                    error={matchError}
                    hasProfile={hasProfile}
                    onApprove={handleApprove}
                    onRefresh={refresh}
                  />
                )}

                {activeView === 'chat' && (
                  <ChatPanel
                    role="musician"
                    conversations={chat.conversations}
                    convLoading={chat.convLoading}
                    activeConvId={chat.activeConvId}
                    messages={chat.messages}
                    msgLoading={chat.msgLoading}
                    onSelectConv={chat.setActiveConvId}
                    onSend={chat.sendMessage}
                  />
                )}

                {activeView === 'gigs' && (
                  <MapView role="musician" onAcceptGig={handleApplyGig} />
                )}

                {activeView === 'profile' && user && (
                  <MusicianProfileEditor
                    userId={user.id}
                    onAvatarChange={url => setProfile(p => p ? { ...p, avatarUrl: url } : p)}
                    onNameChange={name => setProfile(p => p ? { ...p, name } : p)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
