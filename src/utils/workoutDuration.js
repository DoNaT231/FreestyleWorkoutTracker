/**
 * Freestyle Workout Tracker – edzés időtartam
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

/**
 * @param {unknown} value
 * @returns {number}
 */
export function parseWorkoutDateMs(value) {
  if (!value) return Number.NaN
  if (typeof value === 'string') return new Date(value).getTime()
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null) {
    if ('toDate' in value && typeof value.toDate === 'function') {
      return value.toDate().getTime()
    }
    if ('seconds' in value) {
      return value.seconds * 1000
    }
  }
  return new Date(value).getTime()
}

/**
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDurationSeconds(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60

  if (minutes === 0) return `${remainder} mp`
  if (remainder === 0) return `${minutes} perc`
  return `${minutes} perc ${remainder} mp`
}

/**
 * Edzés teljes időtartama másodpercben.
 * @param {object|null|undefined} workout
 * @returns {number|null}
 */
export function getWorkoutDurationSeconds(workout) {
  if (!workout) return null

  const stored = Number(workout.durationSeconds)
  if (Number.isFinite(stored) && stored >= 0) return stored

  const start = parseWorkoutDateMs(workout.startedAt ?? workout.createdAt)
  const end = parseWorkoutDateMs(workout.finishedAt)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null
  }

  return Math.round((end - start) / 1000)
}

/**
 * @param {object|null|undefined} workout
 * @returns {string|null}
 */
export function formatWorkoutDuration(workout) {
  const seconds = getWorkoutDurationSeconds(workout)
  if (seconds == null) return null
  return formatDurationSeconds(seconds)
}
