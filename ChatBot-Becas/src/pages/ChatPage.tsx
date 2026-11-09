import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { UserData } from '../App'

const API_URL = 'http://localhost:8080/api/chat'

interface ChatPageProps {
  user: UserData
  onLogout: () => void
}

interface Message {
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: Date
}

const SUGGESTIONS = [
  '¿Qué carreras técnicas ofrecen?',
  '¿Requisitos de nuevo ingreso?',
  '¿Cómo consultar estado de cuenta o mora?',
  '¿Cómo tramitar becas en admisión?',
  '¿Cuáles son las fechas de inicio de clases?',
]

export default function ChatPage({ user, onLogout }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `¡Hola ${user?.nombre || 'Estudiante'}! 👋 Soy el **Asistente Virtual oficial de ITCA-FEPADE Centro Regional Santa Ana**.\n\nEstoy listo para guiarte en:\n• 📚 **Oferta Académica:** Carreras técnicas, horarios flexibles y cursos.\n• 📝 **Admisión y Reingresos:** Requisitos, fechas de inicio y pasos para reingreso.\n• 💳 **Pagos y Aranceles:** Vencimientos, mora, consulta de estado de cuenta y comprobantes.\n• 🎓 **Becas y Admisión:** Trámite simultáneo con el curso de admisión.\n\n¿En qué te puedo orientar hoy?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const buildHistory = (): { role: string; text: string }[] => {
    return messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, text: m.text }))
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return

    setShowSuggestions(false)

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const history = buildHistory()
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      })

      const data = await res.json()

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.success
          ? data.reply
          : 'Disculpa, ocurrió un error temporal al procesar tu consulta. Intenta nuevamente por favor. 😔',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'model',
          text: 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución. 🔧',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })

  const renderText = (text: string) => {
    if (!text) return null
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ))
    })
  }

  return (
    <>
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounceIn {
          0%   { opacity: 0; transform: scale(0.3); }
          50%  { opacity: 1; transform: scale(1.05); }
          70%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-bot  { animation: slideInLeft 0.4s ease-out both; }
        .msg-user { animation: slideInRight 0.4s ease-out both; }
        .msg-bounce { animation: bounceIn 0.5s ease-out both; }
        .fade-in  { animation: fadeIn 0.3s ease-out both; }
        .slide-up { animation: slideUp 0.4s ease-out both; }
        .typing-dot {
          animation: typingDot 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.5); }
        .chat-pattern {
          background-color: #0f172a;
          background-image:
            radial-gradient(circle at 20% 50%, rgba(99,102,241,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139,92,246,0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(59,130,246,0.04) 0%, transparent 50%);
        }
      `}</style>

      <div className="flex flex-col h-screen bg-slate-950">
        {/* Header */}
        <header className="relative z-10 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 shadow-lg shadow-indigo-900/30">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
                <span className="text-xl">🏛️</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight flex items-center gap-1.5">
                  Asistente Virtual ITCA
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-indigo-100 font-normal">Santa Ana</span>
                </h1>
                <p className="text-indigo-200 text-xs">ITCA-FEPADE · Centro Regional Santa Ana</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-white text-sm font-medium">
                  Hola, {user?.nombre || 'Usuario'}!
                </p>
                <p className="text-indigo-200 text-xs">{user?.correo || ''}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-sm">
                {((user?.nombre?.[0] || 'U') + (user?.apellido?.[0] || '')).toUpperCase()}
              </div>
              <button
                onClick={onLogout}
                className="ml-1 px-3 py-1.5 text-xs font-medium text-indigo-100 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 active:scale-95"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* Messages area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin chat-pattern">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                } ${msg.role === 'user' ? 'msg-user' : 'msg-bot'}`}
              >
                {/* Bot avatar */}
                {msg.role === 'model' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <span className="text-sm">🏛️</span>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-md'
                      : 'bg-slate-800/85 backdrop-blur border border-slate-700/60 text-slate-200 rounded-bl-md'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {renderText(msg.text)}
                  </div>
                  <p
                    className={`text-[10px] mt-1.5 ${
                      msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
                    {(user?.nombre?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2.5 msg-bot">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-sm">🏛️</span>
                </div>
                <div className="bg-slate-800/85 backdrop-blur border border-slate-700/60 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-2 slide-up">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="px-3.5 py-1.5 text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-200 hover:text-white border border-indigo-500/30 hover:border-indigo-400/60 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input area */}
        <footer className="relative z-10 bg-slate-900/95 backdrop-blur border-t border-slate-800">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta sobre carreras, trámites, pagos, admisión..."
              disabled={isTyping}
              className="flex-1 py-3 px-5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 disabled:opacity-50 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-11 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 flex items-center justify-center"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
          <p className="text-center text-slate-500 text-[10px] pb-2">
            Asistente Virtual ITCA Santa Ana · Para trámites oficiales o ajustes de expediente consulta en Registro Académico o Colecturía.
          </p>
        </footer>
      </div>
    </>
  )
}
