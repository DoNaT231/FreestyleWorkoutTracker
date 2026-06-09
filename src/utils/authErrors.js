/**
 * Freestyle Workout Tracker – Firebase Auth hibaüzenetek
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * A Firebase angol error code-jait magyar, felhasználóbarát szöveggé alakítja.
 */

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-email': 'Érvénytelen email cím.',
  'auth/user-disabled': 'Ez a fiók le van tiltva.',
  'auth/user-not-found': 'Nincs ilyen felhasználó ezzel az email címmel.',
  'auth/wrong-password': 'Hibás jelszó.',
  'auth/invalid-credential': 'Hibás email vagy jelszó.',
  'auth/email-already-in-use': 'Ez az email cím már regisztrálva van.',
  'auth/weak-password': 'A jelszó túl gyenge (legalább 6 karakter kell).',
  'auth/too-many-requests': 'Túl sok próbálkozás. Próbáld később.',
  'auth/network-request-failed': 'Hálózati hiba. Ellenőrizd az internetet.',
}

/**
 * @param {unknown} error – Firebase Auth hiba objektum
 * @returns {string} Megjeleníthető hibaüzenet
 */
export function getAuthErrorMessage(error) {
  if (error && typeof error === 'object' && 'code' in error) {
    const message = AUTH_ERROR_MESSAGES[error.code]
    if (message) return message
  }

  return 'Ismeretlen hiba történt. Próbáld újra.'
}
