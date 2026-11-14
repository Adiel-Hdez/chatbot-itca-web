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

    private static final String DEFAULT_SYSTEM_PROMPT = """
            Eres el asistente virtual de ITCA-FEPADE, Centro Regional Santa Ana, El Salvador. Hablas de forma natural, amigable y cercana, como un orientador estudiantil real. Respondes siempre en español.
            Si alguien te saluda o te dice "hola", "buenas", "qué tal", etc., responde con naturalidad y pregunta en qué puedes ayudar. Sé conversacional, no robótico.
            Solo puedes hablar sobre temas relacionados con ITCA-FEPADE Santa Ana. Si te preguntan cosas ajenas, redirige amablemente.
            """;

    public String chat(String userMessage, List<ChatRequest.ChatMessage> history) {
        return generate(userMessage, DEFAULT_SYSTEM_PROMPT, history);
    }

    public String generateWithCustomSystemPrompt(String userMessage, String customSystemPrompt) {
        return generate(userMessage, customSystemPrompt, null);
    }

    private String generate(String userMessage, String systemPromptText, List<ChatRequest.ChatMessage> history) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();

            // System instruction
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ObjectNode systemParts = objectMapper.createObjectNode();
            systemParts.put("text", systemPromptText != null ? systemPromptText : DEFAULT_SYSTEM_PROMPT);
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
            generationConfig.put("temperature", 0.6);
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
