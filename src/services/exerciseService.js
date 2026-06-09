/**
 * Freestyle Workout Tracker – Firestore gyakorlat szolgáltatás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Olvasás:
 *   - defaultExercises (globális, seed script tölti)
 *   - users/{userId}/exercises (saját gyakorlatok)
 *
 * Írás csak a user saját exercises al-collection-jébe.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const DEFAULT_COLLECTION = 'defaultExercises'

/**
 * @param {import('firebase/firestore').DocumentSnapshot} snapshot
 * @returns {object} Gyakorlat objektum id mezővel
 */
function mapExerciseDoc(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Alapértelmezett gyakorlatok betöltése (Firestore defaultExercises).
 * @returns {Promise<object[]>}
 */
export async function fetchDefaultExercises() {
  const q = query(collection(db, DEFAULT_COLLECTION), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapExerciseDoc)
}

/**
 * User saját gyakorlatainak betöltése.
 * @param {string} userId – Firebase Auth UID
 */
export async function fetchUserExercises(userId) {
  const q = query(
    collection(db, 'users', userId, 'exercises'),
    orderBy('name'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapExerciseDoc)
}

/**
 * Egy user gyakorlat lekérése ID alapján.
 */
export async function fetchUserExercise(userId, exerciseId) {
  const ref = doc(db, 'users', userId, 'exercises', exerciseId)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return null
  return mapExerciseDoc(snapshot)
}

/**
 * Új saját gyakorlat létrehozása.
 * @param {string} userId
 * @param {object} data – name, category, type, defaultRestSeconds, defaultPrepSeconds, supportsAdditionalWeight
 */
export async function createUserExercise(userId, data) {
  const ref = collection(db, 'users', userId, 'exercises')
  const docRef = await addDoc(ref, {
    ...data,
    isDefault: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Saját gyakorlat módosítása.
 */
export async function updateUserExercise(userId, exerciseId, data) {
  const ref = doc(db, 'users', userId, 'exercises', exerciseId)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Saját gyakorlat törlése.
 */
export async function deleteUserExercise(userId, exerciseId) {
  const ref = doc(db, 'users', userId, 'exercises', exerciseId)
  await deleteDoc(ref)
}
