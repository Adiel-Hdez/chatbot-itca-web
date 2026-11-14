package com.example.demo.controller;

import com.example.demo.dto.BotMessageRequest;
import com.example.demo.dto.BotMessageResponse;
import com.example.demo.model.WhatsAppLog;
import com.example.demo.repository.WhatsAppLogRepository;
import com.example.demo.service.BotResponseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bot")
public class BotWebhookController {

    private final BotResponseService botResponseService;
    private final WhatsAppLogRepository whatsAppLogRepository;

    public BotWebhookController(BotResponseService botResponseService,
                                WhatsAppLogRepository whatsAppLogRepository) {
        this.botResponseService = botResponseService;
        this.whatsAppLogRepository = whatsAppLogRepository;
    }

    @PostMapping("/message")
    public ResponseEntity<BotMessageResponse> receiveMessage(@RequestBody BotMessageRequest request) {
        BotMessageResponse response = botResponseService.processMessage(request.getMessage(), request.getFrom());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<WhatsAppLog>> getRecentLogs() {
        return ResponseEntity.ok(whatsAppLogRepository.findTop30ByOrderByCreatedAtDesc());
    }
}

