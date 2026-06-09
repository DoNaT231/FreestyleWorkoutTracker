/**
 * Freestyle Workout Tracker – edzés konstansok
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Timer fázisok, szett/edzés státuszok, localStorage kulcs.
 */

export const ACTIVE_WORKOUT_STORAGE_KEY = 'activeWorkout'

export const TIMER_PHASE = {
  IDLE: 'idle',
  PREP: 'prep',
  ACTIVE_SET: 'active_set',
  REST: 'rest',
}

export const SET_STATUS = {
  COMPLETED: 'completed',
  MISSING_REPS: 'missing_reps',
}

export const WORKOUT_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
}

export const SYNC_STATUS = {
  SYNCED: 'synced',
  PENDING: 'pendingSync',
}
