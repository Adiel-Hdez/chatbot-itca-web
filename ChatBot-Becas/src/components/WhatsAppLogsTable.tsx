import { useState, useEffect } from 'react'
import type { WhatsAppLog } from '../types'
import { API_BASE_URL } from '../config/api'

export default function WhatsAppLogsTable() {
  const [logs, setLogs] = useState<WhatsAppLog[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/bot/logs`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch (e) {
      console.error('Error fetching logs', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleString('es-SV', {
        dateStyle: 'short',
        timeStyle: 'medium',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm border-l-4 border-l-[#851016]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📊 Registro de Mensajes Atendidos en WhatsApp</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Historial de interacciones reales de los aspirantes y estudiantes que escriben al número de WhatsApp.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-[#851016] to-[#a31d1d] hover:from-[#700d12] hover:to-[#851016] text-white text-xs font-bold rounded-xl border border-[#d4a017]/40 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#851016]/20"
        >
          <span>🔄</span>
          <span>{loading ? 'Actualizando...' : 'Refrescar'}</span>
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <span className="text-4xl block mb-2">💬</span>
          <p className="text-sm font-medium">Aún no hay mensajes registrados en WhatsApp.</p>
          <p className="text-xs text-slate-400 mt-1">
            Los mensajes enviados desde el simulador o desde WhatsApp real aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3">Fecha y Hora</th>
                <th className="py-3 px-3">Remitente</th>
                <th className="py-3 px-3">Mensaje del Usuario</th>
                <th className="py-3 px-3">Respuesta Enviada</th>
                <th className="py-3 px-3">Método</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">{log.remitente}</td>
                  <td className="py-3 px-3 text-slate-900 font-medium max-w-xs truncate" title={log.mensajeUsuario}>
                    {log.mensajeUsuario}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-md truncate" title={log.respuestaEnviada}>
                    {log.respuestaEnviada}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        log.coincidenciaTipo === 'DIRECT_FAQ'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.coincidenciaTipo === 'AI_RAG'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : log.coincidenciaTipo === 'GREETING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {log.coincidenciaTipo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
