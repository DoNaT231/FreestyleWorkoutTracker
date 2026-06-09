/**
 * Freestyle Workout Tracker – belépési pont
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Provider rétegek (kívülről befelé):
 * 1. BrowserRouter – URL alapú navigáció
 * 2. AuthProvider – Firebase auth állapot
 * 3. ActiveWorkoutProvider – aktív edzés (localStorage)
 * 4. App – route-ok
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ActiveWorkoutProvider } from './context/ActiveWorkoutProvider.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'

const rootElement = document.getElementById('root')

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ActiveWorkoutProvider>
          <App />
        </ActiveWorkoutProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
