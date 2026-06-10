/**
 * Freestyle Workout Tracker – poszt-edzés összegző képernyő
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Edzés után: mit csináltál, kiemelések, heti összegzés.
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
import { useAuth } from '../hooks/useAuth'
import { loadLastCompletedWorkout } from '../services/lastWorkoutSummaryStorage'
import { fetchUserWorkouts } from '../services/workoutService'
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
                Az edzésterhelés számításához add meg a testsúlyod a profilban.
              </p>
              <Link to="/profile" className="mt-3 inline-block text-sm font-medium text-emerald-400">
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
                value={summary.workoutLoadScoreLabel}
                className="col-span-2"
              />
              <SummaryStatCard label="Szett" value={summary.totalSets} />
              <SummaryStatCard
                label="Összes ismétlés"
                value={summary.totalReps}
              />
              <SummaryStatCard
                label="Összes idő"
                value={
                  summary.totalTimeSeconds > 0
                    ? `${summary.totalTimeSeconds} mp`
                    : '—'
                }
              />
            </div>
          </section>

          {summary.categoryLoadBreakdown?.length > 0 &&
            !summary.bodyWeightMissing && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Mozgásminták szerint
                </h2>
                <CategoryLoadBreakdownList
                  items={summary.categoryLoadBreakdown}
                />
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
            {summary.exercises.length === 0 ? (
              <p className="text-sm text-slate-500">Nincs rögzített gyakorlat.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {summary.exercises.map((ex) => (
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
