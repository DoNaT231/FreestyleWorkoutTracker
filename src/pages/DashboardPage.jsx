/**
 * Freestyle Workout Tracker – dashboard (főoldal bejelentkezés után)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Bejelentkezett user kezdőképernyője: új edzés, gyors linkek, gyakorlat szám.
 */

import { Link } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import AppNav from '../components/layout/AppNav'
import LogoutButton from '../components/layout/LogoutButton'
import Button from '../components/ui/Button'
import LoadingScreen from '../components/ui/LoadingScreen'
import { useExercises } from '../hooks/useExercises'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()
  const { defaultExercises, userExercises, loading } = useExercises()

  if (loading) {
    return <LoadingScreen message="Dashboard betöltése..." />
  }

  const totalExercises = defaultExercises.length + userExercises.length

  return (
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
          {' '}({defaultExercises.length} alap + {userExercises.length} saját)
        </p>
      </section>

      {/* Fő CTA – edzésflow a 5. fázisban kap route-ot */}
      <Button size="xl" disabled>
        Új edzés indítása (hamarosan)
      </Button>

      <Link to="/history">
        <Button variant="secondary">Edzésnapló</Button>
      </Link>

      <Link to="/exercises">
        <Button variant="ghost" size="md">
          Gyakorlatok kezelése
        </Button>
      </Link>
    </AppLayout>
  )
}
