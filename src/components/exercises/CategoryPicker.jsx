/**
 * Freestyle Workout Tracker – több kategória választó
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Mobilbarát multi-select: pl. muscle-up = húzó + toló + skill egyszerre.
 * Legalább egy kategória kötelező (az utolsó nem kapcsolható ki).
 */

import {
  EXERCISE_CATEGORIES,
  toggleExerciseCategory,
} from '../../constants/exerciseMeta'

/**
 * @param {object} props
 * @param {string[]} props.value – kiválasztott kategória értékek
 * @param {(categories: string[]) => void} props.onChange
 * @param {boolean} [props.disabled]
 */
export default function CategoryPicker({ value, onChange, disabled = false }) {
  const handleToggle = (category) => {
    onChange(toggleExerciseCategory(value, category))
  }

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-1 text-sm font-medium text-slate-300">
        Mozgásminták / terhelés
      </legend>
      <p className="text-xs text-slate-500">
        Több is választható – pl. muscle-up: húzó + toló, burpee: teljes test +
        cardio.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {EXERCISE_CATEGORIES.map(({ value: categoryValue, label }) => {
          const selected = value.includes(categoryValue)

          return (
            <button
              key={categoryValue}
              type="button"
              onClick={() => handleToggle(categoryValue)}
              className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                selected
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-white'
              }`}
              aria-pressed={selected}
            >
              {label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
