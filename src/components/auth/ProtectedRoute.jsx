/**
 * Freestyle Workout Tracker – védett route
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Csak bejelentkezett user láthatja a gyerek route-ot.
 * Auth ellenőrzés alatt LoadingScreen, kijelentkezve → /login.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingScreen from '../ui/LoadingScreen'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen message="Bejelentkezés ellenőrzése..." />
  }

  if (!user) {
    // state.from: login után visszairányíthatunk ide (jelenleg dashboard a cél)
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
