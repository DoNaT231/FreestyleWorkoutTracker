/**
 * Freestyle Workout Tracker – utolsó befejezett edzés (összegző képernyőhöz)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { LAST_COMPLETED_WORKOUT_KEY } from '../constants/loadScore'

export function saveLastCompletedWorkout(workout) {
  try {
    sessionStorage.setItem(
      LAST_COMPLETED_WORKOUT_KEY,
      JSON.stringify(workout),
    )
  } catch (error) {
    console.error('lastCompletedWorkout mentési hiba:', error)
  }
}

export function loadLastCompletedWorkout() {
  try {
    const raw = sessionStorage.getItem(LAST_COMPLETED_WORKOUT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (error) {
    console.error('lastCompletedWorkout olvasási hiba:', error)
    return null
  }
}
