/**
 * Freestyle Workout Tracker – erőszint (Epley becsült 1RM)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { calculateEffectiveLoadKg } from './loadScore'
import {
  getSetRepsOrSeconds,
  getWorkoutBodyWeightKg,
  isTimeExercise,
  roundScore,
} from './helpers'

/**
 * @param {number} reps
 * @returns {'high'|'medium'|'low'|null}
 */
export function getStrengthScoreReliability(reps) {
  if (reps == null || reps <= 0) return null
  if (reps <= 5) return 'high'
  if (reps <= 10) return 'medium'
  return 'low'
}

/**
 * @returns {number|null} kg
 */
export function calculateEstimated1RM(set, exercise, workout) {
  if (isTimeExercise(exercise)) return null

  const reps = getSetRepsOrSeconds(set)
  if (reps == null) return null

  const effectiveLoad = calculateEffectiveLoadKg(set, exercise, workout)
  if (effectiveLoad == null) return null

  const estimated = effectiveLoad * (1 + reps / 30)
  return roundScore(estimated * 10) / 10
}

/**
 * @returns {number|null} arány (pl. 1.25 = testsúly 125%-a)
 */
export function calculateRelativeStrength(set, exercise, workout) {
  if (isTimeExercise(exercise)) return null

  const bodyWeight = getWorkoutBodyWeightKg(workout)
  const estimated1RM = calculateEstimated1RM(set, exercise, workout)
  if (bodyWeight == null || estimated1RM == null) return null

  return Math.round((estimated1RM / bodyWeight) * 1000) / 1000
}

/**
 * @returns {{ set, estimated1RM, relativeStrength, reps, reliability }|null}
 */
export function findBestStrengthSetForExercise(exercise, workout) {
  if (isTimeExercise(exercise)) return null

  let best = null

  for (const set of exercise?.sets ?? []) {
    const estimated1RM = calculateEstimated1RM(set, exercise, workout)
    if (estimated1RM == null) continue

    if (!best || estimated1RM > best.estimated1RM) {
      const reps = getSetRepsOrSeconds(set)
      best = {
        set,
        estimated1RM,
        relativeStrength: calculateRelativeStrength(set, exercise, workout),
        reps,
        reliability: getStrengthScoreReliability(reps),
      }
    }
  }

  return best
}
