import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import ErrorBoundary from './ErrorBoundary'

export interface UserData {
  id: number
  nombre: string
  apellido: string
  correo: string
}

function App() {
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const saved = localStorage.getItem('chatbot_user')
      if (!saved) return null
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') {
        return {
          id: Number(parsed.id || parsed.userId || 0),
          nombre: String(parsed.nombre || parsed.name || 'Estudiante'),
          apellido: String(parsed.apellido || ''),
          correo: String(parsed.correo || parsed.email || ''),
        }
      }
      return null
    } catch {
      localStorage.removeItem('chatbot_user')
      return null
    }
  })

  const handleLogin = (userData: UserData) => {
    setUser(userData)
    localStorage.setItem('chatbot_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('chatbot_user')
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/chat" replace /> : <LoginPage onLogin={handleLogin} />
            }
          />
          <Route
            path="/chat"
            element={
              user ? <ChatPage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
