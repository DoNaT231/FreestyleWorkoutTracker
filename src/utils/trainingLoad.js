/**
 * Freestyle Workout Tracker – edzésterhelés számítás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * A testsúly mindig a workout.bodyWeightKgAtWorkout snapshotból jön –
 * nem a live profilból.
 */

/**
 * @param {unknown} value
 * @returns {number|null}
 */
export function parsePositiveNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/**
 * @param {object} exercise
 * @returns {number}
 */
function getDifficultyMultiplier(exercise) {
  const n = Number(exercise?.difficultyMultiplier)
  return Number.isFinite(n) && n > 0 ? n : 1
}

/**
 * @param {object} workout
 * @returns {number|null}
 */
export function getWorkoutBodyWeightKg(workout) {
  return parsePositiveNumber(workout?.bodyWeightKgAtWorkout)
}

/**
 * @param {object} exercise
 * @returns {string|null}
 */
export function getExercisePrimaryCategory(exercise) {
  if (exercise?.primaryCategory) return exercise.primaryCategory
  if (exercise?.category) return exercise.category
  if (Array.isArray(exercise?.categories) && exercise.categories.length > 0) {
    return exercise.categories[0]
  }
  return null
}

/**
 * @param {object} workout
 * @returns {boolean}
 */
export function canCalculateWorkoutLoadScore(workout) {
  return getWorkoutBodyWeightKg(workout) != null
}

/**
 * Egy szett edzésterhelése.
 * @param {object} set
 * @param {object} exercise
 * @param {object} workout
 * @returns {number}
 */
export function calculateSetLoadScore(set, exercise, workout) {
  const bodyWeight = getWorkoutBodyWeightKg(workout)
  if (bodyWeight == null) return 0

  const value = parsePositiveNumber(set?.reps)
  if (value == null) return 0

  const difficultyMultiplier = getDifficultyMultiplier(exercise)

  if (exercise?.type === 'time') {
    const staticHoldFactor = parsePositiveNumber(exercise?.staticHoldFactor) ?? 0
    return Math.round(
      value * bodyWeight * staticHoldFactor * difficultyMultiplier,
    )
  }

  const bodyweightLoadFactor =
    parsePositiveNumber(exercise?.bodyweightLoadFactor) ?? 0
  const additionalWeightKg = parsePositiveNumber(set?.additionalWeightKg) ?? 0

  return Math.round(
    value *
      (bodyWeight * bodyweightLoadFactor + additionalWeightKg) *
      difficultyMultiplier,
  )
}

/**
 * @param {object} exercise
 * @param {object} workout
 * @returns {number}
 */
export function calculateExerciseLoadScore(exercise, workout) {
  return (exercise?.sets ?? []).reduce(
    (sum, set) => sum + calculateSetLoadScore(set, exercise, workout),
    0,
  )
}

/**
 * @param {object} workout
 * @returns {number}
 */
export function calculateWorkoutLoadScore(workout) {
  return (workout?.exercises ?? []).reduce(
    (sum, exercise) => sum + calculateExerciseLoadScore(exercise, workout),
    0,
  )
}

/**
 * @param {object} workout
 * @returns {Record<string, { sets: number, reps: number, timeSeconds: number, loadScore: number }>}
 */
export function calculateCategoryLoadBreakdown(workout) {
  const breakdown = {}

  for (const exercise of workout?.exercises ?? []) {
    const category = getExercisePrimaryCategory(exercise)
    if (!category) continue

    if (!breakdown[category]) {
      breakdown[category] = {
        sets: 0,
        reps: 0,
        timeSeconds: 0,
        loadScore: 0,
      }
    }

    const bucket = breakdown[category]
    const timeBased = exercise.type === 'time'

    for (const set of exercise.sets ?? []) {
      bucket.sets += 1
      const value = parsePositiveNumber(set?.reps)
      if (value != null) {
        if (timeBased) bucket.timeSeconds += value
        else bucket.reps += value
      }
      bucket.loadScore += calculateSetLoadScore(set, exercise, workout)
    }
  }

  for (const key of Object.keys(breakdown)) {
    breakdown[key].loadScore = Math.round(breakdown[key].loadScore)
  }

  return breakdown
}

/**
 * @param {object} workout
 */
export function calculateWorkoutTotals(workout) {
  let totalSets = 0
  let totalReps = 0
  let totalTimeSeconds = 0
  const exercises = workout?.exercises ?? []

  for (const exercise of exercises) {
    const timeBased = exercise.type === 'time'
    for (const set of exercise.sets ?? []) {
      totalSets += 1
      const value = parsePositiveNumber(set?.reps)
      if (value == null) continue
      if (timeBased) totalTimeSeconds += value
      else totalReps += value
    }
  }

  const bodyWeightMissing = !canCalculateWorkoutLoadScore(workout)

  return {
    totalExercises: exercises.length,
    totalSets,
    totalReps,
    totalTimeSeconds,
    workoutLoadScore: bodyWeightMissing
      ? null
      : calculateWorkoutLoadScore(workout),
    categoryLoadBreakdown: calculateCategoryLoadBreakdown(workout),
    bodyWeightMissing,
  }
}

/**
 * @param {number|null|undefined} score
 * @returns {string}
 */
export function formatLoadScore(score) {
  if (score == null || !Number.isFinite(score)) return '—'
  return `${Math.round(score)} pont`
}
