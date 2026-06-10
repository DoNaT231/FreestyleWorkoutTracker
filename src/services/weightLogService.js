/**
 * Freestyle Workout Tracker – testsúly napló (Firestore)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Útvonal: users/{userId}/weightLog/{entryId}
 * A profile/main bodyWeightKg mindig a legutóbbi mérés.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

function weightLogCollection(userId) {
  return collection(db, 'users', userId, 'weightLog')
}

function profileRef(userId) {
  return doc(db, 'users', userId, 'profile', 'main')
}

function toIsoString(value) {
  if (!value) return new Date().toISOString()
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return value.toDate().toISOString()
  }
  return new Date(value).toISOString()
}

/**
 * @param {import('firebase/firestore').DocumentSnapshot} snapshot
 */
function mapWeightLogDoc(snapshot) {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    weightKg: Number(data.weightKg),
    recordedAt: toIsoString(data.recordedAt),
  }
}

/**
 * @param {string} userId
 * @param {number} [maxEntries=60]
 */
export async function fetchWeightLog(userId, maxEntries = 60) {
  const q = query(
    weightLogCollection(userId),
    orderBy('recordedAt', 'desc'),
    limit(maxEntries),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map(mapWeightLogDoc)
    .filter((entry) => Number.isFinite(entry.weightKg) && entry.weightKg > 0)
}

/**
 * Új testsúly mérés – napló + profile/main frissítés.
 * @param {string} userId
 * @param {number} weightKg
 * @param {Date|string} [recordedAt]
 */
export async function logBodyWeight(userId, weightKg, recordedAt = new Date()) {
  const weight = Number(weightKg)
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error('Érvénytelen testsúly.')
  }

  const date =
    recordedAt instanceof Date
      ? recordedAt
      : new Date(recordedAt ?? Date.now())

  if (Number.isNaN(date.getTime())) {
    throw new Error('Érvénytelen dátum.')
  }

  const docRef = await addDoc(weightLogCollection(userId), {
    weightKg: weight,
    recordedAt: Timestamp.fromDate(date),
    createdAt: serverTimestamp(),
  })

  await setDoc(
    profileRef(userId),
    {
      bodyWeightKg: weight,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  return {
    id: docRef.id,
    weightKg: weight,
    recordedAt: date.toISOString(),
  }
}

function weightLogEntryRef(userId, entryId) {
  return doc(db, 'users', userId, 'weightLog', entryId)
}

/**
 * Mérés törlése – a profil testsúlya az utolsó megmaradt bejegyzésre frissül.
 * @param {string} userId
 * @param {string} entryId
 */
export async function deleteWeightLogEntry(userId, entryId) {
  await deleteDoc(weightLogEntryRef(userId, entryId))

  const remaining = await fetchWeightLog(userId, 1)
  const latest = remaining[0] ?? null

  await setDoc(
    profileRef(userId),
    {
      bodyWeightKg: latest?.weightKg ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  return latest
}
