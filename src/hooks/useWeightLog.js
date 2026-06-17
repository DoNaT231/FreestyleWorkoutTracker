/**
 * Freestyle Workout Tracker – testsúly napló hook
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_WEIGHT_LOG } from '../data/demoData'
import {
  deleteWeightLogEntry,
  fetchWeightLog,
  logBodyWeight,
} from '../services/weightLogService'
import { isGuestUser } from '../utils/guestUser'
import { useAuth } from './useAuth'

export function useWeightLog() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const requestIdRef = useRef(0)

  const reload = useCallback(async () => {
    if (!user) return []

    const requestId = ++requestIdRef.current
    setReady(false)
    setError('')

    try {
      if (isGuestUser(user)) {
        if (requestId !== requestIdRef.current) return DEMO_WEIGHT_LOG
        setEntries(DEMO_WEIGHT_LOG)
        return DEMO_WEIGHT_LOG
      }

      const data = await fetchWeightLog(user.uid)
      if (requestId !== requestIdRef.current) return data
      setEntries(data)
      return data
    } catch (err) {
      console.error(err)
      if (requestId !== requestIdRef.current) return []
      setError('Nem sikerült betölteni a testsúly naplót.')
      return []
    } finally {
      if (requestId === requestIdRef.current) {
        setReady(true)
      }
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setEntries([])
      setReady(true)
      return
    }

    const requestId = ++requestIdRef.current
    setReady(false)

    if (isGuestUser(user)) {
      Promise.resolve().then(() => {
        if (requestId !== requestIdRef.current) return
        setEntries(DEMO_WEIGHT_LOG)
        setReady(true)
      })
      return
    }

    fetchWeightLog(user.uid)
      .then((data) => {
        if (requestId !== requestIdRef.current) return
        setEntries(data)
        setError('')
      })
      .catch((err) => {
        console.error(err)
        if (requestId !== requestIdRef.current) return
        setError('Nem sikerült betölteni a testsúly naplót.')
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setReady(true)
        }
      })
  }, [user])

  const addEntry = useCallback(
    async (weightKg, recordedAt) => {
      if (!user) return null

      setError('')
      try {
        if (isGuestUser(user)) {
          const entry = {
            id: `guest-${Date.now()}`,
            weightKg: Number(weightKg),
            recordedAt: recordedAt ?? new Date().toISOString(),
          }
          setEntries((prev) => [entry, ...prev])
          return entry
        }

        const entry = await logBodyWeight(user.uid, weightKg, recordedAt)
        setEntries((prev) => [entry, ...prev])
        return entry
      } catch (err) {
        console.error(err)
        setError('Nem sikerült menteni a mérést.')
        throw err
      }
    },
    [user],
  )

  const removeEntry = useCallback(
    async (entryId) => {
      if (!user) return null

      setError('')
      try {
        if (isGuestUser(user)) {
          setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
          return null
        }

        const latest = await deleteWeightLogEntry(user.uid, entryId)
        setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
        return latest
      } catch (err) {
        console.error(err)
        setError('Nem sikerült törölni a mérést.')
        throw err
      }
    },
    [user],
  )

  const latestEntry = entries[0] ?? null

  return {
    entries,
    latestEntry,
    loading: Boolean(user) && !ready,
    error,
    reload,
    addEntry,
    removeEntry,
  }
}
