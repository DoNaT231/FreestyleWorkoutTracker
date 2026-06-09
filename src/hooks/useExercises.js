/**
 * Freestyle Workout Tracker – gyakorlatok betöltése hook
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Párhuzamosan tölti az alap és saját gyakorlatokat Firestore-ból.
 */

import { useCallback, useEffect, useState } from 'react'
import {
  fetchDefaultExercises,
  fetchUserExercises,
} from '../services/exerciseService'
import { useAuth } from './useAuth'

export function useExercises() {
  const { user } = useAuth()
  const [defaultExercises, setDefaultExercises] = useState([])
  const [userExercises, setUserExercises] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  const applyResult = useCallback((defaults, custom) => {
    setDefaultExercises(defaults)
    setUserExercises(custom)
    setReady(true)
  }, [])

  // Manuális frissítés (pl. törlés után) – eseménykezelőből
  const reload = useCallback(async () => {
    if (!user) return

    setReady(false)
    setError('')

    try {
      const [defaults, custom] = await Promise.all([
        fetchDefaultExercises(),
        fetchUserExercises(user.uid),
      ])
      applyResult(defaults, custom)
    } catch (err) {
      console.error(err)
      setError('Nem sikerült betölteni a gyakorlatokat.')
      setReady(true)
    }
  }, [user, applyResult])

  // Kezdeti betöltés – setState csak async callbackben
  useEffect(() => {
    if (!user) return

    let cancelled = false

    Promise.all([
      fetchDefaultExercises(),
      fetchUserExercises(user.uid),
    ])
      .then(([defaults, custom]) => {
        if (cancelled) return
        applyResult(defaults, custom)
        setError('')
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) {
          setError('Nem sikerült betölteni a gyakorlatokat.')
          setReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [user, applyResult])

  return {
    defaultExercises,
    userExercises,
    loading: Boolean(user) && !ready,
    error,
    reload,
  }
}
