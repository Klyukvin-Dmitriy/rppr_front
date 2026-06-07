import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireManager?: boolean
}

export function ProtectedRoute({ children, requireManager = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <p>Загрузка…</p>

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireManager && !user?.is_manager) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}