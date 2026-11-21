import { Router } from 'express'
import { WhatsAppLog } from '../models/index.js'
import { processMessage } from '../services/botService.js'

const router = Router()

// POST /api/bot/message
router.post('/message', async (req, res) => {
  try {
    const { message, from } = req.body
    const result = await processMessage(message, from)
    res.json(result)
  } catch (err) {
    res.status(500).json({
      success: false,
      reply: 'Disculpa, ocurrió un error interno al procesar el mensaje.',
      matchType: 'ERROR',
      error: err.message,
    })
  }
})

// GET /api/bot/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await WhatsAppLog.findAll({
      limit: 30,
      order: [['created_at', 'DESC']],
    })
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar logs: ' + err.message })
  }
})

export default router
