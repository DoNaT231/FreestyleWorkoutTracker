/**
 * Freestyle Workout Tracker – defaultExercises seed script
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Feltölti az alapértelmezett gyakorlatokat a Firestore defaultExercises
 * collection-be fix document ID-kkel (Admin SDK).
 *
 * Futtatás: npm run seed:exercises
 *
 * Biztonságos többszöri futtatásra: set({ merge: true }) – felülírja/frissíti
 * a mezőket, de nem törli a dokumentumot, ha már létezik.
 *
 * Előfeltétel: firebase-service-account.json a projekt gyökerében
 * (lásd scripts/lib/initFirebaseAdmin.js).
 */

import { defaultExercises } from './data/defaultExercises.js'
import { initFirebaseAdmin } from './lib/initFirebaseAdmin.js'
import { buildExerciseSeedPayload } from './lib/normalizeExercise.js'

const COLLECTION_ID = 'defaultExercises'

/**
 * Feltölti vagy frissíti az összes alap gyakorlatot Firestore-ban.
 * @param {FirebaseFirestore.Firestore} [db] – opcionális, teszteléshez injektálható
 */
export async function seedDefaultExercises(db) {
  const firestore = db ?? initFirebaseAdmin()

  for (const exercise of defaultExercises) {
    // id → Firestore document ID; a többi mező megy a dokumentumba
    const { id, ...data } = exercise

    await firestore
      .collection(COLLECTION_ID)
      .doc(id)
      .set(
        {
          ...buildExerciseSeedPayload(data),
          // ISO string – kliens és Admin SDK egyaránt olvassa
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )

    console.log(`  ✓ ${id} – ${data.name}`)
  }

  console.log(
    `\n${defaultExercises.length} alap gyakorlat feltöltve/frissítve a „${COLLECTION_ID}” collection-ben.`,
  )
}

// Csak közvetlen futtatáskor (npm run seed:exercises) – nem importáláskor
const isDirectRun = process.argv[1]?.endsWith('seedDefaultExercises.js')

if (isDirectRun) {
  console.log('Default exercises seed indul...\n')

  seedDefaultExercises()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('\n[HIBA] Seed sikertelen:', error.message)
      process.exit(1)
    })
}
