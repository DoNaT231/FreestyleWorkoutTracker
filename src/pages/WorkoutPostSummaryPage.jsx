/**
 * Freestyle Workout Tracker – poszt-edzés összegző képernyő
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useActiveWorkout } from '../hooks/useActiveWorkout'
import CategoryLoadBreakdownList from '../components/summary/CategoryLoadBreakdownList'
import ExerciseSummaryCard from '../components/summary/ExerciseSummaryCard'
import HighlightCard from '../components/summary/HighlightCard'
import SummaryStatCard from '../components/summary/SummaryStatCard'
import WeeklyInsightCard from '../components/summary/WeeklyInsightCard'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import {
  formatEstimated1RM,
  formatRelativeStrength,
  formatReliability,
  formatScorePoints,
} from '../utils/scoring/format'
import { useAuth } from '../hooks/useAuth'
import { loadLastCompletedWorkout } from '../services/lastWorkoutSummaryStorage'
import { fetchUserWorkouts } from '../services/workoutService'
import { isGuestUser } from '../utils/guestUser'
import { getGuestWorkouts } from '../utils/guestWorkouts'
import { buildPostWorkoutSummary } from '../utils/workoutSummary'

export default function WorkoutPostSummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { discardWorkout } = useActiveWorkout()
  const workout = location.state?.workout ?? loadLastCompletedWorkout()
  const [pastWorkouts, setPastWorkouts] = useState([])

  useEffect(() => {
    if (workout) discardWorkout()
  }, [workout, discardWorkout])

  useEffect(() => {
    if (!user || !workout) return

    let cancelled = false

    if (isGuestUser(user)) {
      Promise.resolve().then(() => {
        if (!cancelled) setPastWorkouts(getGuestWorkouts())
      })
      return () => {
        cancelled = true
      }
    }

    fetchUserWorkouts(user.uid)
      .then((list) => {
        if (!cancelled) setPastWorkouts(list)
      })
      .catch(console.error)

    return () => {
      cancelled = true
    }
  }, [user, workout])

  const data = useMemo(() => {
    if (!workout) return null
    return buildPostWorkoutSummary(workout, pastWorkouts)
  }, [workout, pastWorkouts])

  if (!workout || !data) {
    return <Navigate to="/" replace />
  }

  const { summary, comparisons, highlights, weekly } = data

  const comparisonByExerciseId = Object.fromEntries(
    comparisons.map((c) => [c.exerciseId, c.comparison]),
  )

  return (
    <AppLayout
      title="Edzés mentve!"
      subtitle="Szép munka – íme, mit csináltál ma"
      mainClassName="overflow-hidden"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/progress')}
          >
            Progress megtekintése
          </Button>
          <Button onClick={() => navigate('/', { replace: true })}>
            Vissza a főoldalra
          </Button>
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 pb-2">
          <section className="shrink-0 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-lg font-semibold text-white">
              {summary.workoutName}
            </p>
            <p className="mt-1 text-sm text-slate-300">{summary.workoutDate}</p>
            {summary.durationLabel && (
              <p className="mt-1 text-sm text-slate-400">
                Időtartam: {summary.durationLabel}
              </p>
            )}
          </section>

          {summary.bodyWeightMissing && (
            <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-sm text-slate-300">
                Az edzésterhelés és erőszint számításához add meg a testsúlyod
                a profilban.
              </p>
              <Link
                to="/profile"
                className="mt-3 inline-block text-sm font-medium text-emerald-400"
              >
                Profil beállítása →
              </Link>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Mai teljesítmény
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <SummaryStatCard
                label="Edzésterhelés"
                value={formatScorePoints(summary.trainingLoadScore)}
                className="col-span-2"
              />
              {summary.bestEstimated1RM != null &&
                summary.bestEstimated1RM > 0 && (
                <SummaryStatCard
                  label="Legjobb erőszint"
                  value={formatEstimated1RM(summary.bestEstimated1RM)}
                />
              )}
              {summary.bestRelativeStrength != null &&
                summary.bestRelativeStrength > 0 && (
                <SummaryStatCard
                  label="Relatív erő"
                  value={formatRelativeStrength(summary.bestRelativeStrength)}
                  detail={
                    summary.bestStrengthReliability
                      ? `Megbízhatóság: ${formatReliability(summary.bestStrengthReliability)}`
                      : undefined
                  }
                />
              )}
              {(summary.holdScore ?? 0) > 0 && (
                <SummaryStatCard
                  label="Statikus tartás pont"
                  value={formatScorePoints(summary.holdScore)}
                  className="col-span-2"
                />
              )}
              <SummaryStatCard label="Szett" value={summary.totalSets} />
              <SummaryStatCard
                label="Összes ismétlés"
                value={summary.totalReps}
              />
              <SummaryStatCard
                label="Edzés időtartama"
                value={summary.durationLabel ?? '—'}
                className="col-span-2"
              />
              {summary.totalTimeSeconds > 0 && (
                <SummaryStatCard
                  label="Tartás összesen"
                  value={`${summary.totalTimeSeconds} mp`}
                  className="col-span-2"
                />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Mit jelentenek a számok?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Az edzésterhelés, erőszint és tartás pont külön mutatók – mindegyik
              más kérdésre válaszol. Rövid magyarázat és példák az útmutatóban.
            </p>
            <Link
              to="/guide/scoring"
              className="mt-3 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Pontszámok magyarázata →
            </Link>
          </section>

          {summary.categoryBreakdown?.length > 0 &&
            !summary.bodyWeightMissing && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Mozgásminták szerint
                </h2>
                <CategoryLoadBreakdownList items={summary.categoryBreakdown} />
              </section>
            )}

          {highlights.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Kiemelések
              </h2>
              <div className="flex flex-col gap-2">
                {highlights.map((card, i) => (
                  <HighlightCard key={`${card.title}-${i}`} card={card} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Gyakorlatok
            </h2>
            {summary.exerciseSummaries.length === 0 ? (
              <p className="text-sm text-slate-500">Nincs rögzített gyakorlat.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {summary.exerciseSummaries.map((ex) => (
                  <ExerciseSummaryCard
                    key={ex.exerciseId + ex.name}
                    exercise={ex}
                    comparison={comparisonByExerciseId[ex.exerciseId]}
                  />
                ))}
              </div>
            )}
          </section>

          <WeeklyInsightCard weekly={weekly} />
        </div>
      </div>
    </AppLayout>
  )
}
