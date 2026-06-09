/**
 * Freestyle Workout Tracker – gyakorlat űrlap (létrehozás / szerkesztés)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Saját gyakorlat mezői: név, mozgásminták (több), típus, pihenő, +súly.
 */

import { EXERCISE_TYPES } from '../../constants/exerciseMeta'
import Button from '../ui/Button'
import Input from '../ui/Input'
import CategoryPicker from './CategoryPicker'

const selectClassName =
  'min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 text-base text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30'

/**
 * @param {object} props
 * @param {object} props.values – űrlap értékek
 * @param {(field: string, value: unknown) => void} props.onChange
 * @param {(e: React.FormEvent) => void} props.onSubmit
 * @param {boolean} props.submitting
 * @param {string} props.submitLabel
 * @param {string} [props.error]
 */
export default function ExerciseForm({
  values,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
  error,
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        id="exercise-name"
        label="Gyakorlat neve"
        placeholder="pl. Muscle-up, Burpee"
        value={values.name}
        onChange={(e) => onChange('name', e.target.value)}
        required
        disabled={submitting}
      />

      <CategoryPicker
        value={values.categories}
        onChange={(categories) => onChange('categories', categories)}
        disabled={submitting}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="exercise-type" className="text-sm font-medium text-slate-300">
          Mérési típus
        </label>
        <select
          id="exercise-type"
          className={selectClassName}
          value={values.type}
          onChange={(e) => onChange('type', e.target.value)}
          disabled={submitting}
        >
          {EXERCISE_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Input
        id="exercise-rest"
        label="Alap pihenőidő (másodperc)"
        type="number"
        min={0}
        step={5}
        inputMode="numeric"
        value={values.defaultRestSeconds}
        onChange={(e) =>
          onChange('defaultRestSeconds', Number(e.target.value))
        }
        required
        disabled={submitting}
      />

      <Input
        id="exercise-prep"
        label="Alap felkészülési idő (másodperc)"
        type="number"
        min={0}
        step={5}
        inputMode="numeric"
        value={values.defaultPrepSeconds}
        onChange={(e) =>
          onChange('defaultPrepSeconds', Number(e.target.value))
        }
        required
        disabled={submitting}
      />

      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4">
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-slate-600 accent-emerald-500"
          checked={values.supportsAdditionalWeight}
          onChange={(e) =>
            onChange('supportsAdditionalWeight', e.target.checked)
          }
          disabled={submitting}
        />
        <span className="text-sm text-slate-300">Lehetséges plusz súly</span>
      </label>

      {error && (
        <p
          className="rounded-xl border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="xl" disabled={submitting}>
        {submitting ? 'Mentés...' : submitLabel}
      </Button>
    </form>
  )
}
