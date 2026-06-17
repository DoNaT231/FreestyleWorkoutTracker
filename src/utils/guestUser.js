/**
 * Freestyle Workout Tracker – vendég felhasználó segédek
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { GUEST_USER_ID } from '../constants/guest'

/**
 * @returns {object}
 */
export function createGuestUser() {
  return {
    uid: GUEST_USER_ID,
    email: 'vendeg@demo.fwt',
    displayName: 'Vendég (demó)',
    isGuest: true,
  }
}

/**
 * @param {object|null|undefined} user
 */
export function isGuestUser(user) {
  return Boolean(user?.isGuest) || user?.uid === GUEST_USER_ID
}
