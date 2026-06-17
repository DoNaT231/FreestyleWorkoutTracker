/**
 * Freestyle Workout Tracker – vendég tárolás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Edzések: localStorage (nem Firestore).
 * Gyakorlatok: helyi defaultExercises katalógus (scripts/data).
 */

import {
  GUEST_ACTIVE_WORKOUT_KEY,
  GUEST_SESSION_KEY,
  GUEST_WORKOUTS_KEY,
} from '../constants/guest'
import { getDemoWorkouts } from '../data/demoData'

export const GUEST_WORKOUTS_UPDATED_EVENT = 'fwt-guest-workouts-updated'

function notifyGuestWorkoutsUpdated() {
  window.dispatchEvent(new Event(GUEST_WORKOUTS_UPDATED_EVENT))
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function saveGuestSession() {
  localStorage.setItem(GUEST_SESSION_KEY, '1')
}

export function clearGuestSession({ keepWorkouts = false } = {}) {
  localStorage.removeItem(GUEST_SESSION_KEY)
  localStorage.removeItem(GUEST_ACTIVE_WORKOUT_KEY)
  if (!keepWorkouts) {
    localStorage.removeItem(GUEST_WORKOUTS_KEY)
  }
}

export function hasGuestSession() {
  return localStorage.getItem(GUEST_SESSION_KEY) === '1'
}

/**
 * Minta edzések betöltése localStorage-be (első belépés / hiányzó minták pótlása).
 * A felhasználó által mentett edzéseket nem írja felül.
 */
export function ensureDemoWorkoutsSeeded() {
  const existing = loadGuestWorkouts()
  const demos = getDemoWorkouts()
  const existingIds = new Set(existing.map((w) => w.firestoreId))
  const missing = demos.filter((d) => !existingIds.has(d.firestoreId))

  if (existing.length === 0) {
    saveGuestWorkouts(demos)
    return demos
  }

  if (missing.length > 0) {
    saveGuestWorkouts([...existing, ...missing])
  }

  return loadGuestWorkouts()
}

/** @deprecated use ensureDemoWorkoutsSeeded */
export function seedGuestWorkoutsIfEmpty() {
  return ensureDemoWorkoutsSeeded()
}

export function loadGuestWorkouts() {
  return readJson(GUEST_WORKOUTS_KEY, [])
}

export function saveGuestWorkouts(workouts) {
  writeJson(GUEST_WORKOUTS_KEY, workouts)
  notifyGuestWorkoutsUpdated()
}

export function appendGuestWorkout(workout) {
  const list = loadGuestWorkouts()
  const without = list.filter((w) => w.firestoreId !== workout.firestoreId)
  saveGuestWorkouts([workout, ...without])
}

export function upsertGuestWorkout(workout) {
  appendGuestWorkout(workout)
}

export function removeGuestWorkout(workoutId) {
  const list = loadGuestWorkouts().filter((w) => w.firestoreId !== workoutId)
  writeJson(GUEST_WORKOUTS_KEY, list)
  notifyGuestWorkoutsUpdated()
}

export function loadGuestActiveWorkout() {
  return readJson(GUEST_ACTIVE_WORKOUT_KEY, null)
}

export function saveGuestActiveWorkout(workout) {
  if (!workout) {
    localStorage.removeItem(GUEST_ACTIVE_WORKOUT_KEY)
    return
  }
  writeJson(GUEST_ACTIVE_WORKOUT_KEY, workout)
}

export function clearGuestActiveWorkout() {
  localStorage.removeItem(GUEST_ACTIVE_WORKOUT_KEY)
}
