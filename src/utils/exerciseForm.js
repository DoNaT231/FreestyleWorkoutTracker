/**
 * Freestyle Workout Tracker – gyakorlat űrlap alapértékek
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * A categories tömb: több mozgásminta egyszerre (pl. pull + push).
 */

import {
  buildCategoryPayload,
  getExerciseCategories,
} from '../constants/exerciseMeta'

export const EMPTY_EXERCISE_FORM = {
  name: '',
  categories: ['pull'],
  type: 'reps',
  defaultRestSeconds: 60,
  defaultPrepSeconds: 10,
  supportsAdditionalWeight: false,
}

/**
 * Firestore dokumentumból űrlap értékek.
 */
export function exerciseToFormValues(exercise) {
  const categories = getExerciseCategories(exercise)

  return {
    name: exercise.name ?? '',
    categories: categories.length > 0 ? categories : ['pull'],
    type: exercise.type ?? 'reps',
    defaultRestSeconds: exercise.defaultRestSeconds ?? 60,
    defaultPrepSeconds: exercise.defaultPrepSeconds ?? 10,
    supportsAdditionalWeight: Boolean(exercise.supportsAdditionalWeight),
  }
}

/**
 * Űrlap értékekből Firestore-ba mentendő objektum.
 */
export function formValuesToExercisePayload(values) {
  return {
    name: values.name.trim(),
    ...buildCategoryPayload(values.categories),
    type: values.type,
    defaultRestSeconds: Number(values.defaultRestSeconds),
    defaultPrepSeconds: Number(values.defaultPrepSeconds),
    supportsAdditionalWeight: values.supportsAdditionalWeight,
  }
}

/**
 * @param {object} values – űrlap állapot
 * @returns {string|null} Hibaüzenet vagy null
 */
export function validateExerciseForm(values) {
  if (!values.name?.trim()) {
    return 'Add meg a gyakorlat nevét.'
  }
  if (!values.categories?.length) {
    return 'Válassz legalább egy mozgásmintát (pl. húzó, toló).'
  }
  return null
}
