/**
 * Freestyle Workout Tracker – edzésnapló hook
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Korábbi edzések betöltése és frissítése Firestore-ból.
 */

import { useCallback, useEffect, useState } from 'react'
import {
  deleteWorkout,
  fetchUserWorkouts,
} from '../services/workoutService'
import {
  GUEST_WORKOUTS_UPDATED_EVENT,
  removeGuestWorkout,
} from '../services/guestStorage'
import { getGuestWorkouts } from '../utils/guestWorkouts'
import { isGuestUser } from '../utils/guestUser'
import { useAuth } from './useAuth'

export { getGuestWorkouts }

export function useWorkoutHistory() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!user) return

    setError('')

    try {
      if (isGuestUser(user)) {
        setWorkouts(getGuestWorkouts())
      } else {
        const data = await fetchUserWorkouts(user.uid)
        setWorkouts(data)
      }
    } catch (err) {
      console.error(err)
      setError('Nem sikerült betölteni az edzésnaplót.')
    } finally {
      setReady(true)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => {
        setWorkouts([])
        setReady(true)
      })
      return
    }

    let cancelled = false

    if (isGuestUser(user)) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setWorkouts(getGuestWorkouts())
          setError('')
          setReady(true)
        }
      })
      return () => {
        cancelled = true
      }
    }

    fetchUserWorkouts(user.uid)
      .then((data) => {
        if (!cancelled) {
          setWorkouts(data)
          setError('')
        }
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setError('Nem sikerült betölteni az edzésnaplót.')
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!user || !isGuestUser(user)) return undefined

    const refreshFromLocal = () => {
      setWorkouts(getGuestWorkouts())
      setReady(true)
    }

    window.addEventListener(GUEST_WORKOUTS_UPDATED_EVENT, refreshFromLocal)
    window.addEventListener('focus', refreshFromLocal)

    return () => {
      window.removeEventListener(GUEST_WORKOUTS_UPDATED_EVENT, refreshFromLocal)
      window.removeEventListener('focus', refreshFromLocal)
    }
  }, [user])

  const removeWorkout = useCallback(
    async (workoutId) => {
      if (!user) return
      if (isGuestUser(user)) {
        removeGuestWorkout(workoutId)
        setWorkouts(getGuestWorkouts())
        return
      }
      await deleteWorkout(user.uid, workoutId)
      setWorkouts((prev) => prev.filter((w) => w.firestoreId !== workoutId))
    },
    [user],
  )

  return {
    workouts,
    loading: Boolean(user) && !ready,
    error,
    reload,
    removeWorkout,
  }
}
