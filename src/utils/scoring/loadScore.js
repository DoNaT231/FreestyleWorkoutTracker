/**
 * Freestyle Workout Tracker – edzésterhelés (volume / workload)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Ismétléses gyakorlatokra. Nincs difficultyMultiplier.
 */

import {
  getAdditionalWeightKg,
  getBodyweightLoadFactor,
  getSetRepsOrSeconds,
  getWorkoutBodyWeightKg,
  isTimeExercise,
  roundScore,
} from './helpers'

/**
 * @returns {number|null} kg – null ha nincs testsúly snapshot
 */
export function calculateEffectiveLoadKg(set, exercise, workout) {
  const bodyWeight = getWorkoutBodyWeightKg(workout)
  if (bodyWeight == null) return null

  return (
    bodyWeight * getBodyweightLoadFactor(exercise) + getAdditionalWeightKg(set)
  )
}

/**
 * @returns {number} pont – idő alapú szettre 0
 */
export function calculateSetTrainingLoad(set, exercise, workout) {
  if (isTimeExercise(exercise)) return 0

  const reps = getSetRepsOrSeconds(set)
  if (reps == null) return 0

  const effectiveLoad = calculateEffectiveLoadKg(set, exercise, workout)
  if (effectiveLoad == null) return 0

  return roundScore(reps * effectiveLoad) ?? 0
}

export function calculateExerciseTrainingLoad(exercise, workout) {
  return (exercise?.sets ?? []).reduce(
    (sum, set) => sum + calculateSetTrainingLoad(set, exercise, workout),
    0,
  )
}

export function calculateWorkoutTrainingLoad(workout) {
  const bodyWeight = getWorkoutBodyWeightKg(workout)
  if (bodyWeight == null) return null

  const total = (workout?.exercises ?? []).reduce(
    (sum, exercise) => sum + calculateExerciseTrainingLoad(exercise, workout),
    0,
  )

  return roundScore(total)
}
