/**
 * Freestyle Workout Tracker – Authentication provider
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Globális auth állapot: bejelentkezett user, betöltés, login/register/logout.
 * Az onAuthStateChanged figyeli a Firebase Auth session változásait (pl. refresh után is).
 */

import { useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase'
import {
  clearGuestSession,
  hasGuestSession,
  saveGuestSession,
  ensureDemoWorkoutsSeeded,
} from '../services/guestStorage'
import { clearActiveWorkout } from '../services/activeWorkoutStorage'
import { createGuestUser } from '../utils/guestUser'
import { AuthContext } from './authContext'

/**
 * Auth provider – az egész appot ezzel kell becsomagolni (main.jsx).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        clearGuestSession()
        setUser(firebaseUser)
        setLoading(false)
        return
      }

      if (hasGuestSession()) {
        ensureDemoWorkoutsSeeded()
        setUser(createGuestUser())
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const loginAsGuest = () => {
    clearActiveWorkout()
    saveGuestSession()
    ensureDemoWorkoutsSeeded()
    setUser(createGuestUser())
    return Promise.resolve(createGuestUser())
  }

  const logout = async () => {
    if (user?.isGuest) {
      clearGuestSession({ keepWorkouts: true })
      setUser(null)
      return
    }
    await signOut(auth)
  }

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const register = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      loginAsGuest,
      isGuest: Boolean(user?.isGuest),
      isAuthenticated: Boolean(user),
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
