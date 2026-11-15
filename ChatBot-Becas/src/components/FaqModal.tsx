import { useState, useEffect, type FormEvent } from 'react'
import type { Faq } from '../types'

interface FaqModalProps {
  isOpen: boolean
  faq: Faq | null
  categories: string[]
  onClose: () => void
  onSave: (savedFaq: Faq) => void
}

const DEFAULT_CATEGORIES = [
  'Nuevo Ingreso',
  'Carreras Técnicas',
  'Aranceles y Pagos',
  'Horarios y Jornadas',
  'Trámites Académicos',
  'Becas',
  'Cursos y Diplomados',
  'Otras Sedes',
]

export default function FaqModal({ isOpen, faq, categories, onClose, onSave }: FaqModalProps) {
  const [categoria, setCategoria] = useState('')
  const [customCategoria, setCustomCategoria] = useState('')
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [pregunta, setPregunta] = useState('')
  const [palabrasClave, setPalabrasClave] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [activo, setActivo] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories]))

  useEffect(() => {
    if (faq) {
      if (allCategories.includes(faq.categoria)) {
        setCategoria(faq.categoria)
        setIsCustomCategory(false)
        setCustomCategoria('')
      } else {
        setCategoria('CUSTOM')
        setIsCustomCategory(true)
        setCustomCategoria(faq.categoria)
      }
      setPregunta(faq.pregunta)
      setPalabrasClave(faq.palabrasClave)
      setRespuesta(faq.respuesta)
      setActivo(faq.activo)
    } else {
      setCategoria(allCategories[0] || 'Nuevo Ingreso')
      setIsCustomCategory(false)
      setCustomCategoria('')
      setPregunta('')
      setPalabrasClave('')
      setRespuesta('')
      setActivo(true)
    }
    setError('')
  }, [faq, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const finalCategory = isCustomCategory ? customCategoria.trim() : categoria.trim()

    if (!finalCategory) {
      setError('Por favor selecciona o escribe una categoría.')
      return
    }
    if (!pregunta.trim()) {
      setError('La pregunta no puede estar vacía.')
      return
    }
    if (!palabrasClave.trim()) {
      setError('Ingresa al menos una palabra clave para que el bot la reconozca.')
      return
    }
    if (!respuesta.trim()) {
      setError('La respuesta no puede estar vacía.')
      return
    }

    setSaving(true)
    const payload = {
      categoria: finalCategory,
      pregunta: pregunta.trim(),
      palabrasClave: palabrasClave.trim(),
      respuesta: respuesta.trim(),
      activo,
    }

    try {
      const url = faq ? `http://localhost:8080/api/faqs/${faq.id}` : 'http://localhost:8080/api/faqs'
      const method = faq ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Error al guardar')
      }

      const saved: Faq = await res.json()
      onSave(saved)
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error de conexión con el backend.')
      } else {
        setError('Error desconocido al guardar.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>{faq ? '✏️ Editar Pregunta y Respuesta' : '➕ Nueva Pregunta Institucional'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Esta información alimentará directamente al bot de WhatsApp en tiempo real.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Categoría
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value)
                  setIsCustomCategory(e.target.value === 'CUSTOM')
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#851016]"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="CUSTOM">+ Otra categoría nueva...</option>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  placeholder="Nombre de la nueva categoría"
                  value={customCategoria}
                  onChange={(e) => setCustomCategoria(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#851016]"
                  required
                />
              )}
            </div>
          </div>

          {/* Pregunta */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Pregunta Frecuente
            </label>
            <input
              type="text"
              placeholder="Ej: ¿Cuáles son las cuotas y formas de pago?"
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#851016]"
              required
            />
          </div>

          {/* Palabras Clave */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Palabras Clave / Sinónimos
              </label>
              <span className="text-[11px] text-slate-500">Separadas por comas</span>
            </div>
            <input
              type="text"
              placeholder="Ej: cuota, mensualidad, arancel, pago, cuanto cuesta, precio"
              value={palabrasClave}
              onChange={(e) => setPalabrasClave(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#851016]"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Permite que el bot reconozca la duda aunque el estudiante use distintas palabras.
            </p>
          </div>

          {/* Respuesta Oficial */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Respuesta Oficial de WhatsApp
              </label>
              <span className="text-[11px] text-[#851016] font-semibold">Admite *negritas*, saltos de línea y enlaces</span>
            </div>
            <textarea
              rows={6}
              placeholder="Escribe la respuesta detallada con enlaces y emojis..."
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#851016] font-sans leading-relaxed"
              required
            />
          </div>

          {/* Estado Activo */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="faq-activo"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="w-4 h-4 text-[#851016] bg-white border-slate-300 rounded focus:ring-[#851016] cursor-pointer"
            />
            <label htmlFor="faq-activo" className="text-sm font-medium text-slate-800 cursor-pointer">
              Habilitar respuesta en el Bot de WhatsApp ({activo ? '🟢 Activa' : '⏸️ Pausada'})
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl border border-slate-300 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-[#851016] to-[#a31d1d] hover:from-[#700d12] hover:to-[#851016] text-white text-sm font-bold rounded-xl shadow-md shadow-[#851016]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 border border-[#d4a017]/40"
            >
              {saving ? 'Guardando...' : faq ? 'Actualizar FAQ' : 'Guardar FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
