/**
 * Freestyle Workout Tracker – Vite build konfiguráció
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Vite fejlesztői szerver és production build beállításai.
 * Pluginok: React JSX transform + Tailwind CSS v4 feldolgozás.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), // JSX/TSX fordítás, Fast Refresh fejlesztés közben
    tailwindcss(), // Tailwind v4 – @import 'tailwindcss' feldolgozása
  ],
})
