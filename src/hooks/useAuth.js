/**
 * Freestyle Workout Tracker – useAuth hook
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Kényelmi hook az AuthContext eléréséhez.
 * Külön fájlban van, hogy az AuthContext.jsx csak komponenst exportáljon (ESLint / HMR).
 */

import { useContext } from 'react'
import { AuthContext } from '../context/authContext'

/**
 * @returns {{ user, loading, login, register, logout, isAuthenticated }}
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth csak AuthProvider-en belül használható.')
  }

  return context
}
