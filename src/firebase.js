/**
 * Freestyle Workout Tracker – Firebase inicializálás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Egy helyen köti össze a Firebase szolgáltatásokat:
 * - Authentication (email/jelszó bejelentkezés)
 * - Cloud Firestore (edzések, gyakorlatok tárolása)
 *
 * A config értékek a .env fájlból jönnek (VITE_ prefix – Vite szabály).
 * Analytics szándékosan nincs – az MVP-hez nem kell.
 */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase projekt beállításai – import.meta.env csak Vite build/dev alatt érhető el
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Egyetlen Firebase app példány az egész alkalmazáshoz
const app = initializeApp(firebaseConfig)

// auth: bejelentkezés, regisztráció, kijelentkezés
export const auth = getAuth(app)

// db: Firestore adatbázis – edzések, gyakorlatok, user adatok
export const db = getFirestore(app)
