import { useState, useEffect } from 'react'
import type { WhatsAppLog } from '../types'

export default function WhatsAppLogsTable() {
  const [logs, setLogs] = useState<WhatsAppLog[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/bot/logs')
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
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📊 Registro de Mensajes Atendidos en WhatsApp</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historial de interacciones reales de los aspirantes y estudiantes que escriben al número de WhatsApp.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>🔄</span>
          <span>{loading ? 'Actualizando...' : 'Refrescar'}</span>
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <span className="text-4xl block mb-2">💬</span>
          <p className="text-sm">Aún no hay mensajes registrados en WhatsApp.</p>
          <p className="text-xs text-slate-600 mt-1">
            Los mensajes enviados desde el simulador o desde WhatsApp real aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Fecha y Hora</th>
                <th className="py-3 px-3">Remitente</th>
                <th className="py-3 px-3">Mensaje del Usuario</th>
                <th className="py-3 px-3">Respuesta Enviada</th>
                <th className="py-3 px-3">Método</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">{log.remitente}</td>
                  <td className="py-3 px-3 text-white max-w-xs truncate" title={log.mensajeUsuario}>
                    {log.mensajeUsuario}
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-md truncate" title={log.respuestaEnviada}>
                    {log.respuestaEnviada}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                        log.coincidenciaTipo === 'DIRECT_FAQ'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.coincidenciaTipo === 'AI_RAG'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : log.coincidenciaTipo === 'GREETING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
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
