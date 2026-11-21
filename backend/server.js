import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize, Admin, Faq } from './models/index.js'
import faqRoutes from './routes/faqRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import botRoutes from './routes/botRoutes.js'

dotenv.config()

export const app = express()
const PORT = process.env.PORT || 8080

// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.use(express.json())

// Health check
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'ITCA Santa Ana ChatBot Backend (Sequelize + Supabase)',
    time: new Date().toISOString(),
  })
})

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'ITCA Santa Ana ChatBot Backend (Sequelize + Supabase)',
    time: new Date().toISOString(),
  })
})

// Rutas de la API (soporta tanto /api/ruta como /ruta en funciones serverless)
app.use(['/api/faqs', '/faqs'], faqRoutes)
app.use(['/api/admin', '/admin'], adminRoutes)
app.use(['/api/bot', '/bot'], botRoutes)

// Inicialización de la base de datos y arranque del servidor
export async function initServer() {
  try {
    if (process.env.DATABASE_URL) {
      console.log('🔄 Conectando a Supabase PostgreSQL con Sequelize...')
      await sequelize.authenticate()
      console.log('✅ Conexión a Supabase PostgreSQL establecida exitosamente.')

      // Sincronizar modelos (crea tablas si no existen)
      await sequelize.sync({ alter: false })
      console.log('✅ Modelos de Sequelize sincronizados con la base de datos.')

      // Verificar / Sembrar usuario admin si no existe
      const adminCount = await Admin.count()
      if (adminCount === 0) {
        await Admin.create({
          nombre: 'Administrador ITCA',
          correo: 'admin@itca.edu.sv',
          password: 'itca',
          rol: 'ADMIN',
        })
        console.log('👤 Usuario admin por defecto creado (admin@itca.edu.sv / itca)')
      }
    } else {
      console.warn(
        '⚠️ AVISO: No se ha configurado DATABASE_URL en el archivo .env. Configúralo con la clave de Supabase.'
      )
    }
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message)
  }

  return app
}

// Iniciar servidor local
if (process.env.NETLIFY !== 'true') {
  initServer().then(() => {
    app.listen(PORT, () => {
      console.log(`\n======================================================`)
      console.log(`🚀 Servidor ITCA Backend activo en http://localhost:${PORT}`)
      console.log(`📡 Endpoints disponibles en /api/faqs, /api/admin, /api/bot`)
      console.log(`======================================================\n`)
    })
  })
}

export default app
