import { useState, type FormEvent } from 'react'
import type { AdminUser } from '../types'

interface AdminLoginPageProps {
  onLogin: (user: AdminUser) => void
}

const API_URL = 'http://localhost:8080/api/admin/login'

export default function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [correo, setCorreo] = useState('admin@itca.edu.sv')
  const [password, setPassword] = useState('itca')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!correo.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correo.trim(), password: password.trim() }),
      })

      const data = await res.json()
      if (data.success) {
        onLogin({
          adminId: data.adminId,
          nombre: data.nombre,
          correo: data.correo,
          rol: data.rol,
        })
      } else {
        setError(data.message || 'Credenciales incorrectas.')
      }
    } catch {
      setError('No se pudo conectar con el servidor backend (puerto 8080).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Barra superior institucional ITCA */}
      <div className="w-full bg-[#851016] text-white px-6 py-3 shadow-md flex items-center justify-between z-10 border-b border-[#a81c24]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4a017] flex items-center justify-center text-[#851016] font-extrabold text-sm shadow">
            IT
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-sm tracking-wide">
              <span>ITCA</span>
              <span className="text-[#f59e0b]">⚡</span>
              <span>FEPADE</span>
            </div>
            <p className="text-[10px] text-white/80 uppercase tracking-widest font-medium">
              Centro Regional Santa Ana
            </p>
          </div>
        </div>
        <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/90 font-medium">
          Portal Administrativo
        </span>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-slate-800/95 border border-slate-700/80 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#851016] via-[#9e1b32] to-[#a31d1d] text-white shadow-xl shadow-[#851016]/40 mb-4 border border-[#d4a017]/40">
              <span className="text-3xl">🏛️</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Panel Administrativo</h1>
            <p className="text-xs text-[#d4a017] font-bold tracking-wider uppercase mt-1">
              Chatbot WhatsApp · ITCA Santa Ana
            </p>
            <p className="text-xs text-slate-300 mt-2">
              Gestión de preguntas y respuestas oficiales para aspirantes y estudiantes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">✉️</span>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="admin@itca.edu.sv"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#851016] focus:border-[#851016] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#851016] focus:border-[#851016] transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Contraseña por defecto: <span className="text-[#f59e0b] font-mono font-bold">itca</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-3 text-red-200 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#851016] via-[#9e1b32] to-[#851016] hover:from-[#700d12] hover:to-[#851016] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#851016]/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-[#d4a017]/30"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/80 text-center">
            <p className="text-xs text-slate-400">
              Escuela Especializada en Ingeniería <strong className="text-white">ITCA-FEPADE</strong><br />
              Centro Regional Santa Ana
            </p>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <footer className="w-full py-3 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950">
        © 2026 ITCA-FEPADE · Regional Santa Ana · Asistente Virtual Oficial
      </footer>
    </div>
  )
}
