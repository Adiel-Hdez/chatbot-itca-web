import { Router } from 'express'
import { Faq, WhatsAppLog } from '../models/index.js'

const router = Router()

// GET /api/faqs
router.get('/', async (req, res) => {
  try {
    const faqs = await Faq.findAll({ order: [['id', 'ASC']] })
    res.json(faqs)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener FAQs: ' + err.message })
  }
})

// GET /api/faqs/stats
router.get('/stats', async (req, res) => {
  try {
    const totalFaqs = await Faq.count()
    const activeFaqs = await Faq.count({ where: { activo: true } })
    const allFaqs = await Faq.findAll({ attributes: ['categoria'] })
    const categoriesSet = new Set(allFaqs.map((f) => f.categoria))
    const totalCategories = categoriesSet.size
    const categories = Array.from(categoriesSet).sort()
    const totalMessagesHandled = await WhatsAppLog.count()

    res.json({
      totalFaqs,
      activeFaqs,
      totalCategories,
      totalMessagesHandled,
      categories,
    })
  } catch (err) {
    res.status(500).json({ error: 'Error al calcular estadísticas: ' + err.message })
  }
})

// POST /api/faqs
router.post('/', async (req, res) => {
  try {
    const { categoria, pregunta, palabrasClave, respuesta, activo } = req.body
    if (!categoria || !pregunta || !respuesta) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' })
    }

    const created = await Faq.create({
      categoria,
      pregunta,
      palabrasClave: palabrasClave || '',
      respuesta,
      activo: activo !== undefined ? activo : true,
    })

    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: 'Error al crear FAQ: ' + err.message })
  }
})

// PUT /api/faqs/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const faq = await Faq.findByPk(id)
    if (!faq) {
      return res.status(404).json({ error: 'FAQ no encontrada.' })
    }

    const { categoria, pregunta, palabrasClave, respuesta, activo } = req.body
    await faq.update({
      categoria: categoria || faq.categoria,
      pregunta: pregunta || faq.pregunta,
      palabrasClave: palabrasClave !== undefined ? palabrasClave : faq.palabrasClave,
      respuesta: respuesta || faq.respuesta,
      activo: activo !== undefined ? activo : faq.activo,
    })

    res.json(faq)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar FAQ: ' + err.message })
  }
})

// DELETE /api/faqs/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const faq = await Faq.findByPk(id)
    if (!faq) {
      return res.status(404).json({ error: 'FAQ no encontrada.' })
    }

    await faq.destroy()
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar FAQ: ' + err.message })
  }
})

// PATCH /api/faqs/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params
    const faq = await Faq.findByPk(id)
    if (!faq) {
      return res.status(404).json({ error: 'FAQ no encontrada.' })
    }

    await faq.update({ activo: !faq.activo })
    res.json(faq)
  } catch (err) {
    res.status(500).json({ error: 'Error al alternar estado de FAQ: ' + err.message })
  }
})

export default router
