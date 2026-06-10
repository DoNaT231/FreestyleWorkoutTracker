/**
 * Freestyle Workout Tracker – dashboard (főoldal bejelentkezés után)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Új edzés indítása, félbehagyott edzés folytatása, gyors linkek.
 */

import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import AppNav from '../components/layout/AppNav'
import LogoutButton from '../components/layout/LogoutButton'
import ProfileSetupCard from '../components/profile/ProfileSetupCard'
import RestoreWorkoutModal from '../components/workout/RestoreWorkoutModal'
import Button from '../components/ui/Button'
import LoadingScreen from '../components/ui/LoadingScreen'
import { useActiveWorkout } from '../hooks/useActiveWorkout'
import { useExercises } from '../hooks/useExercises'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { defaultExercises, userExercises, loading } = useExercises()
  const { hasActiveWorkout, hydrated, workout } = useActiveWorkout()
  const { hasBodyWeight, loading: profileLoading } = useUserProfile()

  if (loading || !hydrated || profileLoading) {
    return <LoadingScreen message="Dashboard betöltése..." />
  }

  const totalExercises = defaultExercises.length + userExercises.length
  const showRestoreModal = hasActiveWorkout

  return (
    <>
      {showRestoreModal && <RestoreWorkoutModal />}

      <AppLayout
        title="Dashboard"
        subtitle="Freestyle edzésnapló – mobilra optimalizálva"
        headerActions={<LogoutButton />}
        footer={<AppNav />}
      >
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Bejelentkezve mint</p>
          <p className="mt-1 font-medium text-white">{user?.email}</p>
          <p className="mt-3 text-sm text-slate-400">
            Elérhető gyakorlatok:{' '}
            <span className="font-medium text-emerald-400">{totalExercises}</span>
          </p>
          {hasActiveWorkout && (
            <p className="mt-2 text-sm text-amber-400">
              Aktív edzés: {workout?.name}
            </p>
          )}
        </section>

        {!hasBodyWeight && <ProfileSetupCard />}

        {hasActiveWorkout ? (
          <Button size="xl" onClick={() => navigate('/workout/active')}>
            Edzés folytatása
          </Button>
        ) : (
          <Link to="/workout/new">
            <Button size="xl">Új edzés indítása</Button>
          </Link>
        )}

        <Link to="/history">
          <Button variant="secondary">Edzésnapló</Button>
        </Link>

        <Link to="/exercises">
          <Button variant="ghost" size="md">
            Gyakorlatok kezelése
          </Button>
        </Link>

        <Link to="/profile">
          <Button variant="ghost" size="md">
            Profil
          </Button>
        </Link>
      </AppLayout>
    </>
  )
}
