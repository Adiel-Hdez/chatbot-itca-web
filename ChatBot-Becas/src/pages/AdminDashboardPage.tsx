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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-500/20">
              🏛️
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                <span>ITCA-FEPADE Santa Ana</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                  Panel Admin
                </span>
              </h1>
              <p className="text-xs text-slate-400">Administrador de Respuestas para Chatbot WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-medium">{user.nombre}</span>
              <span className="text-[10px] text-slate-500">({user.correo})</span>
            </div>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Preguntas</span>
              <span className="text-xl">📚</span>
            </div>
            <p className="text-3xl font-extrabold text-white mt-2">{stats ? stats.totalFaqs : '...'}</p>
            <p className="text-xs text-emerald-400 mt-1">Configuradas en base de datos</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Respuestas Activas</span>
              <span className="text-xl">🟢</span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">{stats ? stats.activeFaqs : '...'}</p>
            <p className="text-xs text-slate-400 mt-1">Habilitadas en WhatsApp</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Categorías</span>
              <span className="text-xl">🏷️</span>
            </div>
            <p className="text-3xl font-extrabold text-indigo-400 mt-2">{stats ? stats.totalCategories : '...'}</p>
            <p className="text-xs text-slate-400 mt-1">Secciones institucionales</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mensajes Atendidos</span>
              <span className="text-xl">💬</span>
            </div>
            <p className="text-3xl font-extrabold text-teal-400 mt-2">{stats ? stats.totalMessagesHandled : '0'}</p>
            <p className="text-xs text-slate-400 mt-1">Interacciones de usuarios</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'faqs'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span>📋 Base de Preguntas y Respuestas</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{faqs.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span>📱 Simulador en Vivo (WhatsApp)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span>📊 Historial de Mensajes</span>
          </button>

          <button
            onClick={() => setActiveTab('connection')}
            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'connection'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span>⚙️ Conectar WhatsApp Real</span>
          </button>
        </div>

        {/* Tab 1: FAQs Management */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            {/* Filter / Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar en preguntas, respuestas o palabras clave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-2xl text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingFaq(null)
                    setIsModalOpen(true)
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
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
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'TODAS'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
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
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>

            {/* FAQs List */}
            {loading ? (
              <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Cargando base de conocimientos...</p>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800">
                <span className="text-4xl block mb-2">🔎</span>
                <p className="text-base font-semibold text-white">No se encontraron preguntas</p>
                <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros o agrega una nueva pregunta.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg transition-all duration-200 hover:border-slate-700 ${
                      faq.activo ? 'border-slate-800' : 'border-amber-500/30 opacity-75 bg-slate-900/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {faq.categoria}
                          </span>
                          {!faq.activo && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              ⏸️ Pausada
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-white leading-snug">{faq.pregunta}</h3>

                        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 whitespace-pre-wrap font-sans">
                          {faq.respuesta}
                        </div>

                        {faq.palabrasClave && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">Palabras clave:</span>
                            {faq.palabrasClave.split(',').map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60"
                              >
                                {kw.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleFaq(faq.id)}
                          title={faq.activo ? 'Pausar respuesta' : 'Activar respuesta'}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            faq.activo
                              ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
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
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>✏️ Editar</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteId(faq.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-all cursor-pointer flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <span className="text-4xl block mb-2">🗑️</span>
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar esta pregunta?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Esta acción quitará la respuesta oficial de la base de datos y el bot de WhatsApp dejará de utilizarla.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteFaq(deleteId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-600/30 cursor-pointer"
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
