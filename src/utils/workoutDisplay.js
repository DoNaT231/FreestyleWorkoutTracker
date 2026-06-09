/**
 * Freestyle Workout Tracker – edzés megjelenítés segédek
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { SET_STATUS } from '../constants/workout'

/**
 * @param {object} set
 * @param {'reps'|'time'} exerciseType
 */
export function formatSetValue(set, exerciseType) {
  if (set.reps == null) return 'nincs megadva'
  return exerciseType === 'time' ? `${set.reps} mp` : `${set.reps} ismétlés`
}

/**
 * @param {object} workout
 */
export function getWorkoutStats(workout) {
  const exercises = workout.exercises ?? []
  const exerciseCount = exercises.length
  const setCount = exercises.reduce(
    (sum, ex) => sum + (ex.sets?.length ?? 0),
    0,
  )
  const missingReps = exercises.reduce(
    (sum, ex) =>
      sum +
      (ex.sets?.filter((s) => s.status === SET_STATUS.MISSING_REPS).length ??
        0),
    0,
  )

  return { exerciseCount, setCount, missingReps }
}

/**
 * Firestore Timestamp vagy ISO string → ISO string.
 * @param {unknown} value
 */
export function firestoreDateToIso(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return value.toDate().toISOString()
  }
  return null
}

/**
 * @param {import('firebase/firestore').DocumentSnapshot} snapshot
 */
export function mapWorkoutDocument(snapshot) {
  const data = snapshot.data()
  if (!data) return null

  return {
    firestoreId: snapshot.id,
    ...data,
    startedAt: firestoreDateToIso(data.startedAt),
    finishedAt: firestoreDateToIso(data.finishedAt),
    createdAt: firestoreDateToIso(data.createdAt),
    updatedAt: firestoreDateToIso(data.updatedAt),
  }
}
