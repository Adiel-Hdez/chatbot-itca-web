import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ErrorBoundary from './ErrorBoundary'
import type { AdminUser, UserData } from './types'

export type { UserData, AdminUser }

function App() {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('itca_admin')
      if (!saved) return null
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object' && parsed.correo) {
        return parsed
      }
      return null
    } catch {
      localStorage.removeItem('itca_admin')
      return null
    }
  })

  const handleLogin = (adminUser: AdminUser) => {
    setAdmin(adminUser)
    localStorage.setItem('itca_admin', JSON.stringify(adminUser))
  }

  const handleLogout = () => {
    setAdmin(null)
    localStorage.removeItem('itca_admin')
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              admin ? <Navigate to="/" replace /> : <AdminLoginPage onLogin={handleLogin} />
            }
          />
          <Route
            path="/"
            element={
              admin ? (
                <AdminDashboardPage user={admin} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
