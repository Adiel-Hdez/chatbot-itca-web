package com.example.demo.service;

import com.example.demo.dto.BotMessageResponse;
import com.example.demo.model.Faq;
import com.example.demo.model.WhatsAppLog;
import com.example.demo.repository.FaqRepository;
import com.example.demo.repository.WhatsAppLogRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class BotResponseService {

    private final FaqRepository faqRepository;
    private final WhatsAppLogRepository whatsAppLogRepository;
    private final GeminiService geminiService;

    public BotResponseService(FaqRepository faqRepository,
                              WhatsAppLogRepository whatsAppLogRepository,
                              GeminiService geminiService) {
        this.faqRepository = faqRepository;
        this.whatsAppLogRepository = whatsAppLogRepository;
        this.geminiService = geminiService;
    }

    public BotMessageResponse processMessage(String rawMessage, String sender) {
        if (rawMessage == null || rawMessage.trim().isEmpty()) {
            return new BotMessageResponse(false, "Por favor envía tu consulta sobre ITCA Santa Ana.", null, "EMPTY");
        }

        String userMessage = rawMessage.trim();
        String normalizedMsg = normalize(userMessage);
        String senderId = (sender != null && !sender.isBlank()) ? sender : "web-simulator";

        // 1. Manejo de saludos rápidos
        if (isOnlyGreeting(normalizedMsg)) {
            String greetingReply = "¡Hola! 👋 Te saluda el Asistente Virtual oficial de *ITCA-FEPADE Centro Regional Santa Ana*.\n\n" +
                    "Estoy listo para apoyarte con información sobre:\n" +
                    "• 📝 *Proceso de nuevo ingreso y requisitos*\n" +
                    "• 🎓 *Carreras técnicas y pensums (3 carreras disponibles)*\n" +
                    "• 💰 *Cuotas, aranceles y métodos de pago*\n" +
                    "• 📜 *Solicitud de becas y trámites de Registro Académico*\n\n" +
                    "¿En qué te puedo orientar hoy?";

            saveLog(senderId, userMessage, greetingReply, "GREETING");
            return new BotMessageResponse(true, greetingReply, null, "GREETING");
        }

        // 2. Validación de temas ajenos a la institución (fútbol, chistes, etc.)
        if (isOffTopic(normalizedMsg)) {
            String offTopicReply = "Disculpa, como Asistente Virtual de *ITCA-FEPADE Centro Regional Santa Ana* únicamente puedo brindarte información y orientación institucional sobre nuestras carreras técnicas, proceso de admisión, aranceles y trámites académicos.\n\n" +
                    "¿Tienes alguna consulta sobre nuestros estudios en Santa Ana?";
            saveLog(senderId, userMessage, offTopicReply, "OFF_TOPIC");
            return new BotMessageResponse(true, offTopicReply, null, "OFF_TOPIC");
        }

        // 3. Validación estricta de carreras inexistentes o jornadas falsas en Santa Ana
        String invalidCareerReply = checkInvalidCareerOrSchedule(normalizedMsg, userMessage);
        if (invalidCareerReply != null) {
            saveLog(senderId, userMessage, invalidCareerReply, "CAREER_VALIDATION");
            return new BotMessageResponse(true, invalidCareerReply, null, "CAREER_VALIDATION");
        }

        List<Faq> activeFaqs = faqRepository.findByActivoTrue();

        // 4. Búsqueda de coincidencia directa SOLO para preguntas cortas y específicas
        // (Evita que preguntas complejas o con premisas falsas sean secuestradas por palabras clave sueltas)
        int wordCount = normalizedMsg.split("\\s+").length;
        if (wordCount <= 8) {
            Faq bestMatch = null;
            int maxScore = 0;

            for (Faq faq : activeFaqs) {
                int score = calculateMatchScore(normalizedMsg, faq);
                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = faq;
                }
            }

            // Solo si hay coincidencia directa de la pregunta o palabras clave con alta certeza
            if (bestMatch != null && maxScore >= 6) {
                String directReply = bestMatch.getRespuesta();
                saveLog(senderId, userMessage, directReply, "DIRECT_FAQ");
                return new BotMessageResponse(true, directReply, bestMatch.getId(), "DIRECT_FAQ");
            }
        }

        // 5. Procesamiento contextual con Gemini RAG o fallback semántico enriquecido
        String ragReply = generateRagResponse(userMessage, activeFaqs, normalizedMsg);
        saveLog(senderId, userMessage, ragReply, "AI_RAG");
        return new BotMessageResponse(true, ragReply, null, "AI_RAG");
    }

    /**
     * Valida si el usuario pregunta por carreras que no existen en Santa Ana,
     * carreras de otra sede, o jornadas inexistentes (como nocturna).
     */
    private String checkInvalidCareerOrSchedule(String normalizedMsg, String originalMsg) {
        boolean mentionsNocturna = normalizedMsg.contains("nocturn") || normalizedMsg.contains("noche") || normalizedMsg.contains("turno de noche");
        
        // Carreras de otra sede (Santa Tecla u otras)
        boolean otherCampusCareer = normalizedMsg.contains("gastronomia") ||
                normalizedMsg.contains("mecatronica") ||
                normalizedMsg.contains("automotriz") ||
                normalizedMsg.contains("mecanica") ||
                normalizedMsg.contains("civil") ||
                normalizedMsg.contains("arquitectura") ||
                normalizedMsg.contains("logistica") ||
                normalizedMsg.contains("alimentos");

        // Carreras inexistentes en ITCA Santa Ana
        boolean nonexistentCareer = normalizedMsg.contains("aeroespacial") ||
                normalizedMsg.contains("medicina") ||
                normalizedMsg.contains("enfermeria") ||
                normalizedMsg.contains("psicologia") ||
                normalizedMsg.contains("derecho") ||
                normalizedMsg.contains("criminologia") ||
                normalizedMsg.contains("agronomia") ||
                normalizedMsg.contains("veterinaria") ||
                normalizedMsg.contains("odontologia") ||
                normalizedMsg.contains("periodismo") ||
                normalizedMsg.contains("idiomas");

        // Si pregunta por una carrera de otra sede
        if (otherCampusCareer) {
            return "Esa carrera no la impartimos en *ITCA Centro Regional Santa Ana* (se imparte en *ITCA Santa Tecla*).\n\n" +
                    "📍 *Contactos de ITCA Sede Central Santa Tecla:*\n" +
                    "• 🌐 Enlace informativo: https://www.itca.edu.sv\n" +
                    "• 📱 WhatsApp de atención: 7986-5389 / 7871-2484\n" +
                    "• ☎️ Teléfono: 2132-7400\n\n" +
                    "En Santa Ana únicamente contamos con 3 carreras técnicas: *Desarrollo de Software*, *Ingeniería Eléctrica* y *Hardware Computacional*.";
        }

        // Si pregunta por una carrera inexistente o ingeniería aeroespacial
        if (nonexistentCareer) {
            StringBuilder reply = new StringBuilder();
            reply.append("¡Hola! Te informamos que en *ITCA-FEPADE Centro Regional Santa Ana* ÚNICAMENTE contamos con *3 carreras técnicas* de 2 años de duración:\n\n");
            reply.append("1️⃣ 💻 *Técnico en Ingeniería de Desarrollo de Software*\n");
            reply.append("2️⃣ ⚡ *Técnico en Ingeniería Eléctrica*\n");
            reply.append("3️⃣ 🖥️ *Técnico en Hardware Computacional*\n\n");
            reply.append("⚠️ *Aclaración importante:*\n");
            reply.append("• En la sede de Santa Ana *NO* se imparte esa carrera (ni ingenierías de 5 años o licenciaturas).\n");

            if (mentionsNocturna) {
                reply.append("• Tampoco contamos con *jornada nocturna* (nuestras jornadas son únicamente Diurna y Semipresencial para personas que trabajan).\n");
            }

            reply.append("• Por lo tanto, no aplica proceso de inscripción, examen ni matrícula para esa especialidad en Santa Ana.\n\n");
            reply.append("Si te interesa inscribirte en alguna de nuestras 3 carreras técnicas oficiales, con gusto te comparto los requisitos y aranceles. 😊");
            return reply.toString();
        }

        // Si pregunta únicamente por jornada nocturna sin carrera
        if (mentionsNocturna && (normalizedMsg.contains("jornada") || normalizedMsg.contains("horario") || normalizedMsg.contains("clases") || normalizedMsg.contains("turno"))) {
            return "En *ITCA-FEPADE Centro Regional Santa Ana* no contamos con jornada nocturna.\n\n" +
                    "Nuestras jornadas oficiales son:\n" +
                    "☀️ *Jornada Diurna:* Lunes a viernes de 7:00 a.m. a 5:00 p.m.\n" +
                    "💼 *Jornada Semipresencial (para personas que trabajan):*\n" +
                    "• Lunes a viernes de 5:00 a 8:20 p.m. (clases virtuales)\n" +
                    "• Sábado de 1:00 a 4:00 p.m. o Domingo de 7:00 a.m. a 4:00 p.m. (prácticas presenciales en talleres).";
        }

        return null;
    }

    private boolean isOffTopic(String msg) {
        return msg.matches(".*\\b(futbol|soccer|messi|cr7|chiste|broma|cancion|musica|politica|presidente|elecciones|bitcoin|cripto|receta de cocina|cuentame un cuento)\\b.*");
    }

    private int calculateMatchScore(String normalizedMsg, Faq faq) {
        int score = 0;
        String normalizedPregunta = normalize(faq.getPregunta());

        // Coincidencia exacta o contenida en la pregunta
        if (normalizedMsg.equals(normalizedPregunta)) {
            return 10;
        }

        if (normalizedMsg.contains(normalizedPregunta) || normalizedPregunta.contains(normalizedMsg)) {
            score += 6;
        }

        if (faq.getPalabrasClave() != null) {
            String[] keywords = faq.getPalabrasClave().split(",");
            for (String kw : keywords) {
                String cleanKw = normalize(kw.trim());
                if (!cleanKw.isEmpty() && normalizedMsg.contains(cleanKw)) {
                    score += 2;
                }
            }
        }

        return score;
    }

    private String generateRagResponse(String userMessage, List<Faq> activeFaqs, String normalizedMsg) {
        StringBuilder knowledgeBase = new StringBuilder();
        for (Faq faq : activeFaqs) {
            knowledgeBase.append("--- CATEGORÍA: ").append(faq.getCategoria()).append(" ---\n");
            knowledgeBase.append("PREGUNTA: ").append(faq.getPregunta()).append("\n");
            knowledgeBase.append("RESPUESTA OFICIAL: ").append(faq.getRespuesta()).append("\n\n");
        }

        String systemPrompt = """
                Eres el Asistente Virtual oficial para WhatsApp de ITCA-FEPADE, Centro Regional Santa Ana, El Salvador.
                Respondes siempre en español con un tono institucional, claro, empático y adaptado para WhatsApp (puedes usar negritas con *asteriscos* y emojis adecuados).

                ==================================================
                REGLAS OBLIGATORIAS DE ITCA SANTA ANA (¡NUNCA LAS VIOLES!):
                ==================================================
                1. ÚNICAMENTE 3 CARRERAS TÉCNICAS EN SANTA ANA:
                   En el Centro Regional Santa Ana SOLO existen 3 carreras y todas son carreras TÉCNICAS de 2 años:
                   • 💻 *Técnico en Ingeniería de Desarrollo de Software*
                   • ⚡ *Técnico en Ingeniería Eléctrica*
                   • 🖥️ *Técnico en Hardware Computacional*
                   - NO se imparten ingenierías completas de 5 años ni licenciaturas en la sede de Santa Ana.
                   - NO se imparten carreras como Ingeniería Aeroespacial, Mecatrónica, Gastronomía, Automotriz, Civil, Medicina, etc.
                   - Si el usuario pregunta por cualquier otra carrera o por "ingenierías", aclara con amabilidad que en Santa Ana NO se imparten esas carreras e informa cuáles son las 3 únicas carreras disponibles.

                2. PREGUNTAS CON PREMISAS FALSAS O CARRERAS INEXISTENTES:
                   Si el usuario pregunta por costos, requisitos, matrícula, horarios o inscripción para una carrera que NO existe en Santa Ana (por ejemplo: "¿cuánto cuesta la matrícula para Ingeniería Aeroespacial?", "¿hay turno nocturno para aeroespacial?"):
                   ¡PROHIBIDO responder directamente con los aranceles o dar costos como si la carrera existiera!
                   Debes aclarar primero que dicha carrera NO existe ni se imparte en ITCA Santa Ana, e indicar que no aplica matrícula ni inscripción para la misma.

                3. JORNADAS Y HORARIOS EN SANTA ANA:
                   - Solo existen dos jornadas: Diurna (lunes a viernes de 7:00 a.m. a 5:00 p.m.) y Semipresencial (virtual entre semana y presencial fin de semana).
                   - NO existe jornada nocturna en Santa Ana.

                4. PROCESO DE INGRESO:
                   - El nuevo ingreso en Santa Ana es anual únicamente para el Ciclo I (no hay nuevo ingreso para el Ciclo II).

                5. TEMAS AJENOS A ITCA:
                   - Si preguntan sobre fútbol, política, bromas o temas externos, aclara amablemente que solo brindas orientación sobre ITCA Santa Ana.

                6. BASE DE CONOCIMIENTO OFICIAL DE LA INSTITUCIÓN:
                """
                + knowledgeBase;

        String geminiReply = geminiService.generateWithCustomSystemPrompt(userMessage, systemPrompt);

        // Si Gemini respondió correctamente
        if (geminiReply != null &&
                !geminiReply.isBlank() &&
                !geminiReply.contains("Ocurrió un inconveniente") &&
                !geminiReply.contains("Ocurrió un error")) {
            return geminiReply;
        }

        // Fallback semántico institucional inteligente si la API externa de IA no responde
        return fallbackSemanticSearch(normalizedMsg, activeFaqs);
    }

    private String fallbackSemanticSearch(String normalizedMsg, List<Faq> faqs) {
        // Buscar la FAQ con mayor afinidad
        Faq best = null;
        int max = 0;
        for (Faq f : faqs) {
            int score = calculateMatchScore(normalizedMsg, f);
            if (score > max) {
                max = score;
                best = f;
            }
        }

        if (best != null && max >= 2) {
            return best.getRespuesta();
        }

        return "¡Hola! En *ITCA-FEPADE Centro Regional Santa Ana* con gusto te apoyamos. " +
                "Actualmente ofrecemos 3 carreras técnicas (Desarrollo de Software, Ingeniería Eléctrica y Hardware Computacional). " +
                "Puedes consultarnos sobre nuevo ingreso, aranceles, jornadas o becas. ¿En qué te orientamos?";
    }

    private boolean isOnlyGreeting(String msg) {
        return msg.matches("^(hola|buenas|buenos dias|buenas tardes|buenas noches|que tal|hey|hi|saludos|buen dia)[!?. ]*$");
    }

    private String normalize(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase().trim();
    }

    private void saveLog(String sender, String userMsg, String reply, String matchType) {
        try {
            WhatsAppLog log = new WhatsAppLog(sender, userMsg, reply, matchType);
            whatsAppLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Error al guardar log de WhatsApp: " + e.getMessage());
        }
    }
}
