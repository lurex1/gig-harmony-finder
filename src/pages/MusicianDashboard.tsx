import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music, Zap, MessageSquare, CalendarDays, User2, LogOut,
  Loader2, Menu, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useMatches } from '@/hooks/useMatches'
import { useChat } from '@/hooks/useChat'
import { ProposalList } from '@/components/ProposalList'
import { ChatPanel } from '@/components/ChatPanel'
import { AvatarUpload } from '@/components/AvatarUpload'
import { MusicianProfileEditor } from '@/components/MusicianProfileEditor'
import { supabase } from '@/lib/supabase'

type View = 'proposals' | 'chat' | 'calendar' | 'profile'

interface SidebarProfile {
  name: string
  genres: string[]
  avatarUrl: string | null
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV: { icon: React.ElementType; label: string; view: View }[] = [
  { icon: Zap,           label: 'Propozycje',   view: 'proposals' },
  { icon: MessageSquare, label: 'Wiadomości',   view: 'chat' },
  { icon: CalendarDays,  label: 'Kalendarz',    view: 'calendar' },
  { icon: User2,         label: 'Mój profil',   view: 'profile' },
]

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({
  profile,
  userId,
  activeView,
  chatCount,
  onNav,
  onSignOut,
  onAvatarChange,
  onNameChange,
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
  const name     = profile?.name ?? '…'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const genre    = profile?.genres?.slice(0, 2).join(' · ') || 'Muzyk'

  return (
    <aside className="flex flex-col gap-6">
      {/* Profile card */}
      <div className="rounded-2xl border border-border bg-background p-6">
        <div className="flex flex-col items-center text-center gap-3">
          {userId ? (
            <AvatarUpload
              userId={userId}
              currentUrl={profile?.avatarUrl ?? null}
              displayName={name}
              size="lg"
              onUploaded={onAvatarChange}
            />
          ) : (
            <Avatar className="w-24 h-24 ring-2 ring-border">
              <AvatarFallback className="text-2xl font-semibold bg-secondary">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}

          <div>
            <h2 className="font-display text-lg font-bold text-foreground leading-tight">{name}</h2>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground">
              <Music className="w-3 h-3" /> Muzyk
            </span>
            {profile?.genres?.length ? (
              <p className="text-xs text-muted-foreground mt-1.5">{genre}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {NAV.map(item => {
          const active = activeView === item.view
          return (
            <button
              key={item.view}
              onClick={() => onNav(item.view)}
              className={`
                w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}
              `}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.view === 'chat' && chatCount > 0 && (
                <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold
                  ${active ? 'bg-background text-foreground' : 'bg-foreground text-background'}`}>
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
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all mt-auto"
      >
        <LogOut className="w-4 h-4" />
        Wyloguj się
      </button>
    </aside>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MusicianDashboard() {
  const { user, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [activeView,    setActiveView]    = useState<View>('proposals')
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [profile,       setProfile]       = useState<SidebarProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const { matches, loading: matchLoading, error: matchError, hasProfile, refresh } = useMatches('musician')
  const chat = useChat('musician')

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  // Load sidebar profile
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

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const handleNav = (view: View) => { setActiveView(view); setSidebarOpen(false) }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const viewMeta: Record<View, { title: string; desc: string }> = {
    proposals: {
      title: 'Propozycje gigów',
      desc:  'Lokale dopasowane przez AI (próg 50%). Zaznacz kilka i zatwierdź, aby otworzyć czat.',
    },
    chat: {
      title: 'Wiadomości',
      desc:  'Twoje aktywne rozmowy z lokalami.',
    },
    calendar: {
      title: 'Kalendarz',
      desc:  'Twoje zaplanowane występy.',
    },
    profile: {
      title: 'Mój profil',
      desc:  'Uzupełnij profil — AI lepiej dopasuje Cię do lokali.',
    },
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top navbar ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Music className="w-5 h-5 text-foreground" />
            <span className="font-display text-lg font-bold text-foreground">GigMatch</span>
          </Link>

          {/* Mobile: current view title */}
          <span className="lg:hidden text-sm font-medium text-foreground">
            {viewMeta[activeView].title}
          </span>

          <div className="flex items-center gap-2">
            {/* Desktop: avatar mini */}
            <div className="hidden lg:flex items-center gap-2.5 text-sm text-muted-foreground">
              <Avatar className="w-7 h-7">
                {profile?.avatarUrl
                  ? <AvatarImage src={profile.avatarUrl} />
                  : null
                }
                <AvatarFallback className="text-xs bg-secondary">
                  {profile?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) ?? '?'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden xl:block">{profile?.name}</span>
            </div>

            {/* Mobile: hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setSidebarOpen(o => !o)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

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
              className="lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-background border-r border-border z-40 overflow-y-auto p-4"
            >
              {!profileLoading && (
                <Sidebar
                  profile={profile}
                  userId={user?.id ?? ''}
                  activeView={activeView}
                  chatCount={chat.conversations.length}
                  onNav={handleNav}
                  onSignOut={handleSignOut}
                  onAvatarChange={url => setProfile(p => p ? { ...p, avatarUrl: url } : p)}
                  onNameChange={name => setProfile(p => p ? { ...p, name } : p)}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Layout ───────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex gap-8">

          {/* Desktop sidebar */}
          <div className="hidden lg:flex lg:w-60 xl:w-64 shrink-0 flex-col">
            {!profileLoading && (
              <div className="sticky top-[5.5rem]">
                <Sidebar
                  profile={profile}
                  userId={user?.id ?? ''}
                  activeView={activeView}
                  chatCount={chat.conversations.length}
                  onNav={handleNav}
                  onSignOut={handleSignOut}
                  onAvatarChange={url => setProfile(p => p ? { ...p, avatarUrl: url } : p)}
                  onNameChange={name => setProfile(p => p ? { ...p, name } : p)}
                />
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
                {/* Page header */}
                <div className="mb-6">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {viewMeta[activeView].title}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {viewMeta[activeView].desc}
                  </p>
                </div>

                {/* ── Views ─────────────────────────────────────────────── */}

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

                {activeView === 'calendar' && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <CalendarDays className="w-10 h-10 text-muted-foreground/40 mb-3" />
                    <p className="font-medium text-foreground mb-1">Kalendarz wkrótce</p>
                    <p className="text-sm text-muted-foreground">
                      Przeglądanie i zarządzanie zaplanowanymi gigami — coming soon.
                    </p>
                  </div>
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
