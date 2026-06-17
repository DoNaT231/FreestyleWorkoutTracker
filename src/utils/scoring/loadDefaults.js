/**
 * Freestyle Workout Tracker – terhelési tényezők feloldása
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Ha a snapshot / Firestore nem tartalmaz load mezőket, a seed katalógusból
 * vagy kategória-alapú fallbackből töltjük ki (régi adatok és nem frissített seed).
 */

import { getPrimaryCategory } from '../../constants/exerciseMeta'
import { defaultExercises } from '../../../scripts/data/defaultExercises.js'

/** @type {Record<string, { bodyweightLoadFactor: number|null, staticHoldFactor: number|null, difficultyMultiplier: number|null }>} */
export const EXERCISE_LOAD_CATALOG = Object.fromEntries(
  defaultExercises.map(
    ({ id, bodyweightLoadFactor, staticHoldFactor, difficultyMultiplier }) => [
      id,
      { bodyweightLoadFactor, staticHoldFactor, difficultyMultiplier },
    ],
  ),
)

/** Ismétléses gyakorlatok – ha nincs egyedi tényező */
export const CATEGORY_BODYWEIGHT_LOAD_FALLBACK = {
  pull: 1.0,
  push: 0.7,
  core: 0.35,
  legs: 0.75,
  skill: 0.5,
  full_body: 0.85,
  cardio: 0.4,
}

/** Idő alapú tartások – ha nincs egyedi tényező */
export const CATEGORY_STATIC_HOLD_FALLBACK = {
  core: 0.03,
  skill: 0.035,
  pull: 0.03,
  push: 0.03,
  full_body: 0.03,
}

function isTimeExercise(exercise) {
  return exercise?.type === 'time'
}

function getPrimary(exercise) {
  return getPrimaryCategory(exercise) ?? exercise?.primaryCategory ?? null
}

function hasExplicitNumericField(value) {
  return value !== null && value !== undefined && value !== ''
}

function fromCatalog(exerciseId, field) {
  if (!exerciseId) return null
  const entry = EXERCISE_LOAD_CATALOG[exerciseId]
  if (!entry) return null
  const value = entry[field]
  return value != null ? Number(value) : null
}

/**
 * @returns {number}
 */
export function resolveBodyweightLoadFactor(exercise) {
  if (hasExplicitNumericField(exercise?.bodyweightLoadFactor)) {
    const n = Number(exercise.bodyweightLoadFactor)
    return Number.isFinite(n) && n >= 0 ? n : 0
  }

  const fromId = fromCatalog(exercise?.exerciseId, 'bodyweightLoadFactor')
  if (fromId != null && fromId >= 0) return fromId

  if (!isTimeExercise(exercise)) {
    const category = getPrimary(exercise)
    return CATEGORY_BODYWEIGHT_LOAD_FALLBACK[category] ?? 0
  }

  return 0
}

/**
 * @returns {number}
 */
export function resolveStaticHoldFactor(exercise) {
  if (hasExplicitNumericField(exercise?.staticHoldFactor)) {
    const n = Number(exercise.staticHoldFactor)
    return Number.isFinite(n) && n >= 0 ? n : 0
  }

  const fromId = fromCatalog(exercise?.exerciseId, 'staticHoldFactor')
  if (fromId != null && fromId >= 0) return fromId

  if (isTimeExercise(exercise)) {
    const category = getPrimary(exercise)
    return CATEGORY_STATIC_HOLD_FALLBACK[category] ?? 0
  }

  return 0
}

/**
 * @returns {number}
 */
export function resolveDifficultyMultiplier(exercise) {
  if (hasExplicitNumericField(exercise?.difficultyMultiplier)) {
    const n = Number(exercise.difficultyMultiplier)
    return Number.isFinite(n) && n > 0 ? n : 1
  }

  const fromId = fromCatalog(exercise?.exerciseId, 'difficultyMultiplier')
  if (fromId != null && fromId > 0) return fromId

  return 1
}

/**
 * Edzés snapshot-hoz – minden load mező feloldva.
 */
export function resolveExerciseLoadSnapshot(template) {
  return {
    bodyweightLoadFactor: resolveBodyweightLoadFactor(template),
    staticHoldFactor: resolveStaticHoldFactor(template),
    difficultyMultiplier: resolveDifficultyMultiplier(template),
  }
}
