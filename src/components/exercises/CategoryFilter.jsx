/**
 * Freestyle Workout Tracker – gyakorlat szűrő (mozgásminta)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Horizontálisan görgethető chip sor – gyakorlatlista szűréséhez.
 */

import { EXERCISE_CATEGORIES } from '../../constants/exerciseMeta'

const chipClass = (active) =>
  `shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
    active
      ? 'bg-emerald-500 text-slate-950'
      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
  }`

/**
 * @param {object} props
 * @param {string|null} props.value – aktív szűrő (null = mind)
 * @param {(category: string|null) => void} props.onChange
 */
export default function CategoryFilter({ value, onChange }) {
  return (
    <fieldset className="min-w-0 w-full shrink-0">
      <legend className="mb-1 text-xs font-medium text-slate-400">
        Szűrés mozgásminta szerint
      </legend>
      <div
        className="app-scroll-x w-full pb-2"
        role="group"
        aria-label="Szűrés mozgásminta szerint"
      >
        <div className="flex w-max gap-1.5 pr-1">
          <button
            type="button"
            onClick={() => onChange(null)}
            className={chipClass(value === null)}
            aria-pressed={value === null}
          >
            Mind
          </button>
          {EXERCISE_CATEGORIES.map(({ value: categoryValue, shortLabel }) => (
            <button
              key={categoryValue}
              type="button"
              onClick={() => onChange(categoryValue)}
              className={chipClass(value === categoryValue)}
              aria-pressed={value === categoryValue}
            >
              {shortLabel}
            </button>
          ))}
        </div>
      </div>
    </fieldset>
  )
}
