import { Faq, WhatsAppLog } from '../models/index.js'

function normalize(input) {
  if (!input) return ''
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function isOnlyGreeting(msg) {
  return /^(hola|buenas|buenos dias|buenas tardes|buenas noches|que tal|hey|hi|saludos|buen dia)[!?. ]*$/i.test(
    msg
  )
}

function isOffTopic(msg) {
  return /\b(futbol|soccer|messi|cr7|chiste|broma|cancion|musica|politica|presidente|elecciones|bitcoin|cripto|receta de cocina|cuentame un cuento)\b/i.test(
    msg
  )
}

function checkInvalidCareerOrSchedule(normalizedMsg) {
  const mentionsNocturna =
    normalizedMsg.includes('nocturn') ||
    normalizedMsg.includes('noche') ||
    normalizedMsg.includes('turno de noche')

  const otherCampusCareer =
    normalizedMsg.includes('gastronomia') ||
    normalizedMsg.includes('mecatronica') ||
    normalizedMsg.includes('automotriz') ||
    normalizedMsg.includes('mecanica') ||
    normalizedMsg.includes('civil') ||
    normalizedMsg.includes('arquitectura') ||
    normalizedMsg.includes('logistica') ||
    normalizedMsg.includes('alimentos')

  const nonexistentCareer =
    normalizedMsg.includes('aeroespacial') ||
    normalizedMsg.includes('medicina') ||
    normalizedMsg.includes('enfermeria') ||
    normalizedMsg.includes('psicologia') ||
    normalizedMsg.includes('derecho') ||
    normalizedMsg.includes('criminologia') ||
    normalizedMsg.includes('agronomia') ||
    normalizedMsg.includes('veterinaria') ||
    normalizedMsg.includes('odontologia') ||
    normalizedMsg.includes('periodismo') ||
    normalizedMsg.includes('idiomas')

  if (otherCampusCareer) {
    return (
      'Esa carrera no la impartimos en *ITCA Centro Regional Santa Ana* (se imparte en *ITCA Santa Tecla*).\n\n' +
      '📍 *Contactos de ITCA Sede Central Santa Tecla:*\n' +
      '• 🌐 Enlace informativo: https://www.itca.edu.sv\n' +
      '• 📱 WhatsApp de atención: 7986-5389 / 7871-2484\n' +
      '• ☎️ Teléfono: 2132-7400\n\n' +
      'En Santa Ana únicamente contamos con 3 carreras técnicas: *Desarrollo de Software*, *Ingeniería Eléctrica* y *Hardware Computacional*.'
    )
  }

  if (nonexistentCareer) {
    let reply =
      '¡Hola! Te informamos que en *ITCA-FEPADE Centro Regional Santa Ana* ÚNICAMENTE contamos con *3 carreras técnicas* de 2 años de duración:\n\n' +
      '1️⃣ 💻 *Técnico en Ingeniería de Desarrollo de Software*\n' +
      '2️⃣ ⚡ *Técnico en Ingeniería Eléctrica*\n' +
      '3️⃣ 🖥️ *Técnico en Hardware Computacional*\n\n' +
      '⚠️ *Aclaración importante:*\n' +
      '• En la sede de Santa Ana *NO* se imparte esa carrera (ni ingenierías de 5 años o licenciaturas).\n'

    if (mentionsNocturna) {
      reply +=
        '• Tampoco contamos con *jornada nocturna* (nuestras jornadas son únicamente Diurna y Semipresencial para personas que trabajan).\n'
    }

    reply +=
      '• Por lo tanto, no aplica proceso de inscripción, examen ni matrícula para esa especialidad en Santa Ana.\n\n' +
      'Si te interesa inscribirte en alguna de nuestras 3 carreras técnicas oficiales, con gusto te comparto los requisitos y aranceles. 😊'

    return reply
  }

  if (
    mentionsNocturna &&
    (normalizedMsg.includes('jornada') ||
      normalizedMsg.includes('horario') ||
      normalizedMsg.includes('clases') ||
      normalizedMsg.includes('turno'))
  ) {
    return (
      'En *ITCA-FEPADE Centro Regional Santa Ana* no contamos con jornada nocturna.\n\n' +
      'Nuestras jornadas oficiales son:\n' +
      '☀️ *Jornada Diurna:* Lunes a viernes de 7:00 a.m. a 5:00 p.m.\n' +
      '💼 *Jornada Semipresencial (para personas que trabajan):*\n' +
      '• Lunes a viernes de 5:00 a 8:20 p.m. (clases virtuales)\n' +
      '• Sábado de 1:00 a 4:00 p.m. o Domingo de 7:00 a.m. a 4:00 p.m. (prácticas presenciales en talleres).'
    )
  }

  return null
}

function calculateMatchScore(normalizedMsg, faq) {
  let score = 0
  const normalizedPregunta = normalize(faq.pregunta)

  if (normalizedMsg === normalizedPregunta) return 10

  if (normalizedMsg.includes(normalizedPregunta) || normalizedPregunta.includes(normalizedMsg)) {
    score += 6
  }

  if (faq.palabrasClave) {
    const keywords = faq.palabrasClave.split(',')
    for (const kw of keywords) {
      const cleanKw = normalize(kw.trim())
      if (cleanKw && normalizedMsg.includes(cleanKw)) {
        score += 2
      }
    }
  }

  return score
}

async function callGemini(userMessage, activeFaqs) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const knowledgeBase = activeFaqs
    .map(
      (f) =>
        `--- CATEGORÍA: ${f.categoria} ---\nPREGUNTA: ${f.pregunta}\nRESPUESTA OFICIAL: ${f.respuesta}\n`
    )
    .join('\n')

  const systemPrompt = `
Eres el Asistente Virtual oficial para WhatsApp de ITCA-FEPADE, Centro Regional Santa Ana, El Salvador.
Respondes siempre en español con un tono institucional, claro, empático y adaptado para WhatsApp (puedes usar negritas con *asteriscos* y emojis adecuados).

==================================================
REGLAS OBLIGATORIAS DE ITCA SANTA ANA (¡NUNCA LAS VIOLES!):
==================================================
1. ÚNICAMENTE 3 CARRERAS TÉCNICAS EN SANTA ANA:
   • 💻 *Técnico en Ingeniería de Desarrollo de Software*
   • ⚡ *Técnico en Ingeniería Eléctrica*
   • 🖥️ *Técnico en Hardware Computacional*
   - NO se imparten ingenierías completas ni licenciaturas en la sede de Santa Ana.
   - NO se imparten carreras como Aeroespacial, Mecatrónica, Gastronomía, Automotriz, Civil, Medicina, etc.
   - Si el usuario pregunta por cualquier otra carrera, aclara que en Santa Ana NO se imparten e informa cuáles son las 3 disponibles.

2. PREGUNTAS CON PREMISAS FALSAS O CARRERAS INEXISTENTES:
   Si el usuario pregunta por costos, requisitos, matrícula o inscripción para una carrera inexistente (como "Ingeniería Aeroespacial"):
   ¡PROHIBIDO responder con los aranceles o dar costos como si existiera! Primero aclara que no existe esa carrera en Santa Ana.

3. JORNADAS Y HORARIOS EN SANTA ANA:
   - Solo dos jornadas: Diurna (lunes a viernes de 7:00 a.m. a 5:00 p.m.) y Semipresencial (virtual entre semana y presencial fin de semana).
   - NO existe jornada nocturna.

4. INGRESO ANUAL AL CICLO I:
   - El nuevo ingreso en Santa Ana es anual únicamente para el Ciclo I (no hay ingreso para el Ciclo II).

5. BASE DE CONOCIMIENTO OFICIAL DE LA INSTITUCIÓN:
${knowledgeBase}
`

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash']

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1024,
          },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text && text.trim()) return text.trim()
      }
    } catch {
      // Intentar con siguiente modelo o fallback
    }
  }

  return null
}

