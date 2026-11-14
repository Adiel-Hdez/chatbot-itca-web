import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import express from 'express'
import cors from 'cors'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/bot/message'
const PORT = process.env.PORT || 3001

const app = express()
app.use(cors())
app.use(express.json())

let isConnected = false
let latestQr = null

app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    hasQr: latestQr !== null,
  })
})

app.get('/qr', (req, res) => {
  res.json({ qr: latestQr })
})

app.listen(PORT, () => {
  console.log(`\n======================================================`)
  console.log(`🤖 Conector de WhatsApp ITCA Santa Ana activo en puerto ${PORT}`)
  console.log(`🔗 Backend conectado a: ${BACKEND_API_URL}`)
  console.log(`======================================================\n`)
})

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    generateHighQualityLinkPreview: true,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      latestQr = qr
      console.log('\n📱 ==============================================================')
      console.log('📱 ESCANEA ESTE CÓDIGO QR CON WHATSAPP EN TU TELÉFONO:')
      console.log('📱 (Abre WhatsApp > Dispositivos vinculados > Vincular dispositivo)')
      console.log('📱 ==============================================================\n')
      qrcode.generate(qr, { small: true })
      console.log('\nEsperando escaneo de QR...\n')
    }

    if (connection === 'close') {
      isConnected = false
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(
        '⚠️ Conexión de WhatsApp cerrada debido a:',
        lastDisconnect?.error?.message || 'Desconexión',
        '. Reconectando:',
        shouldReconnect
      )
      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 3000)
      } else {
        console.log('❌ Sesión cerrada permanentemente. Elimina auth_info_baileys para volver a escanear.')
      }
    } else if (connection === 'open') {
      isConnected = true
      latestQr = null
      console.log('\n🎉 ==============================================================')
      console.log('🎉 ¡WHATSAPP CONECTADO CON ÉXITO A ITCA SANTA ANA!')
      console.log('🎉 El bot responderá en tiempo real según las FAQs de Spring Boot.')
      console.log('🎉 ==============================================================\n')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      // Ignorar mensajes enviados por el bot mismo
      if (msg.key.fromMe) continue

      const remoteJid = msg.key.remoteJid
      // Ignorar grupos y estados de WhatsApp
      if (!remoteJid || remoteJid.endsWith('@g.us') || remoteJid === 'status@broadcast') continue

      // Extraer texto del mensaje
      const messageText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        ''

      if (!messageText.trim()) continue

      const senderNumber = remoteJid.replace('@s.whatsapp.net', '')
      console.log(`\n📩 Mensaje recibido de [${senderNumber}]: "${messageText}"`)

      try {
        // Enviar al Backend Spring Boot
        const response = await fetch(BACKEND_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            message: messageText,
            from: senderNumber,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP Error en backend: ${response.status}`)
        }

        const data = await response.json()
        const replyText = data.reply || 'Disculpa, no pude procesar tu solicitud.'

        // Enviar respuesta por WhatsApp
        await sock.sendMessage(remoteJid, { text: replyText }, { quoted: msg })
        console.log(`📤 Respuesta enviada a [${senderNumber}] (${data.matchType || 'BOT'})`)
      } catch (err) {
        console.error(`❌ Error al procesar mensaje de [${senderNumber}]:`, err.message)
        await sock.sendMessage(
          remoteJid,
          {
            text: '¡Hola! En este momento estamos actualizando nuestro sistema institucional. Por favor intenta en unos minutos.',
          },
          { quoted: msg }
        )
      }
    }
  })
}

connectToWhatsApp()

