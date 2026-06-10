/**
 * Freestyle Workout Tracker – felhasználói profil (Firestore)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Útvonal: users/{userId}/profile/main
 */

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

function profileRef(userId) {
  return doc(db, 'users', userId, 'profile', 'main')
}

/**
 * @param {string} userId
 * @returns {Promise<{ bodyWeightKg: number|null, heightCm: number|null, updatedAt: unknown }|null>}
 */
export async function fetchUserProfile(userId) {
  const snapshot = await getDoc(profileRef(userId))
  if (!snapshot.exists()) return null

  const data = snapshot.data()
  const bodyWeightKg = Number(data.bodyWeightKg)
  const heightCm = Number(data.heightCm)

  return {
    bodyWeightKg: Number.isFinite(bodyWeightKg) && bodyWeightKg > 0
      ? bodyWeightKg
      : null,
    heightCm: Number.isFinite(heightCm) && heightCm > 0 ? heightCm : null,
    updatedAt: data.updatedAt ?? null,
  }
}

/**
 * @param {string} userId
 * @param {{ bodyWeightKg?: number, heightCm?: number }} profile
 */
export async function saveUserProfile(userId, { bodyWeightKg, heightCm } = {}) {
  const payload = { updatedAt: serverTimestamp() }

  if (heightCm != null) {
    payload.heightCm = Number(heightCm)
  }

  if (bodyWeightKg != null) {
    payload.bodyWeightKg = Number(bodyWeightKg)
  }

  await setDoc(profileRef(userId), payload, { merge: true })

  const existing = (await fetchUserProfile(userId)) ?? {
    bodyWeightKg: null,
    heightCm: null,
  }

  return {
    bodyWeightKg:
      bodyWeightKg != null ? payload.bodyWeightKg : existing.bodyWeightKg,
    heightCm: heightCm != null ? payload.heightCm : existing.heightCm,
    updatedAt: new Date().toISOString(),
  }
}
