/**
 * Freestyle Workout Tracker – edzés objektumok létrehozása
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Új edzés, gyakorlat másolása az edzésbe, szettek – a dokumentáció szerinti struktúra.
 */

import {
  getExerciseCategories,
  getPrimaryCategory,
} from '../constants/exerciseMeta'
import {
  SET_STATUS,
  SYNC_STATUS,
  TIMER_PHASE,
  WORKOUT_STATUS,
} from '../constants/workout'
import { generateLocalId } from './id'
import { idleTimer } from './timer'

/**
 * Új edzés váz.
 * @param {string} userId
 * @param {{ name: string, customName: boolean, workoutNumber: number, bodyWeightKgAtWorkout?: number|null, heightCmAtWorkout?: number|null }} options
 */
export function createWorkout(
  userId,
  {
    name,
    customName,
    workoutNumber,
    bodyWeightKgAtWorkout = null,
    heightCmAtWorkout = null,
  },
) {
  const resolvedName = customName ? name.trim() : `Edzés ${workoutNumber}`

  return {
    userId,
    firestoreId: null,
    name: resolvedName,
    customName,
    status: WORKOUT_STATUS.IN_PROGRESS,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    bodyWeightKgAtWorkout,
    heightCmAtWorkout,
    syncStatus: SYNC_STATUS.PENDING,
    exercises: [],
    currentExerciseLocalId: null,
    timer: idleTimer(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Firestore/default gyakorlat másolása az edzésbe (snapshot – később nem változik).
 */
export function createWorkoutExerciseFromTemplate(template, source) {
  const categories = getExerciseCategories(template)
  const primaryCategory = getPrimaryCategory(template)

  return {
    localId: generateLocalId('ex'),
    exerciseId: template.id,
    source,
    name: template.name,
    categories,
    category: categories[0] ?? null,
    primaryCategory,
    type: template.type,
    restSeconds: template.defaultRestSeconds ?? 60,
    prepSeconds: template.defaultPrepSeconds ?? 10,
    supportsAdditionalWeight: Boolean(template.supportsAdditionalWeight),
    bodyweightLoadFactor: template.bodyweightLoadFactor ?? null,
    difficultyMultiplier: template.difficultyMultiplier ?? null,
    staticHoldFactor: template.staticHoldFactor ?? null,
    illustrationKey: template.illustrationKey ?? null,
    status: WORKOUT_STATUS.IN_PROGRESS,
    sets: [],
  }
}

/**
 * Új szett rekord.
 */
export function createSet(setNumber) {
  return {
    localId: generateLocalId('set'),
    setNumber,
    reps: null,
    status: SET_STATUS.MISSING_REPS,
    startedAt: new Date().toISOString(),
    finishedAt: null,
  }
}

/**
 * Aktuális gyakorlat keresése localId alapján.
 */
export function getCurrentExercise(workout) {
  if (!workout?.currentExerciseLocalId) return null
  return (
    workout.exercises.find(
      (ex) => ex.localId === workout.currentExerciseLocalId,
    ) ?? null
  )
}

/**
 * Szett lezárása – reps opcionális (hiányos szett megengedett).
 */
export function finishSetRecord(set, reps) {
  const hasReps = reps !== null && reps !== undefined && reps !== ''
  const numericReps = hasReps ? Number(reps) : null

  return {
    ...set,
    reps: numericReps,
    status: hasReps ? SET_STATUS.COMPLETED : SET_STATUS.MISSING_REPS,
    finishedAt: new Date().toISOString(),
  }
}

/**
 * Edzés frissítése immutábilisan (helper).
 */
export function patchWorkout(workout, patch) {
  return {
    ...workout,
    ...patch,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Gyakorlat frissítése az exercises tömbben.
 */
export function patchExerciseInWorkout(workout, exerciseLocalId, patch) {
  return patchWorkout(workout, {
    exercises: workout.exercises.map((ex) =>
      ex.localId === exerciseLocalId ? { ...ex, ...patch } : ex,
    ),
  })
}

/**
 * Timer fázis ellenőrzés – aktív szett folyamatban?
 */
export function isActiveSetPhase(timer) {
  return timer?.phase === TIMER_PHASE.ACTIVE_SET
}