function fallbackSemanticSearch(normalizedMsg, activeFaqs) {
  let best = null
  let max = 0
  for (const f of activeFaqs) {
    const score = calculateMatchScore(normalizedMsg, f)
    if (score > max) {
      max = score
      best = f
    }
  }

  if (best && max >= 2) {
    return best.respuesta
  }

  return (
    '¡Hola! En *ITCA-FEPADE Centro Regional Santa Ana* con gusto te apoyamos. ' +
    'Actualmente ofrecemos 3 carreras técnicas (Desarrollo de Software, Ingeniería Eléctrica y Hardware Computacional). ' +
    'Puedes consultarnos sobre nuevo ingreso, aranceles, jornadas o becas. ¿En qué te orientamos?'
  )
}

async function saveLog(remitente, mensajeUsuario, respuestaEnviada, coincidenciaTipo) {
  try {
    await WhatsAppLog.create({
      remitente,
      mensajeUsuario,
      respuestaEnviada,
      coincidenciaTipo,
    })
  } catch (err) {
    console.error('Error al guardar log de WhatsApp:', err.message)
  }
}

export async function processMessage(rawMessage, sender) {
  if (!rawMessage || !rawMessage.trim()) {
    return {
      success: false,
      reply: 'Por favor envía tu consulta sobre ITCA Santa Ana.',
      matchedFaqId: null,
      matchType: 'EMPTY',
    }
  }

  const userMessage = rawMessage.trim()
  const normalizedMsg = normalize(userMessage)
  const senderId = sender && sender.trim() ? sender.trim() : 'web-simulator'

  // 1. Saludos rápidos
  if (isOnlyGreeting(normalizedMsg)) {
    const greetingReply =
      '¡Hola! 👋 Te saluda el Asistente Virtual oficial de *ITCA-FEPADE Centro Regional Santa Ana*.\n\n' +
      'Estoy listo para apoyarte con información sobre:\n' +
      '• 📝 *Proceso de nuevo ingreso y requisitos*\n' +
      '• 🎓 *Carreras técnicas y pensums (3 carreras disponibles)*\n' +
      '• 💰 *Cuotas, aranceles y métodos de pago*\n' +
      '• 📜 *Solicitud de becas y trámites de Registro Académico*\n\n' +
      '¿En qué te puedo orientar hoy?'

    await saveLog(senderId, userMessage, greetingReply, 'GREETING')
    return { success: true, reply: greetingReply, matchedFaqId: null, matchType: 'GREETING' }
  }

  // 2. Off-topic
  if (isOffTopic(normalizedMsg)) {
    const offTopicReply =
      'Disculpa, como Asistente Virtual de *ITCA-FEPADE Centro Regional Santa Ana* únicamente puedo brindarte información y orientación institucional sobre nuestras carreras técnicas, proceso de admisión, aranceles y trámites académicos.\n\n' +
      '¿Tienes alguna consulta sobre nuestros estudios en Santa Ana?'
    await saveLog(senderId, userMessage, offTopicReply, 'OFF_TOPIC')
    return { success: true, reply: offTopicReply, matchedFaqId: null, matchType: 'OFF_TOPIC' }
  }

  // 3. Validación de carreras inexistentes o jornada nocturna
  const invalidCareerReply = checkInvalidCareerOrSchedule(normalizedMsg)
  if (invalidCareerReply) {
    await saveLog(senderId, userMessage, invalidCareerReply, 'CAREER_VALIDATION')
    return {
      success: true,
      reply: invalidCareerReply,
      matchedFaqId: null,
      matchType: 'CAREER_VALIDATION',
    }
  }

  // Obtener FAQs activas
  let activeFaqs = []
  try {
    activeFaqs = await Faq.findAll({ where: { activo: true } })
  } catch (err) {
    console.error('Error al consultar FAQs:', err.message)
  }

  // 4. Coincidencia directa para preguntas cortas (<= 8 palabras)
  const wordCount = normalizedMsg.split(/\s+/).length
  if (wordCount <= 8 && activeFaqs.length > 0) {
    let bestMatch = null
    let maxScore = 0

    for (const faq of activeFaqs) {
      const score = calculateMatchScore(normalizedMsg, faq)
      if (score > maxScore) {
        maxScore = score
        bestMatch = faq
      }
    }

    if (bestMatch && maxScore >= 6) {
      const directReply = bestMatch.respuesta
      await saveLog(senderId, userMessage, directReply, 'DIRECT_FAQ')
      return {
        success: true,
        reply: directReply,
        matchedFaqId: bestMatch.id,
        matchType: 'DIRECT_FAQ',
      }
    }
  }

  // 5. Gemini RAG o Semantic Fallback
  let reply = await callGemini(userMessage, activeFaqs)
  let matchType = 'AI_RAG'

  if (!reply) {
    reply = fallbackSemanticSearch(normalizedMsg, activeFaqs)
    matchType = 'SEMANTIC_FAQ'
  }

  await saveLog(senderId, userMessage, reply, matchType)
  return { success: true, reply, matchedFaqId: null, matchType }
}
