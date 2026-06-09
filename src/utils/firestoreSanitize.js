/**
 * Freestyle Workout Tracker – Firestore adattisztítás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Firestore nem fogad el undefined értékeket – rekurzívan eltávolítjuk.
 * Kliens-only mezők nem kerülnek a dokumentumba.
 */

const CLIENT_ONLY_FIELDS = new Set([
  'firestoreId',
  'currentExerciseLocalId',
])

/**
 * @param {unknown} value
 * @returns {unknown}
 */
function stripUndefined(value) {
  if (value === undefined) return undefined

  if (value === null) return null

  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefined(item))
      .filter((item) => item !== undefined)
  }

  if (typeof value === 'object') {
    const result = {}
    for (const [key, val] of Object.entries(value)) {
      const cleaned = stripUndefined(val)
      if (cleaned !== undefined) {
        result[key] = cleaned
      }
    }
    return result
  }

  return value
}

/**
 * Edzés objektum Firestore-ba írás előtt.
 * @param {object} workout
 */
export function sanitizeWorkoutForFirestore(workout) {
  const copy = { ...workout }

  for (const field of CLIENT_ONLY_FIELDS) {
    delete copy[field]
  }

  return stripUndefined(copy)
}
