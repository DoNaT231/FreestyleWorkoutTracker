/**
 * Freestyle Workout Tracker – testsúly napló hook
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteWeightLogEntry,
  fetchWeightLog,
  logBodyWeight,
} from '../services/weightLogService'
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
