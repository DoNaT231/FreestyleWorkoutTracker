/**
 * Freestyle Workout Tracker – Firebase Admin SDK inicializálás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Közös segédfüggvény a scripts/ mappában futó seed és migration scriptekhez.
 * A kliens Firebase SDK-t NEM használjuk – Admin SDK kell szerver oldali íráshoz.
 *
 * Service account JSON helye (választható):
 *   1. Projekt gyökér: firebase-service-account.json (alapértelmezett)
 *   2. Egyedi út a .env-ben: FIREBASE_SERVICE_ACCOUNT_PATH=./útvonal/fájl.json
 *
 * A kulcsot a Firebase Console-ból töltöd le:
 *   Project settings → Service accounts → Generate new private key
 *
 * SOHA ne commitold a service account fájlt – benne van a .gitignore-ban.
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import admin from 'firebase-admin'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Betölti a .env fájlt és inicializálja a Firebase Admin appot.
 * @returns {FirebaseFirestore.Firestore} Firestore példány
 */
export function initFirebaseAdmin() {
  // .env a projekt gyökerében (scripts/lib → ../../.env)
  dotenv.config({ path: resolve(__dirname, '../../.env') })

  // Alapértelmezett: projekt gyökérben firebase-service-account.json
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : resolve(process.cwd(), 'firebase-service-account.json')

  if (!existsSync(serviceAccountPath)) {
    console.error(
      '\n[HIBA] Nem található Firebase service account fájl.\n',
    )
    console.error('Várt hely:', serviceAccountPath)
    console.error(
      '\nLépések:',
      '\n  1. Firebase Console → Project settings → Service accounts',
      '\n  2. „Generate new private key” → JSON letöltése',
      '\n  3. Mentsd el a projekt gyökerébe: firebase-service-account.json',
      '\n     VAGY állítsd be a .env-ben: FIREBASE_SERVICE_ACCOUNT_PATH=./útvonal.json',
      '\n',
    )
    process.exit(1)
  }

  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

  // Csak egyszer inicializáljuk (ha több script hívja)
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // projectId: .env-ből vagy a JSON-ból
      projectId:
        process.env.VITE_FIREBASE_PROJECT_ID || serviceAccount.project_id,
    })
  }

  return admin.firestore()
}
