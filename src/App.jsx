import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from './components/ProtectedRoute'

// ─── Lazy-loaded pages ──────────────────────────────────
const LandingPage      = lazy(() => import('./pages/LandingPage'))
const LoginPage         = lazy(() => import('./pages/LoginPage'))
const SignupPage        = lazy(() => import('./pages/SignupPage'))
const DashboardPage     = lazy(() => import('./pages/DashboardPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const NotFoundPage      = lazy(() => import('./pages/NotFoundPage'))

// ─── Page loading fallback ──────────────────────────────
function PageLoader() {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="spinner large"></div>
      </div>
    </div>
  )
}

// ─── Animated Routes wrapper ────────────────────────────
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}

// ─── Root App ───────────────────────────────────────────
export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          gutter={8}
          containerStyle={{ top: 64 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f1f5f9',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              fontSize: '13px',
              padding: '10px 14px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#0f172a' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0f172a' },
            },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  )
}
