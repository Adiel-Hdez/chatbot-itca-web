import { useState, useRef, useEffect, type FormEvent } from 'react'

interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: string
  matchType?: string
}

const QUICK_TESTS = [
  '¿Cuáles son las cuotas y aranceles?',
  '¿Qué carreras técnicas ofrecen?',
  '¿Hay opciones para personas que trabajan?',
  '¿Cómo aplico a una beca?',
  '¿Tienen ingeniería mecatrónica o gastronomía?',
  'Hola, quiero más información de nuevo ingreso',
]

export default function WhatsAppSimulator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: '¡Hola! 👋 Te saluda el Asistente Virtual oficial de *ITCA-FEPADE Centro Regional Santa Ana*.\n\nEstoy listo para apoyarte con información sobre:\n• 📝 *Proceso de nuevo ingreso y requisitos*\n• 🎓 *Carreras técnicas y pensums*\n• 💰 *Cuotas, aranceles y métodos de pago*\n• 📜 *Solicitud de becas y trámites de Registro Académico*\n\n¿En qué te puedo orientar hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      matchType: 'DIRECT_FAQ',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: now,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8080/api/bot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ message: textToSend.trim(), from: '503-simulador' }),
      })

      const data = await res.json()
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: data.reply || 'Sin respuesta del servicio.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchType: data.matchType,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'bot',
          text: '⚠️ No se pudo conectar con el servidor backend (puerto 8080). Verifica que el servicio esté corriendo.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          matchType: 'ERROR',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const formatText = (text: string) => {
    // Reemplazar *negrita* por <strong>
    const parts = text.split(/(\*[^*]+\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(1, -1)}
          </strong>
        )
      }
      // Procesar URLs y saltos de línea
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ))
    })
  }

  return (
    <div className="flex flex-col h-[750px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* WhatsApp Header con Acento ITCA */}
      <div className="bg-[#851016] px-4 py-3 flex items-center justify-between text-white shadow-sm border-b border-[#6e0d12]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d4a017] text-[#851016] flex items-center justify-center font-bold text-lg shadow-sm">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm">ITCA Santa Ana · Bot Oficial</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d4a017] text-[#851016] font-extrabold uppercase">
                Simulador
              </span>
            </div>
            <p className="text-xs text-white/90 font-medium">en línea · Conectado a Spring Boot y MySQL</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome-reset',
                role: 'bot',
                text: 'Chat reiniciado. Escribe cualquier duda para probar las respuestas configuradas en el panel.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                matchType: 'RESET',
              },
            ])
          }
          className="text-xs text-white bg-black/25 hover:bg-black/40 px-3 py-1.5 rounded-xl border border-white/20 transition-all cursor-pointer font-medium"
        >
          Limpiar chat
        </button>
      </div>

      {/* Quick Test Chips */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Pruebas rápidas:</span>
        {QUICK_TESTS.map((t, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(t)}
            disabled={loading}
            className="text-xs px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 font-medium shadow-2xs"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Messages area (WhatsApp style light canvas) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2] bg-opacity-70">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm relative ${
                msg.role === 'user'
                  ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {formatText(msg.text)}
              </div>

              <div className="flex items-center justify-end gap-1.5 mt-1.5 pt-1 border-t border-slate-200/50">
                {msg.matchType && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      msg.matchType === 'DIRECT_FAQ'
                        ? 'bg-emerald-100 text-emerald-800'
                        : msg.matchType === 'AI_RAG'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {msg.matchType === 'DIRECT_FAQ' ? '⚡ FAQ Exacta' : msg.matchType === 'AI_RAG' ? '🤖 RAG Gemini' : msg.matchType}
                  </span>
                )}
                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                {msg.role === 'user' && <span className="text-[11px] text-[#53bdeb] font-bold">✓✓</span>}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl rounded-tl-none text-slate-700 text-xs w-fit border border-slate-200 shadow-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-medium">Consultando base de conocimientos oficial...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="bg-slate-100 p-3 flex items-center gap-2 border-t border-slate-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe una pregunta sobre ITCA Santa Ana..."
          disabled={loading}
          className="flex-1 py-2.5 px-4 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#851016] focus:border-[#851016] transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-10 h-10 bg-[#851016] hover:bg-[#700d12] text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#851016]/20 cursor-pointer"
        >
          <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
