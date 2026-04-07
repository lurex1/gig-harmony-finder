import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handle = async () => {
      // Supabase SDK automatycznie przetwarza hash/query z tokenami OAuth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        // Czekamy chwilę na przetworzenie tokenów z URL
        await new Promise(r => setTimeout(r, 1000))
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        if (!retrySession) {
          setError('Nie udało się zalogować. Spróbuj ponownie.')
          setTimeout(() => navigate('/login'), 3000)
          return
        }
        return handle()
      }

      const userId = session.user.id

      // Sprawdź czy użytkownik ma rekord w profiles (trigger powinien go utworzyć)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      if (!profile) {
        // Brak profilu — onboarding
        navigate('/onboarding')
        return
      }

      // Sprawdź czy ukończył onboarding (ma rozszerzony profil)
      const extTable = profile.role === 'venue' ? 'venue_profiles' : 'musician_profiles'
      const { data: extProfile } = await supabase
        .from(extTable)
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!extProfile) {
        navigate('/onboarding')
      } else {
        navigate(profile.role === 'venue' ? '/venue' : '/musician')
      }
    }

    handle()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-4">
        <Music className="w-8 h-8 text-foreground" />
        <p className="text-sm text-destructive text-center">{error}</p>
        <p className="text-xs text-muted-foreground">Przekierowanie za chwilę…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Music className="w-8 h-8 text-foreground" />
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Logowanie przez Google…</p>
    </div>
  )
}

export default AuthCallback
