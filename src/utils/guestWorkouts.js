/**
 * Freestyle Workout Tracker – vendég edzések listája
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import {
  ensureDemoWorkoutsSeeded,
  loadGuestWorkouts,
} from '../services/guestStorage'

export function isDemoWorkout(workout) {
  if (!workout) return false
  if (workout.isDemo === true) return true
  return String(workout.firestoreId ?? '').startsWith('demo-workout')
}

/**
 * @param {object[]} workouts
 */
export function countGuestWorkoutTypes(workouts) {
  const demo = workouts.filter(isDemoWorkout).length
  const own = workouts.length - demo
  return { demo, own, total: workouts.length }
}

export function getGuestWorkouts() {
  ensureDemoWorkoutsSeeded()
  const workouts = loadGuestWorkouts()

  return [...workouts].sort(
    (a, b) =>
      new Date(b.finishedAt ?? b.startedAt).getTime() -
      new Date(a.finishedAt ?? a.startedAt).getTime(),
  )
}

export function getGuestWorkoutById(workoutId) {
  return getGuestWorkouts().find((w) => w.firestoreId === workoutId) ?? null
}
