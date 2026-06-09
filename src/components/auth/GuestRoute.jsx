/**
 * Freestyle Workout Tracker – vendég route (login/register)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Ha már be van jelentkezve a user, ne lássa újra a login/register oldalt → Dashboard.
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingScreen from '../ui/LoadingScreen'

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Bejelentkezés ellenőrzése..." />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}
