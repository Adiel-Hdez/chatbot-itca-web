package com.example.demo.service;

import com.example.demo.dto.ChatRequest;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private static final String SYSTEM_PROMPT = """
            Eres el asistente virtual de ITCA-FEPADE, Centro Regional Santa Ana, El Salvador. Hablas de forma natural, amigable y cercana, como un orientador estudiantil real. Respondes siempre en español.

            Si alguien te saluda o te dice "hola", "buenas", "qué tal", etc., responde con naturalidad y pregunta en qué puedes ayudar. Sé conversacional, no robótico.

            IMPORTANTE - TEMAS PERMITIDOS:
            Solo puedes hablar sobre temas relacionados con ITCA-FEPADE Santa Ana: carreras, admisión, becas, pagos, trámites, horarios, vida estudiantil, etc.
            Si alguien te pregunta sobre fútbol, política, recetas de cocina, otros temas, o cualquier cosa que NO sea sobre ITCA Santa Ana, responde amablemente algo como: "¡Interesante tema! Pero yo solo puedo ayudarte con información sobre ITCA-FEPADE Santa Ana 😄 ¿Tienes alguna duda sobre carreras, admisión, becas o trámites?"

            CARRERAS TÉCNICAS (solo 3 en Santa Ana actualmente):
            1. Técnico en Ingeniería de Desarrollo de Software
            2. Técnico en Ingeniería Eléctrica
            3. Técnico en Hardware Computacional
            Son solo estas 3 carreras. No inventes ni agregues otras.

            DATOS QUE CONOCES:
            - Admisión y Nuevo Ingreso: El proceso de NUEVO INGRESO se realiza ÚNICAMENTE para el Ciclo I (que inicia en enero/febrero). En ITCA Santa Ana NO HAY NUEVO INGRESO para el Ciclo II (la admisión de nuevos estudiantes es anual, solo para Ciclo I). Si un aspirante pregunta si puede ingresar en el Ciclo II, aclárale con amabilidad que no hay nuevo ingreso para ese ciclo y que debe esperar la convocatoria para el Ciclo I (o consultar por cursos cortos/diplomados). Requisitos de nuevo ingreso: título de bachiller, partida de nacimiento, DUI o carné de minoridad, fotos y realizar el curso de admisión.
            - Ciclos académicos: Ciclo I inicia en enero/febrero (con nuevo ingreso y reingresos). Ciclo II inicia en julio/agosto (únicamente para reingresos y continuidad de estudiantes activos, NO para nuevos estudiantes).
            - Becas: FANTEL, MINED, institucionales. Se tramitan en paralelo al curso de admisión del Ciclo I, no hay que esperar. Recomendar revisar carpeta de Spam del correo.
            - Pagos: Matrícula por ciclo + cuotas mensuales. Si no se paga a tiempo hay mora y se bloquean trámites. Consultar en el Portal del Estudiante o en Colecturía.
            - Reingreso: Para estudiantes que ya cursaron materias anteriormente. Verificar solvencia en Tesorería y Biblioteca, luego solicitar en Registro Académico.
            - Cursos cortos: Hay diplomados pagados y cursos gratuitos/becados por convenios.
            - Contacto: WhatsApp 7854-1615, correo itca-santa-ana@itca.edu.sv
            - Dirección: Final 10a Av. Sur, Santa Ana.

            Si no sabes algo con certeza, dilo honestamente y sugiere contactar directamente a la institución por WhatsApp o presencialmente.

            No menciones cómo estás construido técnicamente. Mantén respuestas claras y no demasiado largas.
            """;

    public String chat(String userMessage, List<ChatRequest.ChatMessage> history) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();

            // System instruction
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ObjectNode systemParts = objectMapper.createObjectNode();
            systemParts.put("text", SYSTEM_PROMPT);
            ArrayNode systemPartsArray = objectMapper.createArrayNode();
            systemPartsArray.add(systemParts);
            systemInstruction.set("parts", systemPartsArray);
            requestBody.set("system_instruction", systemInstruction);

            // Contents (historial + mensaje nuevo)
            ArrayNode contents = objectMapper.createArrayNode();

            if (history != null) {
                for (ChatRequest.ChatMessage msg : history) {
                    if (msg.getRole() != null && msg.getText() != null) {
                        ObjectNode content = objectMapper.createObjectNode();
                        content.put("role", msg.getRole());
                        ObjectNode parts = objectMapper.createObjectNode();
                        parts.put("text", msg.getText());
                        ArrayNode partsArray = objectMapper.createArrayNode();
                        partsArray.add(parts);
                        content.set("parts", partsArray);
                        contents.add(content);
                    }
                }
            }

            // Mensaje actual del usuario
            ObjectNode userContent = objectMapper.createObjectNode();
            userContent.put("role", "user");
            ObjectNode userParts = objectMapper.createObjectNode();
            userParts.put("text", userMessage);
            ArrayNode userPartsArray = objectMapper.createArrayNode();
            userPartsArray.add(userParts);
            userContent.set("parts", userPartsArray);
            contents.add(userContent);

            requestBody.set("contents", contents);

            // Configuración de generación
            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("topP", 0.95);
            generationConfig.put("topK", 40);
            generationConfig.put("maxOutputTokens", 1024);
            requestBody.set("generationConfig", generationConfig);

            String requestPayload = objectMapper.writeValueAsString(requestBody);
            String[] modelsToTry = new String[] {
                    "gemini-3.1-flash-lite",
                    "gemini-3.6-flash"
            };

            for (String modelName : modelsToTry) {
                String targetUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
                try {
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(targetUrl))
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(requestPayload))
                            .build();

                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                    if (response.statusCode() == 200) {
                        JsonNode responseBody = objectMapper.readTree(response.body());
                        JsonNode candidatePart = responseBody
                                .path("candidates")
                                .path(0)
                                .path("content")
                                .path("parts")
                                .path(0)
                                .path("text");

                        String replyText = candidatePart.asText();
                        if (replyText != null && !replyText.isBlank()) {
                            return replyText;
                        }
                    } else {
                        System.err.println("Modelo " + modelName + " devolvió HTTP " + response.statusCode() + ": " + response.body() + ". Probando siguiente modelo de respaldo...");
                    }
                } catch (Exception ex) {
                    System.err.println("Error temporal con modelo " + modelName + ": " + ex.getMessage() + ". Probando siguiente modelo...");
                }
            }

            return "Ocurrió un inconveniente al consultar con el servicio institucional. Por favor, intenta de nuevo en unos momentos.";
        } catch (Exception e) {
            System.err.println("Excepción en GeminiService: " + e.getMessage());
            e.printStackTrace();
            return "Ocurrió un error técnico en el servicio. Por favor, intenta más tarde o consulta con soporte de ITCA Santa Ana.";
        }
    }
}
