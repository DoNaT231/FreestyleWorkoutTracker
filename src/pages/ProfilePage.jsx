/**
 * Freestyle Workout Tracker – felhasználói profil
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Testsúly követés + magasság – edzésterhelés számításhoz.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import AppNav from '../components/layout/AppNav'
import LogoutButton from '../components/layout/LogoutButton'
import WeightHistoryList from '../components/profile/WeightHistoryList'
import WeightTrendChart from '../components/profile/WeightTrendChart'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import LoadingScreen from '../components/ui/LoadingScreen'
import { useUserProfile } from '../hooks/useUserProfile'
import { useWeightLog } from '../hooks/useWeightLog'

function todayInputValue() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading, error: profileError, updateProfile, reload: reloadProfile } =
    useUserProfile()
  const {
    entries,
    loading: logLoading,
    error: logError,
    addEntry,
    removeEntry,
  } = useWeightLog()

  const [newWeightKg, setNewWeightKg] = useState('')
  const [recordedDate, setRecordedDate] = useState(todayInputValue)
  const [heightCm, setHeightCm] = useState('')
  const [savingWeight, setSavingWeight] = useState(false)
  const [savingHeight, setSavingHeight] = useState(false)
  const [weightSuccess, setWeightSuccess] = useState(false)
  const [heightSuccess, setHeightSuccess] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    if (!profile) return
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : '')
    setNewWeightKg((prev) =>
      prev || (profile.bodyWeightKg != null ? String(profile.bodyWeightKg) : ''),
    )
  }, [profile])

  const loading = profileLoading || logLoading
  const error = profileError || logError

  const handleLogWeight = async (e) => {
    e.preventDefault()
    setFormError('')
    setWeightSuccess(false)

    const weight = Number(newWeightKg)
    if (!Number.isFinite(weight) || weight <= 0) {
      setFormError('Add meg érvényes testsúlyt kilogrammban.')
      return
    }

    const recordedAt = new Date(`${recordedDate}T12:00:00`)
    if (Number.isNaN(recordedAt.getTime())) {
      setFormError('Érvénytelen dátum.')
      return
    }

    setSavingWeight(true)
    try {
      await addEntry(weight, recordedAt)
      await reloadProfile()
      setWeightSuccess(true)
      setRecordedDate(todayInputValue())
    } catch {
      // hook error
    } finally {
      setSavingWeight(false)
    }
  }

  const handleDeleteEntry = async (entryId) => {
    const entry = entries.find((e) => e.id === entryId)
    const confirmed = window.confirm(
      `Biztosan törlöd ezt a mérést?\n\n${entry?.weightKg ?? '?'} kg`,
    )
    if (!confirmed) return

    setDeletingId(entryId)
    setFormError('')
    try {
      await removeEntry(entryId)
      await reloadProfile()
    } catch {
      // hook error
    } finally {
      setDeletingId('')
    }
  }

  const handleSaveHeight = async (e) => {
    e.preventDefault()
    setFormError('')
    setHeightSuccess(false)

    const height = Number(heightCm)
    if (!Number.isFinite(height) || height <= 0) {
      setFormError('Add meg érvényes magasságot centiméterben.')
      return
    }

    setSavingHeight(true)
    try {
      await updateProfile({ heightCm: height })
      setHeightSuccess(true)
    } catch {
      // hook error
    } finally {
      setSavingHeight(false)
    }
  }

  if (loading) {
    return <LoadingScreen message="Profil betöltése..." />
  }

  const currentWeight = profile?.bodyWeightKg ?? entries[0]?.weightKg ?? null

  return (
    <AppLayout
      title="Profil"
      subtitle="Testsúly követés és személyes adatok"
      headerActions={<LogoutButton />}
      footer={<AppNav />}
      mainClassName="overflow-hidden"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-6 pb-2">
          <section>
            <p className="text-sm text-slate-400">
              A testsúlyod alapján számoljuk az edzésterhelést.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              A régi edzések számítása nem változik, ha később módosítod a
              testsúlyod.
            </p>
          </section>

          {(error || formError) && (
            <p
              className="rounded-xl border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              role="alert"
            >
              {formError || error}
            </p>
          )}

          {currentWeight != null && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Aktuális testsúly
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-white">
                {currentWeight}{' '}
                <span className="text-lg font-medium text-slate-400">kg</span>
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="font-semibold text-white">Új mérés</h2>
            <p className="mt-1 text-xs text-slate-500">
              Minden mentés bekerül a testsúly naplóba.
            </p>

            {weightSuccess && (
              <p
                className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                role="status"
              >
                Mérés mentve
              </p>
            )}

            <form onSubmit={handleLogWeight} className="mt-4 flex flex-col gap-4">
              <Input
                id="profile-weight"
                label="Testsúly"
                type="number"
                inputMode="decimal"
                min="1"
                step="0.1"
                placeholder="pl. 78"
                value={newWeightKg}
                onChange={(e) => setNewWeightKg(e.target.value)}
                disabled={savingWeight}
              />
              <p className="-mt-2 text-xs text-slate-500">kg</p>

              <Input
                id="profile-weight-date"
                label="Mérés dátuma"
                type="date"
                value={recordedDate}
                onChange={(e) => setRecordedDate(e.target.value)}
                disabled={savingWeight}
              />

              <Button type="submit" size="lg" disabled={savingWeight}>
                {savingWeight ? 'Mentés...' : 'Mérés mentése'}
              </Button>
            </form>
          </section>

          <WeightTrendChart entries={entries} />

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Testsúly előzmények
            </h2>
            <WeightHistoryList
              entries={entries}
              onDelete={handleDeleteEntry}
              deletingId={deletingId}
            />
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="font-semibold text-white">Magasság</h2>

            {heightSuccess && (
              <p
                className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                role="status"
              >
                Profil frissítve
              </p>
            )}

            <form onSubmit={handleSaveHeight} className="mt-4 flex flex-col gap-4">
              <Input
                id="profile-height"
                label="Magasság"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                placeholder="pl. 178"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                disabled={savingHeight}
              />
              <p className="-mt-2 text-xs text-slate-500">cm</p>

              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={savingHeight}
              >
                {savingHeight ? 'Mentés...' : 'Magasság mentése'}
              </Button>
            </form>
          </section>

          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/')}
            disabled={savingWeight || savingHeight}
          >
            Vissza a főoldalra
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
