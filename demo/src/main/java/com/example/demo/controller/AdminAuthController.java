package com.example.demo.controller;

import com.example.demo.dto.AdminLoginRequest;
import com.example.demo.dto.AdminLoginResponse;
import com.example.demo.model.Admin;
import com.example.demo.repository.AdminRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private final AdminRepository adminRepository;

    public AdminAuthController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@RequestBody AdminLoginRequest request) {
        if (request.getCorreo() == null || request.getCorreo().trim().isEmpty() ||
                request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    new AdminLoginResponse(false, "Todos los campos son requeridos", null, null, null, null)
            );
        }

        // Buscar administrador por correo
        Optional<Admin> adminOpt = adminRepository.findByCorreo(request.getCorreo().trim());

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (admin.getPassword().equals(request.getPassword().trim())) {
                return ResponseEntity.ok(
                        new AdminLoginResponse(true, "Inicio de sesión exitoso", admin.getId(),
                                admin.getNombre(), admin.getCorreo(), admin.getRol())
                );
            } else {
                return ResponseEntity.badRequest().body(
                        new AdminLoginResponse(false, "Contraseña incorrecta", null, null, null, null)
                );
            }
        }

        // Fallback institucional por defecto si no está en la BD
        if ("itca".equals(request.getPassword().trim()) && request.getCorreo().contains("@")) {
            return ResponseEntity.ok(
                    new AdminLoginResponse(true, "Acceso concedido", 1L,
                            "Administrador ITCA", request.getCorreo().trim(), "ADMIN")
            );
        }

        return ResponseEntity.badRequest().body(
                new AdminLoginResponse(false, "Usuario no encontrado", null, null, null, null)
        );
    }
}
