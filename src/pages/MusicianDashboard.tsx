import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Music, MapPin, MessageSquare, Calendar, User, LogOut, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useMatches } from '@/hooks/useMatches'
import { useChat } from '@/hooks/useChat'
import { ProposalList } from '@/components/ProposalList'
import { ChatPanel } from '@/components/ChatPanel'
import { supabase } from '@/lib/supabase'

type View = 'proposals' | 'chat' | 'calendar' | 'profile'

interface MyProfile {
  name: string
  style: string | null
  genres: string[]
}

export default function MusicianDashboard() {
  const { user, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<View>('proposals')
  const [myProfile, setMyProfile] = useState<MyProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const { matches, loading: matchLoading, error: matchError, hasProfile, refresh } = useMatches('musician')
  const chat = useChat('musician')

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  // Load own profile for sidebar display
  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('profiles').select('name').eq('user_id', user.id).single(),
      supabase.from('musician_profiles').select('style, genres').eq('user_id', user.id).maybeSingle(),
    ]).then(([profileRes, mpRes]) => {
      setMyProfile({
        name: profileRes.data?.name ?? '—',
        style: mpRes.data?.style ?? null,
        genres: mpRes.data?.genres ?? [],
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
    { icon: MapPin, label: 'Propozycje gigów', view: 'proposals' },
    { icon: MessageSquare, label: 'Wiadomości', view: 'chat' },
    { icon: Calendar, label: 'Kalendarz', view: 'calendar' },
    { icon: User, label: 'Profil', view: 'profile' },
  ]

  const displayName = myProfile?.name ?? '…'
  const subtitle = [
    myProfile?.style,
    myProfile?.genres?.length ? myProfile.genres.join(', ') : null,
  ].filter(Boolean).join(' · ') || 'Muzyk'

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
                <User className="w-7 h-7 text-muted-foreground" />
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
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {activeView === 'proposals' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  Propozycje gigów
                </h1>
                <p className="text-muted-foreground text-sm mb-6">
                  Lokale dopasowane przez AI (próg: 50%). Zaznacz i zatwierdź, aby otworzyć czat.
                </p>
                <ProposalList
                  role="musician"
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
                  Wiadomości
                </h1>
                <p className="text-muted-foreground text-sm mb-6">
                  Rozmowy z lokalami. Nowe czaty otwierasz z listy Propozycji.
                </p>
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
              </motion.div>
            )}

            {activeView === 'calendar' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Kalendarz</h1>
                <p className="text-muted-foreground text-sm">Funkcja dostępna wkrótce.</p>
              </motion.div>
            )}

            {activeView === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Twój profil</h1>
                <p className="text-muted-foreground text-sm mb-4">
                  Uzupełnij profil aby poprawić wyniki dopasowań.
                </p>
                <Link to="/onboarding">
                  <Button variant="pill">Edytuj preferencje</Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
