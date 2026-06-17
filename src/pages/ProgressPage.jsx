/**
 * Freestyle Workout Tracker – progress / statisztikák
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import AppNav from '../components/layout/AppNav'
import LogoutButton from '../components/layout/LogoutButton'
import ProgressDotGrid from '../components/progress/ProgressDotGrid'
import ProgressDemoNotice from '../components/progress/ProgressDemoNotice'
import ProgressPeriodSelector from '../components/progress/ProgressPeriodSelector'
import ProgressSection, {
  ProgressMiniCard,
  ProgressStatRow,
} from '../components/progress/ProgressSection'
import SimpleBarChart from '../components/progress/SimpleBarChart'
import TrendList from '../components/progress/TrendList'
import Button from '../components/ui/Button'
import LoadingScreen from '../components/ui/LoadingScreen'
import { useAuth } from '../hooks/useAuth'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import {
  formatEstimated1RM,
  formatReliability,
  formatScorePoints,
} from '../utils/scoring/format'
import { computeProgressData } from '../utils/progress/computeProgress'
import {
  formatChange,
  formatRelativeStrengthLabel,
} from '../utils/progress/labels'
import { DEFAULT_PROGRESS_PERIOD } from '../utils/progress/periods'

const REPS_TABS = [
  { id: 'totalReps', label: 'Összismétlés' },
  { id: 'bestSetReps', label: 'Legjobb szett' },
  { id: 'estimated1RM', label: 'Erőszint' },
  { id: 'relativeStrength', label: 'Relatív erő' },
]

const TIME_TABS = [
  { id: 'totalTime', label: 'Összidő' },
  { id: 'bestHold', label: 'Legjobb tartás' },
  { id: 'holdScore', label: 'Statikus pont' },
]

function formatTimelineValue(metric, value) {
  if (metric === 'estimated1RM') return formatEstimated1RM(value)
  if (metric === 'relativeStrength') return formatRelativeStrengthLabel(value)
  if (metric === 'holdScore') return formatScorePoints(value)
  if (metric === 'totalTime' || metric === 'bestHold') return `${value} mp`
  return String(value)
}

export default function ProgressPage() {
  const { isGuest } = useAuth()
  const { workouts, loading, error, reload } = useWorkoutHistory()
  const [periodId, setPeriodId] = useState(DEFAULT_PROGRESS_PERIOD)
  const [keyExerciseId, setKeyExerciseId] = useState(null)
  const [selectedExerciseId, setSelectedExerciseId] = useState(null)
  const [exerciseTab, setExerciseTab] = useState('totalReps')

  useEffect(() => {
    reload()
  }, [reload])

  const data = useMemo(
    () =>
      computeProgressData(workouts, {
        periodId,
        keyExerciseId,
        selectedExerciseId,
      }),
    [workouts, periodId, keyExerciseId, selectedExerciseId],
  )

  const selectedExercise = data.selectedExercise
  const isTimeExercise = selectedExercise?.type === 'time'
  const tabs = isTimeExercise ? TIME_TABS : REPS_TABS
  const activeTab = tabs.some((t) => t.id === exerciseTab)
    ? exerciseTab
    : tabs[0].id
  const timelinePoints = data.selectedTimeline?.[activeTab] ?? []

  if (loading) {
    return <LoadingScreen message="Progress betöltése..." />
  }

  if (!data.hasWorkouts) {
    return (
      <AppLayout
        title="Progress"
        subtitle="Fejlődésed egy helyen"
        headerActions={<LogoutButton />}
        footer={<AppNav />}
      >
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-lg font-medium text-white">
            Még nincs elég adatod a progress megjelenítéséhez.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Fejezz be néhány edzést, és itt látni fogod a fejlődésed.
          </p>
          <Link to="/workout/new" className="mt-6 inline-block">
            <Button size="lg">Új edzés indítása</Button>
          </Link>
        </section>
      </AppLayout>
    )
  }

  const { periodStats, relativeStrength, strength, weeklyLoad, staticHolds } =
    data

  return (
    <AppLayout
      title="Progress"
      subtitle="Fejlődésed egy helyen"
      headerActions={<LogoutButton />}
      footer={<AppNav />}
      mainClassName="overflow-hidden"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 pb-2">
          {error && (
            <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {isGuest && <ProgressDemoNotice workouts={workouts} />}

          <ProgressPeriodSelector value={periodId} onChange={setPeriodId} />

          {!data.hasMultipleWorkouts && (
            <p className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
              Még legalább egy edzés kell az összehasonlításhoz.
            </p>
          )}

          {/* 1. Top summary */}
          <ProgressSection title="Fejlődésed">
            <div className="grid grid-cols-2 gap-2">
              <ProgressMiniCard
                label="Edzések száma"
                value={periodStats.workoutCount}
              />
              <ProgressMiniCard
                label="Összes szett"
                value={periodStats.totalSets}
              />
              <ProgressMiniCard
                label="Összes ismétlés"
                value={periodStats.totalReps}
              />
              <ProgressMiniCard
                label="Edzésterhelés"
                value={formatScorePoints(periodStats.totalTrainingLoad)}
              />
              {data.newRecordsCount > 0 && (
                <div className="col-span-2">
                  <ProgressMiniCard
                    label="Új rekordok"
                    value={data.newRecordsCount}
                  />
                </div>
              )}
            </div>
          </ProgressSection>

          {/* 2. Relative strength */}
          {data.keyExercise && (
            <ProgressSection title="Relatív erő">
              <p className="text-sm text-slate-400">
                Kiemelt gyakorlat:{' '}
                <span className="text-white">{data.keyExercise.name}</span>
              </p>
              {data.exercises.length > 1 && (
                <select
                  value={data.keyExercise.exerciseId}
                  onChange={(e) => setKeyExerciseId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                >
                  {data.exercises
                    .filter((e) => e.type !== 'time')
                    .map((ex) => (
                      <option key={ex.exerciseId} value={ex.exerciseId}>
                        {ex.name}
                      </option>
                    ))}
                </select>
              )}
              <div className="mt-3">
                <ProgressStatRow
                  label="Legutóbbi relatív erő"
                  value={
                    relativeStrength.latest
                      ? formatRelativeStrengthLabel(relativeStrength.latest.value)
                      : '—'
                  }
                />
                <ProgressStatRow
                  label="Legjobb relatív erő"
                  value={
                    relativeStrength.best
                      ? formatRelativeStrengthLabel(relativeStrength.best.value)
                      : '—'
                  }
                />
                <ProgressStatRow
                  label="Változás az időszakban"
                  value={
                    relativeStrength.change != null
                      ? formatChange(relativeStrength.change, {
                          suffix: '×',
                          decimals: 2,
                        })
                      : '—'
                  }
                />
              </div>
              <TrendList
                points={relativeStrength.timeline}
                formatValue={(v) => formatRelativeStrengthLabel(v)}
              />
            </ProgressSection>
          )}

          {/* 3. Strength */}
          {data.keyExercise && strength.best && (
            <ProgressSection title="Erőszint">
              <p className="text-sm text-slate-400">
                {data.keyExercise.name}
              </p>
              <div className="mt-2">
                <ProgressStatRow
                  label="Legutóbbi becsült 1RM"
                  value={
                    strength.latest
                      ? formatEstimated1RM(strength.latest.estimated1RM)
                      : '—'
                  }
                />
                <ProgressStatRow
                  label="Legjobb becsült 1RM"
                  value={formatEstimated1RM(strength.best.estimated1RM)}
                  detail={
                    strength.best.setNumber
                      ? `${strength.best.reps} ism. · ${strength.best.setNumber}. szett`
                      : `${strength.best.reps} ism.`
                  }
                />
                <ProgressStatRow
                  label="Megbízhatóság"
                  value={formatReliability(strength.best.reliability) ?? '—'}
                />
              </div>
            </ProgressSection>
          )}

          {/* 4. Weekly training load */}
          <ProgressSection title="Heti edzésterhelés">
            <SimpleBarChart
              data={weeklyLoad.series.map((w) => ({
                label: w.weekLabel,
                value: w.totalTrainingLoad,
                title: `${w.workoutCount} edzés · ${w.totalSets} szett`,
              }))}
              valueSuffix=" pont"
            />
            {weeklyLoad.thisWeek && (
              <div className="mt-4 space-y-1 border-t border-slate-800 pt-3">
                <ProgressStatRow
                  label="Ezen a héten"
                  value={formatScorePoints(weeklyLoad.thisWeek.totalTrainingLoad)}
                  detail={`${weeklyLoad.thisWeek.workoutCount} edzés · ${weeklyLoad.thisWeek.totalSets} szett · ${weeklyLoad.thisWeek.totalReps} ism.`}
                />
                {weeklyLoad.weekChange != null && (
                  <ProgressStatRow
                    label="Változás múlt héthez képest"
                    value={formatChange(weeklyLoad.weekChange, {
                      suffix: ' pont',
                    })}
                  />
                )}
              </div>
            )}
          </ProgressSection>

          {/* 5. Activity */}
          <ProgressSection title="Aktivitás">
            <div className="grid grid-cols-2 gap-2">
              <ProgressMiniCard
                label="Edzések"
                value={periodStats.workoutCount}
              />
              <ProgressMiniCard label="Szettek" value={periodStats.totalSets} />
              <ProgressMiniCard
                label="Ismétlések"
                value={periodStats.totalReps}
              />
              <ProgressMiniCard
                label="Edzésterhelés"
                value={formatScorePoints(periodStats.totalTrainingLoad)}
              />
              {periodStats.totalHoldTimeSeconds > 0 && (
                <div className="col-span-2">
                  <ProgressMiniCard
                    label="Statikus tartásidő"
                    value={`${periodStats.totalHoldTimeSeconds} mp`}
                  />
                </div>
              )}
            </div>
          </ProgressSection>

          {/* 6. Category breakdown */}
          {data.categoryBreakdown.length > 0 && (
            <ProgressSection title="Kategória bontás">
              <ul className="space-y-3">
                {data.categoryBreakdown.map((cat) => {
                  const maxLoad = Math.max(
                    ...data.categoryBreakdown.map(
                      (c) => c.trainingLoadScore,
                    ),
                    1,
                  )
                  const widthPct =
                    (cat.trainingLoadScore / maxLoad) * 100

                  return (
                    <li key={cat.category}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-200">
                          {cat.label}
                        </span>
                        <span className="text-sm tabular-nums text-emerald-400">
                          {formatScorePoints(cat.trainingLoadScore)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500/60"
                          style={{ width: `${Math.max(widthPct, 4)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {cat.sets} szett
                        {cat.reps > 0 && ` · ${cat.reps} ism.`}
                        {cat.timeSeconds > 0 && ` · ${cat.timeSeconds} mp`}
                        {cat.holdScore > 0 &&
                          ` · tartás: ${formatScorePoints(cat.holdScore)}`}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </ProgressSection>
          )}

          {/* 7. Key exercise progress */}
          {selectedExercise && (
            <ProgressSection title="Kiemelt gyakorlat fejlődése">
              <select
                value={selectedExercise.exerciseId}
                onChange={(e) => {
                  setSelectedExerciseId(e.target.value)
                  setExerciseTab(
                    data.exercises.find((ex) => ex.exerciseId === e.target.value)
                      ?.type === 'time'
                      ? 'totalTime'
                      : 'totalReps',
                  )
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                {data.exercises.map((ex) => (
                  <option key={ex.exerciseId} value={ex.exerciseId}>
                    {ex.name}
                  </option>
                ))}
              </select>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setExerciseTab(tab.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                      activeTab === tab.id
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <TrendList
                points={timelinePoints}
                formatValue={(v) => formatTimelineValue(activeTab, v)}
              />
            </ProgressSection>
          )}

          {/* 8. Static holds */}
          <ProgressSection title="Statikus tartások">
            {staticHolds.hasData ? (
              <div className="grid grid-cols-2 gap-2">
                <ProgressMiniCard
                  label="Leghosszabb tartás"
                  value={
                    staticHolds.longestHold > 0
                      ? `${staticHolds.longestHold} mp`
                      : '—'
                  }
                />
                <ProgressMiniCard
                  label="Összes tartásidő"
                  value={`${staticHolds.totalHoldTime} mp`}
                />
                <ProgressMiniCard
                  label="Statikus tartás pont"
                  value={formatScorePoints(staticHolds.totalHoldScore)}
                />
                <ProgressMiniCard
                  label="Legjobb statikus gyakorlat"
                  value={staticHolds.bestHoldExercise ?? '—'}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Még nincs rögzített statikus tartás.
              </p>
            )}
          </ProgressSection>

          {/* 9. Records */}
          {data.records.length > 0 && (
            <ProgressSection title="Rekordok">
              <div className="grid gap-2 sm:grid-cols-2">
                {data.records.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-400/80">
                      {record.title}
                    </p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {record.value}
                    </p>
                    {record.detail && (
                      <p className="mt-1 text-xs text-slate-400">
                        {record.detail}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </ProgressSection>
          )}

          {/* 10. Consistency */}
          <ProgressSection title="Rendszeresség">
            <div className="grid grid-cols-2 gap-2">
              <ProgressMiniCard
                label="Edzések az elmúlt 7 napban"
                value={data.consistency.workoutsLast7Days}
              />
              <ProgressMiniCard
                label="Edzések az elmúlt 30 napban"
                value={data.consistency.workoutsLast30Days}
              />
              <ProgressMiniCard
                label="Aktuális aktív hét sorozat"
                value={`${data.consistency.currentWeekStreak} hét`}
              />
              <ProgressMiniCard
                label="Legjobb aktív hét sorozat"
                value={`${data.consistency.bestWeekStreak} hét`}
              />
            </div>
            <ProgressDotGrid days={data.consistency.dotGridDays} />
          </ProgressSection>

          <Link
            to="/guide/scoring"
            className="block text-center text-sm text-slate-500 hover:text-emerald-400"
          >
            Pontszámok magyarázata →
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
