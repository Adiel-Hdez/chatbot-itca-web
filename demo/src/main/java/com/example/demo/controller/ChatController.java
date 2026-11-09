package com.example.demo.controller;

import com.example.demo.dto.ChatRequest;
import com.example.demo.dto.ChatResponse;
import com.example.demo.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final GeminiService geminiService;

    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            String reply = geminiService.chat(request.getMessage(), request.getHistory());
            return ResponseEntity.ok(new ChatResponse(reply, true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    new ChatResponse("Lo siento, ocurrió un error. Por favor, intenta de nuevo.", false)
            );
        }
    }
}
