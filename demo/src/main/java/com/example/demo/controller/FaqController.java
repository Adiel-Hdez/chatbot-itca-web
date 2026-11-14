package com.example.demo.controller;

import com.example.demo.dto.DashboardStatsResponse;
import com.example.demo.dto.FaqRequest;
import com.example.demo.model.Faq;
import com.example.demo.service.FaqService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs")
public class FaqController {

    private final FaqService faqService;

    public FaqController(FaqService faqService) {
        this.faqService = faqService;
    }

    @GetMapping
    public ResponseEntity<List<Faq>> getAllFaqs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String categoria) {

        if (categoria != null && !categoria.trim().isEmpty()) {
            return ResponseEntity.ok(faqService.getFaqsByCategoria(categoria));
        }

        if (query != null && !query.trim().isEmpty()) {
            return ResponseEntity.ok(faqService.searchFaqs(query));
        }

        return ResponseEntity.ok(faqService.getAllFaqs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Faq> getFaqById(@PathVariable Long id) {
        return faqService.getFaqById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Faq> createFaq(@RequestBody FaqRequest request) {
        if (request.getPregunta() == null || request.getPregunta().trim().isEmpty() ||
                request.getRespuesta() == null || request.getRespuesta().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Faq created = faqService.createFaq(request);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Faq> updateFaq(@PathVariable Long id, @RequestBody FaqRequest request) {
        return faqService.updateFaq(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Faq> toggleFaq(@PathVariable Long id) {
        return faqService.toggleFaq(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaq(@PathVariable Long id) {
        if (faqService.deleteFaq(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(faqService.getStats());
    }
}

