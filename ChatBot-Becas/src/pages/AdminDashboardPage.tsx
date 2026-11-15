import { useState, useEffect, useMemo } from 'react'
import type { AdminUser, Faq, DashboardStats } from '../types'
import FaqModal from '../components/FaqModal'
import WhatsAppSimulator from '../components/WhatsAppSimulator'
import WhatsAppLogsTable from '../components/WhatsAppLogsTable'
import WhatsAppConnectionInfo from '../components/WhatsAppConnectionInfo'

interface AdminDashboardPageProps {
  user: AdminUser
  onLogout: () => void
}

export default function AdminDashboardPage({ user, onLogout }: AdminDashboardPageProps) {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'faqs' | 'simulator' | 'logs' | 'connection'>('faqs')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('TODAS')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [faqsRes, statsRes] = await Promise.all([
        fetch('http://localhost:8080/api/faqs'),
        fetch('http://localhost:8080/api/faqs/stats'),
      ])

      if (faqsRes.ok) {
        const faqsData = await faqsRes.json()
        setFaqs(faqsData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (e) {
      console.error('Error cargando datos del backend', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    faqs.forEach((f) => {
      if (f.categoria) set.add(f.categoria)
    })
    return Array.from(set).sort()
  }, [faqs])

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchesCategory = selectedCategory === 'TODAS' || f.categoria === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        f.pregunta.toLowerCase().includes(q) ||
        f.respuesta.toLowerCase().includes(q) ||
        (f.palabrasClave && f.palabrasClave.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [faqs, selectedCategory, searchQuery])

  const handleToggleFaq = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/faqs/${id}/toggle`, {
        method: 'PATCH',
      })
      if (res.ok) {
        const updated: Faq = await res.json()
        setFaqs((prev) => prev.map((f) => (f.id === id ? updated : f)))
        if (stats) {
          setStats({
            ...stats,
            activeFaqs: updated.activo ? stats.activeFaqs + 1 : stats.activeFaqs - 1,
          })
        }
      }
    } catch (e) {
      console.error('Error al cambiar estado de FAQ', e)
    }
  }

  const handleDeleteFaq = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/faqs/${id}`, {
        method: 'DELETE',
      })
      if (res.ok || res.status === 204) {
        setFaqs((prev) => prev.filter((f) => f.id !== id))
        setDeleteId(null)
        if (stats) {
          setStats({
            ...stats,
            totalFaqs: stats.totalFaqs - 1,
          })
        }
      }
    } catch (e) {
      console.error('Error al eliminar FAQ', e)
    }
  }

  const handleSaveFaq = (saved: Faq) => {
    setFaqs((prev) => {
      const index = prev.findIndex((f) => f.id === saved.id)
      if (index >= 0) {
        const copy = [...prev]
        copy[index] = saved
        return copy
      }
      return [saved, ...prev]
    })
    fetchData()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Top Navbar en Rojo Institucional ITCA */}
      <header className="sticky top-0 z-30 bg-[#851016] text-white shadow-md border-b border-[#6e0d12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4a017] text-[#851016] flex items-center justify-center font-black text-lg shadow-sm">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-wide text-white">ITCA-FEPADE</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4a017] text-[#851016] font-extrabold uppercase">
                  Santa Ana
                </span>
              </div>
              <p className="text-[11px] text-white/90 font-medium">Panel Administrativo · Chatbot WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#d4a017] animate-pulse" />
              <span className="text-xs text-white font-semibold">{user.nombre}</span>
              <span className="text-[10px] text-white/80">({user.correo})</span>
            </div>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-black/25 hover:bg-black/40 rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content en Fondo Blanco / Gris Suave Institucional */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#851016]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Preguntas</span>
              <span className="text-xl">📚</span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">{stats ? stats.totalFaqs : '...'}</p>
            <p className="text-xs text-[#851016] font-semibold mt-1">Preguntas institucionales</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#d4a017]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Respuestas Activas</span>
              <span className="text-xl">🟢</span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">{stats ? stats.activeFaqs : '...'}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Habilitadas en WhatsApp</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#851016]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Categorías</span>
              <span className="text-xl">🏷️</span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">{stats ? stats.totalCategories : '...'}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Módulos temáticos</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#d4a017]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mensajes Atendidos</span>
              <span className="text-xl">💬</span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">{stats ? stats.totalMessagesHandled : '0'}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Interacciones registradas</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'faqs'
                ? 'bg-white text-[#851016] border-t-2 border-[#851016] border-x border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📋 Base de Preguntas y Respuestas</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'faqs' ? 'bg-[#851016]/10 text-[#851016]' : 'bg-slate-200 text-slate-600'
            }`}>
              {faqs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-white text-[#851016] border-t-2 border-[#851016] border-x border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📱 Simulador en Vivo (WhatsApp)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-white text-[#851016] border-t-2 border-[#851016] border-x border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📊 Historial de Mensajes</span>
          </button>

          <button
            onClick={() => setActiveTab('connection')}
            className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'connection'
                ? 'bg-white text-[#851016] border-t-2 border-[#851016] border-x border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>⚙️ Conectar WhatsApp Real</span>
          </button>
        </div>

        {/* Tab 1: FAQs Management */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            {/* Filter / Search Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar en preguntas, respuestas o palabras clave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#851016] focus:border-[#851016] transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingFaq(null)
                    setIsModalOpen(true)
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#851016] to-[#a31d1d] hover:from-[#700d12] hover:to-[#851016] text-white font-bold text-sm rounded-xl shadow-md shadow-[#851016]/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap border border-[#d4a017]/40"
                >
                  <span>➕</span>
                  <span>Nueva Pregunta</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('TODAS')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'TODAS'
                    ? 'bg-[#851016] text-white shadow-sm border border-[#d4a017]/40'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-300'
                }`}
              >
                Todas ({faqs.length})
              </button>
              {categories.map((cat) => {
                const count = faqs.filter((f) => f.categoria === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#851016] text-white shadow-sm border border-[#d4a017]/40'
                        : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-300'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>

            {/* FAQs List */}
            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 border-4 border-[#851016] border-t-[#d4a017] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-600 font-medium">Cargando base de conocimientos de ITCA...</p>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-4xl block mb-2">🔎</span>
                <p className="text-base font-bold text-slate-800">No se encontraron preguntas</p>
                <p className="text-xs text-slate-500 mt-1">Prueba cambiando los filtros o agrega una nueva pregunta.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 ${
                      faq.activo ? 'border-slate-200' : 'border-amber-300 bg-amber-50/40 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#851016]/10 text-[#851016] border border-[#851016]/20">
                            {faq.categoria}
                          </span>
                          {!faq.activo && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              ⏸️ Pausada
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug">{faq.pregunta}</h3>

                        <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-wrap font-sans">
                          {faq.respuesta}
                        </div>

                        {faq.palabrasClave && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Palabras clave:</span>
                            {faq.palabrasClave.split(',').map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                              >
                                {kw.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleFaq(faq.id)}
                          title={faq.activo ? 'Pausar respuesta' : 'Activar respuesta'}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            faq.activo
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300'
                          }`}
                        >
                          <span>{faq.activo ? '🟢 Activa' : '⏸️ Pausada'}</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingFaq(faq)
                            setIsModalOpen(true)
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>✏️ Editar</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteId(faq.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>🗑️ Borrar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: WhatsApp Simulator */}
        {activeTab === 'simulator' && <WhatsAppSimulator />}

        {/* Tab 3: WhatsApp Logs */}
        {activeTab === 'logs' && <WhatsAppLogsTable />}

        {/* Tab 4: Connection Info */}
        {activeTab === 'connection' && <WhatsAppConnectionInfo />}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <span className="text-4xl block mb-2">🗑️</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">¿Eliminar esta pregunta?</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Esta acción quitará la respuesta oficial de la base de datos y el bot de WhatsApp dejará de utilizarla.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteFaq(deleteId)}
                className="px-4 py-2 bg-[#851016] hover:bg-[#700d12] text-white text-xs font-bold rounded-xl shadow-md shadow-[#851016]/20 cursor-pointer transition-all"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faq Modal (Create / Edit) */}
      <FaqModal
        isOpen={isModalOpen}
        faq={editingFaq}
        categories={categories}
        onClose={() => {
          setIsModalOpen(false)
          setEditingFaq(null)
        }}
        onSave={handleSaveFaq}
      />
    </div>
  )
}
