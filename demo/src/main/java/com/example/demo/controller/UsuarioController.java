package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    private static final String FIXED_PASSWORD = "itca";

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Validar contraseña
        if (!FIXED_PASSWORD.equals(request.getPassword())) {
            return ResponseEntity.badRequest().body(
                    new LoginResponse(false, "Contraseña incorrecta", null, null, null, null)
            );
        }

        // Validar campos obligatorios
        if (request.getNombre() == null || request.getNombre().trim().isEmpty() ||
                request.getApellido() == null || request.getApellido().trim().isEmpty() ||
                request.getCorreo() == null || request.getCorreo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    new LoginResponse(false, "Todos los campos son obligatorios", null, null, null, null)
            );
        }

        // Verificar si el usuario ya existe por correo
        Optional<Usuario> existingUser = usuarioRepository.findByCorreo(request.getCorreo().trim());

        if (existingUser.isPresent()) {
            // Usuario existe - iniciar sesión
            Usuario user = existingUser.get();
            return ResponseEntity.ok(
                    new LoginResponse(true, "¡Bienvenido de nuevo!", user.getId(),
                            user.getNombre(), user.getApellido(), user.getCorreo())
            );
        } else {
            // Nuevo usuario - registrar
            Usuario newUser = new Usuario();
            newUser.setNombre(request.getNombre().trim());
            newUser.setApellido(request.getApellido().trim());
            newUser.setCorreo(request.getCorreo().trim());

            Usuario saved = usuarioRepository.save(newUser);
            return ResponseEntity.ok(
                    new LoginResponse(true, "¡Registro exitoso! Bienvenido/a", saved.getId(),
                            saved.getNombre(), saved.getApellido(), saved.getCorreo())
            );
        }
    }
}
