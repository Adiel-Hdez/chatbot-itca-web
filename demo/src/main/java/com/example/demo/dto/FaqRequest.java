package com.example.demo.dto;

public class FaqRequest {

    private String categoria;
    private String pregunta;
    private String palabrasClave;
    private String respuesta;
    private Boolean activo;

    public FaqRequest() {
    }

    public FaqRequest(String categoria, String pregunta, String palabrasClave, String respuesta, Boolean activo) {
        this.categoria = categoria;
        this.pregunta = pregunta;
        this.palabrasClave = palabrasClave;
        this.respuesta = respuesta;
        this.activo = activo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getPregunta() {
        return pregunta;
    }

    public void setPregunta(String pregunta) {
        this.pregunta = pregunta;
    }

    public String getPalabrasClave() {
        return palabrasClave;
    }

    public void setPalabrasClave(String palabrasClave) {
        this.palabrasClave = palabrasClave;
    }

    public String getRespuesta() {
        return respuesta;
    }

    public void setRespuesta(String respuesta) {
        this.respuesta = respuesta;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}

