/**
 * Freestyle Workout Tracker – pihenőidő állító
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * -10 / +10 / +30 mp gombok az aktuális gyakorlat pihenőidejéhez.
 */

import { formatRestSeconds } from '../../constants/exerciseMeta'
import Button from '../ui/Button'

/**
 * @param {object} props
 * @param {number} props.restSeconds
 * @param {(delta: number) => void} props.onAdjust
 * @param {boolean} [props.disabled]
 */
export default function RestTimeAdjuster({
  restSeconds,
  onAdjust,
  disabled = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">Pihenőidő ezen a gyakorlaton</p>
      <p className="mt-1 text-xl font-bold text-white">
        {formatRestSeconds(restSeconds).replace(' pihenő', '')}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAdjust(-10)}
          disabled={disabled}
        >
          −10 mp
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAdjust(10)}
          disabled={disabled}
        >
          +10 mp
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAdjust(30)}
          disabled={disabled}
        >
          +30 mp
        </Button>
      </div>
    </div>
  )
}
