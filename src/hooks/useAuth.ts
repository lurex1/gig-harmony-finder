import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type UserRole = 'musician' | 'venue'

interface AuthContextType {
  user: User | null
  session: Session | null
  role: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => Promise<{ error: string | null; emailSent: boolean }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function createAuthValue(): AuthContextType {
  throw new Error('AuthContext not initialized')
}

export function useAuthState(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const role = (user?.user_metadata?.role ?? null) as UserRole | null

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<{ error: string | null; emailSent: boolean }> => {
    // Pass name/role as metadata so a DB trigger can create the profile even
    // when email confirmation is required (session is null at this point).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })

    if (error) return { error: error.message, emailSent: false }
    if (!data.user) return { error: 'Rejestracja nie powiodła się. Spróbuj ponownie.', emailSent: false }

    // When email confirmation is disabled Supabase returns a live session
    // immediately — try the insert now. If email confirmation is enabled the
    // session will be null and RLS will reject the insert; in that case the
    // DB trigger handle_new_user (see supabase/migrations) will create the
    // profile once the user confirms their email.
    if (data.session) {
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        name,
        role,
      })
      if (profileError) return { error: profileError.message, emailSent: false }

      const { error: subError } = await supabase.from('subscriptions').insert({
        user_id: data.user.id,
        plan: role,
        status: 'trial',
      })
      if (subError) return { error: subError.message, emailSent: false }

      return { error: null, emailSent: false }
    }

    // No session = email confirmation required
    return { error: null, emailSent: true }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
  }

  return { user, session, role, loading, signIn, signUp, signOut }
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
