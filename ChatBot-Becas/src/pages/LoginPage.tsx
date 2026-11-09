import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UserData } from '../App'

const API_URL = 'http://localhost:8080/api/auth/login'

interface LoginPageProps {
  onLogin: (userData: UserData) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nombre.trim() || !apellido.trim() || !correo.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (password !== 'itca') {
      setError('Contraseña incorrecta')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), apellido: apellido.trim(), correo: correo.trim(), password }),
      })

      const data = await res.json()

      if (data.success) {
        onLogin({
          id: data.userId,
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.correo,
        })
        navigate('/chat')
      } else {
        setError(data.message || 'Error al iniciar sesión')
      }
    } catch {
      setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          50%      { transform: translateY(-30px) rotate(180deg); opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
          70%  { transform: scale(1); box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out both;
        }
        .animate-fade-in-up-delay {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
        {/* Partículas flotantes de fondo */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              width: `${Math.random() * 12 + 4}px`,
              height: `${Math.random() * 12 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${Math.random() * 4 + 4}s`,
            }}
          />
        ))}

        {/* Círculos de fondo decorativos */}
        <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />

        {/* Card principal */}
        <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in-up-delay">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
                <span className="text-4xl">🎓</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                ITCA-FEPADE
              </h1>
              <p className="text-indigo-300 text-sm font-medium mt-1">
                Regional Santa Ana
              </p>
              <p className="text-white/60 text-xs mt-2 uppercase tracking-widest">
                Asistente Virtual Institucional
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 text-sm transition-colors group-focus-within:text-indigo-200">👤</span>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 focus:bg-white/10 transition-all duration-300"
                  />
                </div>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 text-sm transition-colors group-focus-within:text-indigo-200">👤</span>
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 focus:bg-white/10 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 text-sm transition-colors group-focus-within:text-indigo-200">📧</span>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 focus:bg-white/10 transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 text-sm transition-colors group-focus-within:text-indigo-200">🔒</span>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 focus:bg-white/10 transition-all duration-300"
                />
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 animate-shake">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] overflow-hidden"
              >
                {loading && <div className="absolute inset-0 animate-shimmer" />}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <span className="text-lg">→</span>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-white/30 text-xs mt-6">
              Ingresa con la contraseña proporcionada por tu institución
            </p>
          </div>

          {/* Brillo inferior decorativo */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-indigo-500/20 rounded-full blur-xl" />
        </div>
      </div>
    </>
  )
}

