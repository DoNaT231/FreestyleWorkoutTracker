/**
 * Freestyle Workout Tracker – demó edzés jelzés a Progress oldalon
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { countGuestWorkoutTypes } from '../../utils/guestWorkouts'

/**
 * @param {object} props
 * @param {object[]} props.workouts
 */
export default function ProgressDemoNotice({ workouts }) {
  const { demo, own, total } = countGuestWorkoutTypes(workouts)

  if (demo === 0) return null

  return (
    <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <p className="text-sm font-medium text-amber-200">Minta edzések a statisztikában</p>
      <p className="mt-2 text-sm leading-relaxed text-amber-100/90">
        <span className="font-semibold text-white">{demo} minta edzés</span>
        {own > 0 && (
          <>
            {' '}
            és <span className="font-semibold text-white">{own} saját edzés</span>
          </>
        )}{' '}
        – összesen {total} edzés szerepel az alábbi számításokban.
      </p>
      <p className="mt-2 text-xs text-amber-200/70">
        A minta edzések (Edzés 1–6) bemutató adatok a localStorage-ből – így
        kipróbálhatod a Progress funkciókat. A saját demó edzéseid külön
        jelöléssel kerülnek mentésre.
      </p>
    </section>
  )
}
