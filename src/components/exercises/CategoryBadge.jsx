/**
 * Freestyle Workout Tracker – kategória badge
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Egy mozgásminta megjelenítése színes címkén (pl. Húzó, Toló, Teljes test).
 */

import {
  CATEGORY_STYLES,
  getCategoryLabel,
} from '../../constants/exerciseMeta'

/**
 * @param {object} props
 * @param {string} props.category – pl. "pull"
 */
export default function CategoryBadge({ category }) {
  const style =
    CATEGORY_STYLES[category] ??
    'bg-slate-800 text-slate-300 border-slate-700'

  return (
    <span
      className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {getCategoryLabel(category)}
    </span>
  )
}
