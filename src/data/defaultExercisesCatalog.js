/**
 * Freestyle Workout Tracker – helyi alap gyakorlat katalógus
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Fallback / vendég mód: scripts/data/defaultExercises.js – nem kell Firestore.
 */

import { defaultExercises } from '../../scripts/data/defaultExercises.js'

/**
 * @returns {object[]} Firestore-kompatibilis gyakorlat lista (id mezővel)
 */
export function loadLocalDefaultExercises() {
  return [...defaultExercises].sort((a, b) =>
    a.name.localeCompare(b.name, 'hu'),
  )
}
