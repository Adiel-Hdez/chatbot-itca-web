import { useState, useEffect } from 'react'

export default function WhatsAppConnectionInfo() {
  const [botStatus, setBotStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  const checkStatus = async () => {
    setBotStatus('checking')
    try {
      const res = await fetch('http://localhost:3001/status')
      if (res.ok) {
        const data = await res.json()
        setBotStatus(data.connected ? 'connected' : 'disconnected')
      } else {
        setBotStatus('disconnected')
      }
    } catch {
      setBotStatus('disconnected')
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 border-l-4 border-l-[#851016]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📱 Conexión del Bot con WhatsApp Real</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Vincula cualquier teléfono con WhatsApp para que responda automáticamente a mensajes reales de los estudiantes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                botStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : botStatus === 'checking'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`}
            />
            <span className="text-slate-700 font-semibold">
              {botStatus === 'connected'
                ? 'Bot Vinculado y Activo'
                : botStatus === 'checking'
                ? 'Verificando conector...'
                : 'Conector Desconectado'}
            </span>
          </div>
          <button
            onClick={checkStatus}
            className="px-3 py-1.5 bg-gradient-to-r from-[#851016] to-[#a31d1d] hover:from-[#700d12] hover:to-[#851016] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-[#851016]/20 border border-[#d4a017]/40"
          >
            Comprobar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pasos */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-[#851016] uppercase tracking-wider">
            ¿Cómo vincular tu WhatsApp? (3 Pasos Sencillos)
          </h4>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-[#851016] text-[#d4a017] font-extrabold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                1
              </span>
              <div>
                <p className="font-semibold text-slate-900">Inicia el microservicio de WhatsApp</p>
                <p className="text-slate-600 mt-0.5">
                  Abre una terminal y ejecuta en la carpeta <code className="text-[#851016] font-mono font-bold">whatsapp-bot</code>:
                </p>
                <div className="mt-2 p-2 bg-slate-900 rounded-lg font-mono text-[11px] text-[#f59e0b]">
                  cd whatsapp-bot<br />npm start
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-[#851016] text-[#d4a017] font-extrabold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                2
              </span>
              <div>
                <p className="font-semibold text-slate-900">Escanea el Código QR</p>
                <p className="text-slate-600 mt-0.5">
                  En tu teléfono, abre WhatsApp &gt; Dispositivos vinculados &gt; Vincular un dispositivo y apunta la cámara a la terminal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-[#851016] text-[#d4a017] font-extrabold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                3
              </span>
              <div>
                <p className="font-semibold text-slate-900">¡Listo! Bot en piloto automático</p>
                <p className="text-slate-600 mt-0.5">
                  Cualquier persona que le escriba a ese número recibirá las respuestas oficiales de ITCA Santa Ana configuradas en este panel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel explicativo */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>💡 Ventajas de esta Arquitectura</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-[#851016] font-bold">✓</span>
              <span><strong>Cero configuración de Meta:</strong> No requiere tarjetas de crédito ni cuentas complejas de Meta Cloud API.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#851016] font-bold">✓</span>
              <span><strong>Sincronización en tiempo real:</strong> Si editas una cuota o un link en este panel, el bot de WhatsApp responde con los nuevos datos al instante.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#851016] font-bold">✓</span>
              <span><strong>IA Híbrida Inteligente:</strong> Si un estudiante no escribe exactamente la pregunta, Gemini interpreta la duda y cita la respuesta de tu base de datos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#851016] font-bold">✓</span>
              <span><strong>Seguridad:</strong> La sesión de WhatsApp se almacena localmente de forma cifrada en la máquina del servidor.</span>
            </li>
          </ul>

          <div className="p-3 bg-[#851016]/5 border border-[#851016]/20 rounded-xl">
            <p className="text-[11px] text-[#851016] leading-relaxed">
              <strong>Tip de prueba:</strong> Mientras no vincules un número de WhatsApp real, puedes probar todo el comportamiento del bot en la pestaña <strong>&quot;📱 Simulador en Vivo&quot;</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
