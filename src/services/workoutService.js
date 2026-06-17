/**
 * Freestyle Workout Tracker – edzés Firestore szinkron
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Csak fontos eseményeknél írunk (nem másodpercenként).
 * Sikertelen sync → pendingSync, localStorage megmarad.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { SYNC_STATUS, WORKOUT_STATUS } from '../constants/workout'
import { GUEST_USER_ID } from '../constants/guest'
import { db } from '../firebase'
import { sanitizeWorkoutForFirestore } from '../utils/firestoreSanitize'
import { mapWorkoutDocument } from '../utils/workoutDisplay'

/**
 * User edzéseinek száma – automatikus „Edzés N” névhez.
 */
export async function getUserWorkoutCount(userId) {
  const snapshot = await getDocs(collection(db, 'users', userId, 'workouts'))
  return snapshot.size
}

/**
 * Befejezett edzések listája – startedAt szerint csökkenő.
 * @param {string} userId
 */
export async function fetchUserWorkouts(userId) {
  const q = query(
    collection(db, 'users', userId, 'workouts'),
    orderBy('startedAt', 'desc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map(mapWorkoutDocument)
    .filter(Boolean)
}

/**
 * Egy edzés betöltése ID alapján.
 */
export async function fetchWorkoutById(userId, workoutId) {
  const ref = doc(db, 'users', userId, 'workouts', workoutId)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return null
  return mapWorkoutDocument(snapshot)
}

/**
 * Edzés törlése Firestore-ból (csak naplóból – megerősítéssel a UI-ban).
 */
export async function deleteWorkout(userId, workoutId) {
  assertFirestoreIds(userId, workoutId)
  const ref = doc(db, 'users', userId, 'workouts', workoutId)
  await deleteDoc(ref)
}

/**
 * Firestore dokumentumba menthető mezők.
 */
function toFirestoreWorkout(workout) {
  return {
    ...sanitizeWorkoutForFirestore(workout),
    updatedAt: serverTimestamp(),
  }
}

/**
 * @param {string} userId
 * @param {string|null|undefined} firestoreId
 */
function assertFirestoreIds(userId, firestoreId) {
  if (typeof userId !== 'string' || !userId) {
    throw new Error('Érvénytelen userId – nem menthető Firestore-ba.')
  }
  if (
    firestoreId !== null &&
    firestoreId !== undefined &&
    typeof firestoreId !== 'string'
  ) {
    throw new Error('Érvénytelen firestoreId – nem menthető Firestore-ba.')
  }
}

/**
 * Edzés létrehozása vagy frissítése Firestore-ban.
 * @returns {Promise<string>} firestore document id
 */
export async function syncWorkoutToFirestore(workout) {
  if (workout.userId === GUEST_USER_ID) {
    throw new Error('Vendég edzés nem menthető Firestore-ba.')
  }

  const userId = workout.userId
  assertFirestoreIds(userId, workout.firestoreId)

  const payload = toFirestoreWorkout(workout)

  if (!workout.firestoreId) {
    const newRef = doc(collection(db, 'users', userId, 'workouts'))
    await setDoc(newRef, {
      ...payload,
      createdAt: serverTimestamp(),
    })
    return newRef.id
  }

  const ref = doc(db, 'users', userId, 'workouts', workout.firestoreId)
  await updateDoc(ref, payload)
  return workout.firestoreId
}

/**
 * Edzés befejezése Firestore-ban.
 */
export async function finishWorkoutInFirestore(workout) {
  const payload = {
    ...workout,
    status: WORKOUT_STATUS.COMPLETED,
    finishedAt: workout.finishedAt ?? new Date().toISOString(),
    timer: { phase: 'idle', startedAt: null, durationSeconds: 0 },
  }
  return syncWorkoutToFirestore(payload)
}

/**
 * Próbál szinkronizálni; hiba esetén pendingSync státusz.
 * @returns {Promise<object>} Frissített workout syncStatus-szal
 */
export async function trySyncWorkout(workout) {
  try {
    const firestoreId = await syncWorkoutToFirestore(workout)
    return {
      ...workout,
      firestoreId,
      syncStatus: SYNC_STATUS.SYNCED,
    }
  } catch (error) {
    console.error('Firestore sync hiba:', error)
    return {
      ...workout,
      syncStatus: SYNC_STATUS.PENDING,
    }
  }
}
