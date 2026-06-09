/**
 * Freestyle Workout Tracker – aktív edzés localStorage
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Local-first: minden fontos változás először ide kerül (activeWorkout kulcs).
 */

import { ACTIVE_WORKOUT_STORAGE_KEY } from '../constants/workout'

/**
 * @returns {object|null}
 */
export function loadActiveWorkout() {
  try {
    const raw = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (error) {
    console.error('activeWorkout olvasási hiba:', error)
    return null
  }
}

/**
 * @param {object} workout
 */
export function saveActiveWorkout(workout) {
  localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(workout))
}

export function clearActiveWorkout() {
  localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY)
}
