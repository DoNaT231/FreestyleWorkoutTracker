/**
 * Freestyle Workout Tracker – ESLint konfiguráció
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Kódstílus és React-specifikus szabályok (hooks, HMR refresh).
 * Futtatás: npm run lint
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // dist mappa kihagyása – build output, nem forráskód
  globalIgnores(['dist']),
  // Node.js seed / migration scriptek (scripts/)
  {
    files: ['scripts/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node, // process, __dirname stb.
    },
  },
  // React kliens kód (src/)
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['scripts/**'],
    extends: [
      js.configs.recommended, // alap JavaScript szabályok
      reactHooks.configs.flat.recommended, // pl. hooks sorrendje
      reactRefresh.configs.vite, // Vite HMR kompatibilitás
    ],
    languageOptions: {
      globals: globals.browser, // window, document stb. engedélyezése
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
