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
                    "• 🎓 *Carreras técnicas y pensums*\n" +
                    "• 💰 *Cuotas, aranceles y métodos de pago*\n" +
                    "• 📜 *Solicitud de becas y trámites de Registro Académico*\n\n" +
                    "¿En qué te puedo orientar hoy?";

            saveLog(senderId, userMessage, greetingReply, "GREETING");
            return new BotMessageResponse(true, greetingReply, null, "GREETING");
        }

        List<Faq> activeFaqs = faqRepository.findByActivoTrue();

        // 2. Búsqueda de coincidencia directa en FAQs activas
        Faq bestMatch = null;
        int maxScore = 0;

        for (Faq faq : activeFaqs) {
            int score = calculateMatchScore(normalizedMsg, faq);
            if (score > maxScore) {
                maxScore = score;
                bestMatch = faq;
            }
        }

        // Si hay una coincidencia fuerte (score alto)
        if (bestMatch != null && maxScore >= 4) {
            String directReply = bestMatch.getRespuesta();
            saveLog(senderId, userMessage, directReply, "DIRECT_FAQ");
            return new BotMessageResponse(true, directReply, bestMatch.getId(), "DIRECT_FAQ");
        }

        // 3. Procesamiento inteligente con Gemini RAG utilizando las FAQs de la BD
        String ragReply = generateRagResponse(userMessage, activeFaqs);
        saveLog(senderId, userMessage, ragReply, "AI_RAG");
        return new BotMessageResponse(true, ragReply, bestMatch != null ? bestMatch.getId() : null, "AI_RAG");
    }

    private int calculateMatchScore(String normalizedMsg, Faq faq) {
        int score = 0;
        String normalizedPregunta = normalize(faq.getPregunta());

        if (normalizedMsg.contains(normalizedPregunta) || normalizedPregunta.contains(normalizedMsg)) {
            score += 5;
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

    private String generateRagResponse(String userMessage, List<Faq> activeFaqs) {
        StringBuilder knowledgeBase = new StringBuilder();
        for (Faq faq : activeFaqs) {
            knowledgeBase.append("--- CATEGORÍA: ").append(faq.getCategoria()).append(" ---\n");
            knowledgeBase.append("PREGUNTA: ").append(faq.getPregunta()).append("\n");
            knowledgeBase.append("RESPUESTA OFICIAL: ").append(faq.getRespuesta()).append("\n\n");
        }

        String systemPrompt = """
                Eres el Asistente Virtual oficial para WhatsApp de ITCA-FEPADE, Centro Regional Santa Ana, El Salvador.
                Respondes siempre en español con un tono institucional, claro, empático y adaptado para WhatsApp (puedes usar negritas con *asteriscos* y emojis adecuados).

                A continuación tienes la BASE DE CONOCIMIENTO OFICIAL de la institución administrada desde el panel web:
                """
                + knowledgeBase +
                """
                REGLAS OBLIGATORIAS:
                1. Basa tu respuesta estrictamente en la base de conocimiento oficial anterior.
                2. Conserva los enlaces oficiales, números de WhatsApp y correos electrónicos tal como aparecen en las respuestas oficiales.
                3. Si el usuario pregunta por carreras que no se imparten en Santa Ana (como Gastronomía, Mecatrónica, Mecánica, Civil, Arquitectura, Automotriz, etc.), indícale amablemente que no se imparten en Santa Ana y dale los medios de contacto de Santa Tecla u otra sede indicados en la base de conocimiento.
                4. Recuerda que en Santa Ana el proceso de nuevo ingreso es anual únicamente para el Ciclo I (no hay nuevo ingreso para el Ciclo II).
                5. Si la pregunta es ajena a la institución (fútbol, chistes, tareas generales, política), aclara amablemente que solo estás disponible para brindar orientación sobre ITCA-FEPADE Centro Regional Santa Ana.
                6. Mantén las respuestas legibles y directas para lectura en celular.
                """;

        return geminiService.generateWithCustomSystemPrompt(userMessage, systemPrompt);
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
