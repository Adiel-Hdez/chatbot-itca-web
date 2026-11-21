import { Router } from 'express'
import { Admin } from '../models/index.js'

const router = Router()

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body

    if (!correo || !password) {
      return res.status(400).json({ success: false, message: 'Por favor ingresa correo y contraseña.' })
    }

    const admin = await Admin.findOne({
      where: {
        correo: correo.trim(),
        password: password.trim(),
      },
    })

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Correo o contraseña incorrectos.',
      })
    }

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      adminId: admin.id,
      nombre: admin.nombre,
      correo: admin.correo,
      rol: admin.rol,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error interno de autenticación: ' + err.message })
  }
})

export default router
