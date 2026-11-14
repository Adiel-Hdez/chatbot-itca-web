package com.example.demo.dto;

public class AdminLoginRequest {

    private String correo;
    private String password;

    public AdminLoginRequest() {
    }

    public AdminLoginRequest(String correo, String password) {
        this.correo = correo;
        this.password = password;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
