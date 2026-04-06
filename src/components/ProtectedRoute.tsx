import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  requiredRole: 'musician' | 'venue'
  children: ReactNode
}

export function ProtectedRoute({ requiredRole, children }: Props) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Role not yet set → go to onboarding
  if (!role) return <Navigate to="/onboarding" replace />

  // Wrong role → redirect to the correct dashboard
  if (role !== requiredRole) {
    return <Navigate to={role === 'venue' ? '/venue' : '/musician'} replace />
  }

  return <>{children}</>
}
