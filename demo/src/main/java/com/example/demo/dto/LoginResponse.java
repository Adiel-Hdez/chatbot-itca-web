package com.example.demo.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String nombre;
    private String apellido;
    private String correo;

    public LoginResponse() {
    }

    public LoginResponse(boolean success, String message, Long userId, String nombre, String apellido, String correo) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }
}
