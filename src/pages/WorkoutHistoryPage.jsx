/**
 * Freestyle Workout Tracker – edzésnapló lista
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Korábbi edzések Firestore-ból, dátum szerint rendezve.
 */

import AppLayout from '../components/layout/AppLayout'
import AppNav from '../components/layout/AppNav'
import LogoutButton from '../components/layout/LogoutButton'
import WorkoutHistoryCard from '../components/history/WorkoutHistoryCard'
import LoadingScreen from '../components/ui/LoadingScreen'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'

export default function WorkoutHistoryPage() {
  const { workouts, loading, error } = useWorkoutHistory()

  if (loading) {
    return <LoadingScreen message="Edzésnapló betöltése..." />
  }

  return (
    <AppLayout
      title="Edzésnapló"
      subtitle="Korábbi edzéseid"
      headerActions={<LogoutButton />}
      footer={<AppNav />}
      mainClassName="overflow-hidden"
    >
      {error && (
        <p
          className="shrink-0 rounded-xl border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {workouts.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-700 px-4 py-10 text-center">
          <p className="text-sm text-slate-400">
            Még nincs mentett edzésed.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Indíts egy edzést a főmenüből, majd fejezd be és mentsd el.
          </p>
        </section>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3 pb-2">
            {workouts.map((workout) => (
              <WorkoutHistoryCard
                key={workout.firestoreId}
                workout={workout}
              />
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
