/**
 * Freestyle Workout Tracker – gyakorlatok listája
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Alap gyakorlatok (defaultExercises) + saját gyakorlatok Firestore-ból.
 * Saját gyakorlat: létrehozás, szerkesztés, törlés.
 */

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryFilter from '../components/exercises/CategoryFilter'
import ExerciseCard from '../components/exercises/ExerciseCard'
import { exerciseMatchesCategoryFilter } from '../constants/exerciseMeta'
import AppLayout from '../components/layout/AppLayout'
import AppNav from '../components/layout/AppNav'
import LogoutButton from '../components/layout/LogoutButton'
import Button from '../components/ui/Button'
import LoadingScreen from '../components/ui/LoadingScreen'
import { useExercises } from '../hooks/useExercises'
import { useAuth } from '../hooks/useAuth'
import { deleteUserExercise } from '../services/exerciseService'

export default function ExercisesPage() {
  const { user } = useAuth()
  const { defaultExercises, userExercises, loading, error, reload } =
    useExercises()
  const [deletingId, setDeletingId] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)

  const filteredUserExercises = useMemo(
    () =>
      userExercises.filter((ex) =>
        exerciseMatchesCategoryFilter(ex, categoryFilter),
      ),
    [userExercises, categoryFilter],
  )

  const filteredDefaultExercises = useMemo(
    () =>
      defaultExercises.filter((ex) =>
        exerciseMatchesCategoryFilter(ex, categoryFilter),
      ),
    [defaultExercises, categoryFilter],
  )

  const handleDelete = async (exercise) => {
    const confirmed = window.confirm(
      `Biztosan törlöd: „${exercise.name}”?`,
    )
    if (!confirmed) return

    setDeleteError('')
    setDeletingId(exercise.id)

    try {
      await deleteUserExercise(user.uid, exercise.id)
      await reload()
    } catch (err) {
      console.error(err)
      setDeleteError('Nem sikerült törölni a gyakorlatot.')
    } finally {
      setDeletingId('')
    }
  }

  if (loading) {
    return <LoadingScreen message="Gyakorlatok betöltése..." />
  }

  return (
    <AppLayout
      title="Gyakorlatok"
      subtitle="Alap és saját gyakorlatok"
      headerActions={<LogoutButton />}
      footer={<AppNav />}
      mainClassName="overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <Link to="/exercises/new" className="shrink-0">
          <Button size="lg">+ Saját gyakorlat hozzáadása</Button>
        </Link>

        <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />

        {(error || deleteError) && (
          <p
            className="shrink-0 rounded-xl border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error || deleteError}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 pb-2">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Saját gyakorlatok ({filteredUserExercises.length})
              </h2>
              {filteredUserExercises.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
                  {userExercises.length === 0
                    ? 'Még nincs saját gyakorlatod. Add hozzá az elsőt!'
                    : 'Nincs találat ezzel a szűrővel.'}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredUserExercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      isCustom
                      onDelete={() => handleDelete(exercise)}
                      deleting={deletingId === exercise.id}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Alap gyakorlatok ({filteredDefaultExercises.length})
              </h2>
              {filteredDefaultExercises.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
                  {defaultExercises.length === 0
                    ? 'Nincs alap gyakorlat a Firestore-ban. Futtasd: npm run seed:exercises'
                    : 'Nincs találat ezzel a szűrővel.'}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredDefaultExercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
