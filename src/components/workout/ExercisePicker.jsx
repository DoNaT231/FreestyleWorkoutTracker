/**
 * Freestyle Workout Tracker – gyakorlat választó szűréssel
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Név szerinti keresés + mozgásminta szűrő. A lista külön görgethető –
 * a vissza gomb a layout footerben marad fixen alul.
 */

import { useMemo, useState } from 'react'
import CategoryBadge from '../exercises/CategoryBadge'
import CategoryFilter from '../exercises/CategoryFilter'
import {
  exerciseMatchesCategoryFilter,
  getExerciseCategories,
} from '../../constants/exerciseMeta'
import Input from '../ui/Input'

/**
 * @param {object} props
 * @param {object[]} props.exercises – { id, name, source, ... }
 * @param {(exercise: object, source: string) => void} props.onSelect
 * @param {boolean} [props.disabled]
 */
export default function ExercisePicker({ exercises, onSelect, disabled }) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return exercises.filter((ex) => {
      const matchesName =
        !query || ex.name.toLowerCase().includes(query)
      const matchesCategory = exerciseMatchesCategoryFilter(ex, categoryFilter)
      return matchesName && matchesCategory
    })
  }, [exercises, search, categoryFilter])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Input
        id="exercise-search"
        label="Keresés név szerint"
        placeholder="pl. húzódzkodás, muscle-up"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
      />

      <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />

      <p className="shrink-0 text-xs text-slate-500">
        {filtered.length} gyakorlat
        {(search || categoryFilter) && ` (szűrve ${exercises.length}-ból)`}
      </p>

      {/* Csak a gyakorlatlista görget – kereső/szűrő fixen fent marad */}
      <div className="min-h-0 flex-1 h-full overflow-y-auto">
        <div className="flex flex-col gap-2 pb-2">
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
              Nincs találat. Próbálj más keresőszót vagy szűrőt.
            </p>
          ) : (
            filtered.map((ex) => (
              <button
                key={`${ex.source}-${ex.id}`}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(ex, ex.source)}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left transition-colors hover:border-slate-600 disabled:opacity-50"
              >
                <p className="font-semibold text-white">{ex.name}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {getExerciseCategories(ex).map((cat) => (
                    <CategoryBadge key={cat} category={cat} />
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
