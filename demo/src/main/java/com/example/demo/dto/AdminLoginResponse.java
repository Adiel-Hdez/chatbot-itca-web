package com.example.demo.dto;

public class AdminLoginResponse {

    private boolean success;
    private String message;
    private Long adminId;
    private String nombre;
    private String correo;
    private String rol;

    public AdminLoginResponse() {
    }

    public AdminLoginResponse(boolean success, String message, Long adminId, String nombre, String correo, String rol) {
        this.success = success;
        this.message = message;
        this.adminId = adminId;
        this.nombre = nombre;
        this.correo = correo;
        this.rol = rol;
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

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}
