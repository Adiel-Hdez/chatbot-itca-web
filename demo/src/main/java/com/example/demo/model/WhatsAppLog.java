package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "whatsapp_logs")
public class WhatsAppLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String remitente;

    @Column(name = "mensaje_usuario", nullable = false, columnDefinition = "TEXT")
    private String mensajeUsuario;

    @Column(name = "respuesta_enviada", nullable = false, columnDefinition = "TEXT")
    private String respuestaEnviada;

    @Column(name = "coincidencia_tipo", length = 50)
    private String coincidenciaTipo;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public WhatsAppLog() {
    }

    public WhatsAppLog(String remitente, String mensajeUsuario, String respuestaEnviada, String coincidenciaTipo) {
        this.remitente = remitente;
        this.mensajeUsuario = mensajeUsuario;
        this.respuestaEnviada = respuestaEnviada;
        this.coincidenciaTipo = coincidenciaTipo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRemitente() {
        return remitente;
    }

    public void setRemitente(String remitente) {
        this.remitente = remitente;
    }

    public String getMensajeUsuario() {
        return mensajeUsuario;
    }

    public void setMensajeUsuario(String mensajeUsuario) {
        this.mensajeUsuario = mensajeUsuario;
    }

    public String getRespuestaEnviada() {
        return respuestaEnviada;
    }

    public void setRespuestaEnviada(String respuestaEnviada) {
        this.respuestaEnviada = respuestaEnviada;
    }

    public String getCoincidenciaTipo() {
        return coincidenciaTipo;
    }

    public void setCoincidenciaTipo(String coincidenciaTipo) {
        this.coincidenciaTipo = coincidenciaTipo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

