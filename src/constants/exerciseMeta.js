/**
 * Freestyle Workout Tracker – gyakorlat metaadatok (címkék, opciók)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Mozgásminták / terhelési típusok – egy gyakorlatnak több is lehet
 * (pl. muscle-up: húzó + toló + skill, burpee: teljes test + cardio).
 *
 * Régi adat: egyetlen `category` mező – a getExerciseCategories() kezeli.
 */

export const EXERCISE_CATEGORIES = [
  { value: 'pull', label: 'Húzó (pull)' },
  { value: 'push', label: 'Toló (push)' },
  { value: 'core', label: 'Törzs (core)' },
  { value: 'legs', label: 'Láb (legs)' },
  { value: 'skill', label: 'Skill / technika' },
  { value: 'full_body', label: 'Teljes test' },
  { value: 'cardio', label: 'Cardio / kondíció' },
]

export const EXERCISE_TYPES = [
  { value: 'reps', label: 'Ismétlés (reps)' },
  { value: 'time', label: 'Idő (time)' },
]

/** Badge színek kategóriánként – listában jól megkülönböztethető */
export const CATEGORY_STYLES = {
  pull: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  push: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  core: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  legs: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  skill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  full_body: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  cardio: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
}

/**
 * @param {string} category – pl. "pull"
 * @returns {string} Megjelenítendő címke
 */
export function getCategoryLabel(category) {
  return EXERCISE_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

/**
 * @param {string} type – "reps" | "time"
 * @returns {string}
 */
export function getTypeLabel(type) {
  return EXERCISE_TYPES.find((t) => t.value === type)?.label ?? type
}

/**
 * Kategóriák kinyerése – támogatja a régi `category` és az új `categories` mezőt is.
 * @param {object} exercise
 * @returns {string[]}
 */
export function getExerciseCategories(exercise) {
  if (Array.isArray(exercise?.categories) && exercise.categories.length > 0) {
    return exercise.categories
  }
  if (exercise?.category) {
    return [exercise.category]
  }
  return []
}

/**
 * Kategóriák szöveges listája (pl. „Húzó · Toló · Skill”).
 */
export function formatCategoriesLabel(exercise) {
  return getExerciseCategories(exercise).map(getCategoryLabel).join(' · ')
}

/**
 * Szűrés: a gyakorlat illeszkedik-e a kiválasztott mintára?
 * @param {object} exercise
 * @param {string|null} filterCategory – null = mind
 */
export function exerciseMatchesCategoryFilter(exercise, filterCategory) {
  if (!filterCategory) return true
  return getExerciseCategories(exercise).includes(filterCategory)
}

/**
 * Kategória be/ki kapcsolása – legalább egy maradjon kiválasztva.
 * @param {string[]} current
 * @param {string} category
 */
export function toggleExerciseCategory(current, category) {
  if (current.includes(category)) {
    if (current.length === 1) return current
    return current.filter((c) => c !== category)
  }
  return [...current, category]
}

/**
 * Pihenőidő emberi olvasható formában.
 * @param {number} seconds
 */
export function formatRestSeconds(seconds) {
  if (seconds < 60) return `${seconds} mp pihenő`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${mins} perc pihenő`
  return `${mins} perc ${secs} mp pihenő`
}

/**
 * Firestore-ba menthető kategória mezők (categories + legacy category).
 * @param {string[]} categories
 */
export function buildCategoryPayload(categories) {
  const unique = [...new Set(categories)].filter(Boolean)
  return {
    categories: unique,
    category: unique[0] ?? null,
  }
}
