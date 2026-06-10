/**
 * Freestyle Workout Tracker – felhasználói profil hook
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchUserProfile,
  saveUserProfile,
} from '../services/profileService'
import { useAuth } from './useAuth'

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const requestIdRef = useRef(0)

  const reload = useCallback(async () => {
    if (!user) return null

    const requestId = ++requestIdRef.current
    setReady(false)
    setError('')

    try {
      const data = await fetchUserProfile(user.uid)
      if (requestId !== requestIdRef.current) return data
      setProfile(data)
      return data
    } catch (err) {
      console.error(err)
      if (requestId !== requestIdRef.current) return null
      setError('Nem sikerült betölteni a profilt.')
      return null
    } finally {
      if (requestId === requestIdRef.current) {
        setReady(true)
      }
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setReady(true)
      return
    }

    const requestId = ++requestIdRef.current
    setReady(false)

    fetchUserProfile(user.uid)
      .then((data) => {
        if (requestId !== requestIdRef.current) return
        setProfile(data)
        setError('')
      })
      .catch((err) => {
        console.error(err)
        if (requestId !== requestIdRef.current) return
        setError('Nem sikerült betölteni a profilt.')
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setReady(true)
        }
      })
  }, [user])

  const updateProfile = useCallback(
    async (fields) => {
      if (!user) return null

      setError('')
      try {
        const saved = await saveUserProfile(user.uid, fields)
        setProfile(saved)
        return saved
      } catch (err) {
        console.error(err)
        setError('Nem sikerült menteni a profilt.')
        throw err
      }
    },
    [user],
  )

  const hasBodyWeight = Boolean(profile?.bodyWeightKg)

  return {
    profile,
    hasBodyWeight,
    loading: Boolean(user) && !ready,
    error,
    reload,
    updateProfile,
  }
}
