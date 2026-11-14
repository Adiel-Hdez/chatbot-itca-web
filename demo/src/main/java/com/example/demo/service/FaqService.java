package com.example.demo.service;

import com.example.demo.dto.DashboardStatsResponse;
import com.example.demo.dto.FaqRequest;
import com.example.demo.model.Faq;
import com.example.demo.repository.FaqRepository;
import com.example.demo.repository.WhatsAppLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FaqService {

    private final FaqRepository faqRepository;
    private final WhatsAppLogRepository whatsAppLogRepository;

    public FaqService(FaqRepository faqRepository, WhatsAppLogRepository whatsAppLogRepository) {
        this.faqRepository = faqRepository;
        this.whatsAppLogRepository = whatsAppLogRepository;
    }

    public List<Faq> getAllFaqs() {
        return faqRepository.findAll();
    }

    public List<Faq> getActiveFaqs() {
        return faqRepository.findByActivoTrue();
    }

    public Optional<Faq> getFaqById(Long id) {
        return faqRepository.findById(id);
    }

    public List<Faq> searchFaqs(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllFaqs();
        }
        return faqRepository.searchFaqs(query.trim());
    }

    public List<Faq> getFaqsByCategoria(String categoria) {
        return faqRepository.findByCategoriaIgnoreCase(categoria.trim());
    }

    public Faq createFaq(FaqRequest request) {
        Faq faq = new Faq();
        faq.setCategoria(request.getCategoria().trim());
        faq.setPregunta(request.getPregunta().trim());
        faq.setPalabrasClave(request.getPalabrasClave().trim());
        faq.setRespuesta(request.getRespuesta().trim());
        faq.setActivo(request.getActivo() != null ? request.getActivo() : true);
        return faqRepository.save(faq);
    }

    public Optional<Faq> updateFaq(Long id, FaqRequest request) {
        return faqRepository.findById(id).map(existing -> {
            if (request.getCategoria() != null) existing.setCategoria(request.getCategoria().trim());
            if (request.getPregunta() != null) existing.setPregunta(request.getPregunta().trim());
            if (request.getPalabrasClave() != null) existing.setPalabrasClave(request.getPalabrasClave().trim());
            if (request.getRespuesta() != null) existing.setRespuesta(request.getRespuesta().trim());
            if (request.getActivo() != null) existing.setActivo(request.getActivo());
            return faqRepository.save(existing);
        });
    }

    public Optional<Faq> toggleFaq(Long id) {
        return faqRepository.findById(id).map(existing -> {
            existing.setActivo(!Boolean.TRUE.equals(existing.getActivo()));
            return faqRepository.save(existing);
        });
    }

    public boolean deleteFaq(Long id) {
        if (faqRepository.existsById(id)) {
            faqRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public DashboardStatsResponse getStats() {
        long totalFaqs = faqRepository.count();
        long activeFaqs = faqRepository.findByActivoTrue().size();
        List<String> categories = faqRepository.findDistinctCategorias();
        long totalMessagesHandled = whatsAppLogRepository.count();

        return new DashboardStatsResponse(
                totalFaqs,
                activeFaqs,
                categories.size(),
                totalMessagesHandled,
                categories
        );
    }
}
