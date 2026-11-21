import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runInit() {
  const sqlPath = path.resolve(__dirname, '../../database/supabase_init.sql')
  console.log('📖 Leyendo script SQL desde:', sqlPath)
  const sql = fs.readFileSync(sqlPath, 'utf8')

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('🔄 Conectando a Supabase PostgreSQL...')
    await client.connect()
    console.log('✅ Conectado a Supabase.')

    console.log('⚙️ Ejecutando script SQL para crear tablas e insertar las 29 FAQs...')
    await client.query(sql)
    console.log('🎉 ¡Tablas creadas y 29 preguntas y respuestas cargadas exitosamente!')

    // Verificar cantidad de FAQs
    const res = await client.query('SELECT COUNT(*) FROM faqs;')
    console.log(`📊 Total de FAQs en Supabase: ${res.rows[0].count}`)

    const adminRes = await client.query('SELECT correo, nombre, rol FROM admins;')
    console.log('👤 Administradores en Supabase:', adminRes.rows)

    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('❌ Error ejecutando script SQL en Supabase:', err.message)
    process.exit(1)
  }
}

runInit()
