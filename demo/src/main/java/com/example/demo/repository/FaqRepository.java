package com.example.demo.repository;

import com.example.demo.model.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    List<Faq> findByActivoTrue();

    List<Faq> findByCategoriaIgnoreCase(String categoria);

    @Query("SELECT f FROM Faq f WHERE LOWER(f.pregunta) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(f.palabrasClave) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Faq> searchFaqs(@Param("query") String query);

    @Query("SELECT DISTINCT f.categoria FROM Faq f ORDER BY f.categoria ASC")
    List<String> findDistinctCategorias();
}
