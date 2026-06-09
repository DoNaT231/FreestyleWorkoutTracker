/**
 * Freestyle Workout Tracker – gyakorlat seed payload normalizálás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * A seed adatokban lehet régi `category` vagy új `categories` mező –
 * Firestore-ba mindig categories tömb + legacy category kerül.
 */

import { buildCategoryPayload } from '../../src/constants/exerciseMeta.js'

/**
 * @param {object} data – gyakorlat mezők (id nélkül)
 */
export function buildExerciseSeedPayload(data) {
  const { category, categories, ...rest } = data

  const categoryList =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : category
        ? [category]
        : []

  return {
    ...rest,
    ...buildCategoryPayload(categoryList),
  }
}
