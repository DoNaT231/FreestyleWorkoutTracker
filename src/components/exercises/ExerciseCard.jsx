/**
 * Freestyle Workout Tracker – gyakorlat kártya
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Egy gyakorlat megjelenítése listában – több mozgásminta badge-ként.
 */

import { Link } from 'react-router-dom'
import {
  formatRestSeconds,
  getExerciseCategories,
  getTypeLabel,
} from '../../constants/exerciseMeta'
import Button from '../ui/Button'
import CategoryBadge from './CategoryBadge'

/**
 * @param {object} props
 * @param {object} props.exercise – Firestore gyakorlat dokumentum
 * @param {boolean} [props.isCustom] – true = user exercises (szerkeszthető)
 * @param {() => void} [props.onDelete] – törlés callback
 * @param {boolean} [props.deleting] – törlés folyamatban
 */
export default function ExerciseCard({
  exercise,
  isCustom = false,
  onDelete,
  deleting = false,
}) {
  const categories = getExerciseCategories(exercise)

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white">{exercise.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{getTypeLabel(exercise.type)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <CategoryBadge key={category} category={category} />
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {formatRestSeconds(exercise.defaultRestSeconds)} ·{' '}
            {exercise.defaultPrepSeconds} mp felkészülés
          </p>
          {exercise.supportsAdditionalWeight && (
            <span className="mt-2 inline-block rounded-lg bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              + súly lehetséges
            </span>
          )}
        </div>

        {!isCustom && (
          <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-400">
            Alap
          </span>
        )}
      </div>

      {isCustom && (
        <div className="mt-4 flex gap-2">
          <Link to={`/exercises/${exercise.id}/edit`} className="flex-1">
            <Button variant="secondary" size="sm">
              Szerkesztés
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? 'Törlés...' : 'Törlés'}
          </Button>
        </div>
      )}
    </article>
  )
}
