/**
 * Freestyle Workout Tracker – statikus tartás pont
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import {
  getDifficultyMultiplier,
  getSetRepsOrSeconds,
  getStaticHoldFactor,
  getWorkoutBodyWeightKg,
  isTimeExercise,
  roundScore,
} from './helpers'

/**
 * @returns {number} pont – nem idő alapú szettre 0
 */
export function calculateSetHoldScore(set, exercise, workout) {
  if (!isTimeExercise(exercise)) return 0

  const seconds = getSetRepsOrSeconds(set)
  const bodyWeight = getWorkoutBodyWeightKg(workout)
  if (seconds == null || bodyWeight == null) return 0

  const score =
    seconds *
    bodyWeight *
    getStaticHoldFactor(exercise) *
    getDifficultyMultiplier(exercise)

  return roundScore(score) ?? 0
}

export function calculateExerciseHoldScore(exercise, workout) {
  return (exercise?.sets ?? []).reduce(
    (sum, set) => sum + calculateSetHoldScore(set, exercise, workout),
    0,
  )
}

/**
 * @returns {{ set, seconds, holdScore }|null}
 */
export function findBestHoldSetForExercise(exercise, workout) {
  if (!isTimeExercise(exercise)) return null

  let best = null

  for (const set of exercise?.sets ?? []) {
    const seconds = getSetRepsOrSeconds(set)
    if (seconds == null) continue

    const holdScore = calculateSetHoldScore(set, exercise, workout)

    if (!best || seconds > best.seconds) {
      best = { set, seconds, holdScore }
    }
  }

  return best
}
