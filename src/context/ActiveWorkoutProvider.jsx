/**
 * Freestyle Workout Tracker – aktív edzés state provider
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Local-first edzés állapot: localStorage + Firestore sync fontos eseményeknél.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { TIMER_PHASE } from '../constants/workout'
import {
  clearActiveWorkout,
  loadActiveWorkout,
  saveActiveWorkout,
} from '../services/activeWorkoutStorage'
import { saveLastCompletedWorkout } from '../services/lastWorkoutSummaryStorage'
import {
  finishWorkoutInFirestore,
  getUserWorkoutCount,
  trySyncWorkout,
} from '../services/workoutService'
import { createTimer, idleTimer } from '../utils/timer'
import {
  createSet,
  createWorkout,
  createWorkoutExerciseFromTemplate,
  finishSetRecord,
  getCurrentExercise,
  patchExerciseInWorkout,
  patchWorkout,
} from '../utils/workoutFactory'
import { useAuth } from '../hooks/useAuth'
import { ActiveWorkoutContext } from './activeWorkoutContext'

export function ActiveWorkoutProvider({ children }) {
  const { user } = useAuth()
  const [workout, setWorkout] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  // localStorage betöltés user egyezés ellenőrzéssel (async – ESLint kompatibilis)
  useEffect(() => {
    let cancelled = false

    if (!user) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setWorkout(null)
          setHydrated(true)
        }
      })
      return () => {
        cancelled = true
      }
    }

    const stored = loadActiveWorkout()
    Promise.resolve().then(() => {
      if (cancelled) return
      if (stored?.userId === user.uid) {
        setWorkout(stored)
      }
      setHydrated(true)
    })

    return () => {
      cancelled = true
    }
  }, [user])

  const persist = useCallback(async (nextWorkout, sync = true) => {
    const withUser = user ? { ...nextWorkout, userId: user.uid } : nextWorkout
    saveActiveWorkout(withUser)
    setWorkout(withUser)

    if (!sync || !user) return withUser

    const synced = await trySyncWorkout(withUser)
    saveActiveWorkout(synced)
    setWorkout(synced)
    return synced
  }, [user])

  const startNewWorkout = useCallback(
    async (nameInput = '') => {
      if (!user) return null

      const trimmed = nameInput.trim()
      const customName = trimmed.length > 0
      const count = await getUserWorkoutCount(user.uid)
      const fresh = createWorkout(user.uid, {
        name: trimmed,
        customName,
        workoutNumber: count + 1,
      })

      return persist(fresh)
    },
    [user, persist],
  )

  const discardWorkout = useCallback(() => {
    clearActiveWorkout()
    setWorkout(null)
  }, [])

  const addExercise = useCallback(
    async (template, source) => {
      if (!workout) return null

      const exercise = createWorkoutExerciseFromTemplate(template, source)
      const next = patchWorkout(workout, {
        exercises: [...workout.exercises, exercise],
        currentExerciseLocalId: exercise.localId,
        timer: idleTimer(),
      })

      return persist(next)
    },
    [workout, persist],
  )

  const adjustRestSeconds = useCallback(
    async (delta) => {
      const current = getCurrentExercise(workout)
      if (!workout || !current) return null

      const nextRest = Math.max(0, current.restSeconds + delta)
      const next = patchExerciseInWorkout(workout, current.localId, {
        restSeconds: nextRest,
      })
      return persist(next, false)
    },
    [workout, persist],
  )

  const startExercise = useCallback(async () => {
    const current = getCurrentExercise(workout)
    if (!workout || !current) return null

    const next = patchWorkout(workout, {
      timer: createTimer(TIMER_PHASE.PREP, current.prepSeconds),
    })
    return persist(next, false)
  }, [workout, persist])

  const skipPrep = useCallback(async () => {
    if (!workout) return null
    const next = patchWorkout(workout, {
      timer: idleTimer(TIMER_PHASE.ACTIVE_SET),
    })
    return persist(next, false)
  }, [workout, persist])

  const completePrep = useCallback(async () => {
    if (!workout) return null
    const next = patchWorkout(workout, {
      timer: idleTimer(TIMER_PHASE.ACTIVE_SET),
    })
    return persist(next, false)
  }, [workout, persist])

  const finishActiveSet = useCallback(async () => {
    const current = getCurrentExercise(workout)
    if (!workout || !current) return null

    const setNumber = current.sets.length + 1
    const newSet = createSet(setNumber)
    const closedSet = finishSetRecord(newSet, null)

    const updatedExercise = {
      ...current,
      sets: [...current.sets, closedSet],
    }

    let next = patchWorkout(workout, {
      exercises: workout.exercises.map((ex) =>
        ex.localId === current.localId ? updatedExercise : ex,
      ),
      timer: createTimer(TIMER_PHASE.REST, current.restSeconds),
    })

    next = await persist(next, true)
    return next
  }, [workout, persist])

  const updateLastSetReps = useCallback(
    async (reps) => {
      const current = getCurrentExercise(workout)
      if (!workout || !current || current.sets.length === 0) return null

      const sets = [...current.sets]
      const lastIndex = sets.length - 1
      sets[lastIndex] = finishSetRecord(sets[lastIndex], reps)

      const next = patchExerciseInWorkout(workout, current.localId, { sets })
      return persist(next, false)
    },
    [workout, persist],
  )

  const updateSetReps = useCallback(
    async (setLocalId, reps) => {
      const current = getCurrentExercise(workout)
      if (!workout || !current) return null

      const sets = current.sets.map((set) =>
        set.localId === setLocalId ? finishSetRecord(set, reps) : set,
      )

      const next = patchExerciseInWorkout(workout, current.localId, { sets })
      return persist(next, true)
    },
    [workout, persist],
  )

  const deleteSet = useCallback(
    async (setLocalId) => {
      const current = getCurrentExercise(workout)
      if (!workout || !current) return null

      const sets = current.sets
        .filter((set) => set.localId !== setLocalId)
        .map((set, index) => ({ ...set, setNumber: index + 1 }))

      const next = patchExerciseInWorkout(workout, current.localId, { sets })
      return persist(next, true)
    },
    [workout, persist],
  )

  const extendRest = useCallback(
    async (extraSeconds) => {
      if (!workout || workout.timer.phase !== TIMER_PHASE.REST) return null

      const remaining = Math.max(
        0,
        workout.timer.durationSeconds -
          Math.floor((Date.now() - workout.timer.startedAt) / 1000),
      )

      const next = patchWorkout(workout, {
        timer: createTimer(TIMER_PHASE.REST, remaining + extraSeconds),
      })
      return persist(next, false)
    },
    [workout, persist],
  )

  const startNextSet = useCallback(async () => {
    const current = getCurrentExercise(workout)
    if (!workout || !current) return null

    const next = patchWorkout(workout, {
      timer: createTimer(TIMER_PHASE.PREP, current.prepSeconds),
    })
    return persist(next, false)
  }, [workout, persist])

  const finishCurrentExercise = useCallback(async () => {
    const current = getCurrentExercise(workout)
    if (!workout || !current) return null

    const next = patchExerciseInWorkout(workout, current.localId, {
      status: 'completed',
    })

    const withIdle = patchWorkout(next, {
      timer: idleTimer(),
    })

    return persist(withIdle, true)
  }, [workout, persist])

  const clearCurrentExerciseSelection = useCallback(async () => {
    if (!workout) return null
    const next = patchWorkout(workout, {
      currentExerciseLocalId: null,
      timer: idleTimer(),
    })
    return persist(next, false)
  }, [workout, persist])

  const completeWorkout = useCallback(
    async (workoutOverride) => {
      const source = workoutOverride ?? workout
      if (!source || !user) return null

      const finishedAt = new Date().toISOString()
      const startedAt = source.startedAt ?? source.createdAt ?? finishedAt
      const startMs = new Date(startedAt).getTime()
      const endMs = new Date(finishedAt).getTime()
      const durationSeconds =
        Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs
          ? Math.round((endMs - startMs) / 1000)
          : null

      const finished = {
        ...source,
        userId: user.uid,
        startedAt,
        status: 'completed',
        finishedAt,
        durationSeconds,
        currentExerciseLocalId: null,
        timer: idleTimer(),
      }

      let completed = { ...finished, syncStatus: 'pendingSync' }
      saveLastCompletedWorkout(completed)

      try {
        const firestoreId = await finishWorkoutInFirestore(finished)
        completed = { ...finished, firestoreId, syncStatus: 'synced' }
        saveLastCompletedWorkout(completed)
      } catch (error) {
        console.error(error)
      }

      return completed
    },
    [workout, user],
  )

  const value = useMemo(
    () => ({
      workout,
      hydrated,
      hasActiveWorkout: Boolean(workout),
      startNewWorkout,
      discardWorkout,
      addExercise,
      adjustRestSeconds,
      startExercise,
      skipPrep,
      completePrep,
      finishActiveSet,
      updateLastSetReps,
      updateSetReps,
      deleteSet,
      extendRest,
      startNextSet,
      finishCurrentExercise,
      clearCurrentExerciseSelection,
      completeWorkout,
      getCurrentExercise: () => getCurrentExercise(workout),
    }),
    [
      workout,
      hydrated,
      startNewWorkout,
      discardWorkout,
      addExercise,
      adjustRestSeconds,
      startExercise,
      skipPrep,
      completePrep,
      finishActiveSet,
      updateLastSetReps,
      updateSetReps,
      deleteSet,
      extendRest,
      startNextSet,
      finishCurrentExercise,
      clearCurrentExerciseSelection,
      completeWorkout,
    ],
  )

  return (
    <ActiveWorkoutContext.Provider value={value}>
      {children}
    </ActiveWorkoutContext.Provider>
  )
}
