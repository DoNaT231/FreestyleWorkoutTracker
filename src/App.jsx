/**
 * Freestyle Workout Tracker – fő alkalmazás komponens
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Route definíciók és auth védelem:
 * - /                        → Dashboard (védett)
 * - /exercises               → Gyakorlatok listája (védett)
 * - /exercises/new           → Új saját gyakorlat (védett)
 * - /exercises/:id/edit      → Saját gyakorlat szerkesztése (védett)
 * - /workout/new             → Új edzés (védett)
 * - /workout/active          → Aktív edzés flow (védett)
 * - /workout/summary         → Gyakorlat összegzés (védett)
 * - /workout/done            → Poszt-edzés összegzés (védett)
 * - /history                 → Edzésnapló lista (védett)
 * - /history/:workoutId      → Edzés részletei + törlés (védett)
 * - /login, /register        → Auth (vendég)
 */

import { Navigate, Route, Routes } from 'react-router-dom'
import GuestRoute from './components/auth/GuestRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ActiveWorkoutPage from './pages/ActiveWorkoutPage'
import DashboardPage from './pages/DashboardPage'
import ExerciseFormPage from './pages/ExerciseFormPage'
import ExerciseSummaryPage from './pages/ExerciseSummaryPage'
import ExercisesPage from './pages/ExercisesPage'
import LoginPage from './pages/LoginPage'
import NewWorkoutPage from './pages/NewWorkoutPage'
import RegisterPage from './pages/RegisterPage'
import WorkoutHistoryPage from './pages/WorkoutHistoryPage'
import WorkoutDetailPage from './pages/WorkoutDetailPage'
import WorkoutPostSummaryPage from './pages/WorkoutPostSummaryPage'

/** Védett route wrapper – rövidebb szintaxis */
function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />
      <Route
        path="/exercises"
        element={
          <Protected>
            <ExercisesPage />
          </Protected>
        }
      />
      <Route
        path="/exercises/new"
        element={
          <Protected>
            <ExerciseFormPage />
          </Protected>
        }
      />
      <Route
        path="/exercises/:exerciseId/edit"
        element={
          <Protected>
            <ExerciseFormPage />
          </Protected>
        }
      />
      <Route
        path="/workout/new"
        element={
          <Protected>
            <NewWorkoutPage />
          </Protected>
        }
      />
      <Route
        path="/workout/active"
        element={
          <Protected>
            <ActiveWorkoutPage />
          </Protected>
        }
      />
      <Route
        path="/workout/summary"
        element={
          <Protected>
            <ExerciseSummaryPage />
          </Protected>
        }
      />
      <Route
        path="/workout/done"
        element={
          <Protected>
            <WorkoutPostSummaryPage />
          </Protected>
        }
      />
      <Route
        path="/history"
        element={
          <Protected>
            <WorkoutHistoryPage />
          </Protected>
        }
      />
      <Route
        path="/history/:workoutId"
        element={
          <Protected>
            <WorkoutDetailPage />
          </Protected>
        }
      />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
