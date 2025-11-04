package com.example.demo.rest;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.DTO.Login;
import com.example.demo.model.Usuario;
import com.example.demo.service.UsuarioService;

@RestController
@CrossOrigin(origins = "http://localhost:8081")
@RequestMapping("/usuario")
public class UsuarioRest {
	@Autowired
	private UsuarioService usuarioService;
	
    @PostMapping("/registrar")
    public void registrarUsuario(@RequestBody Usuario usuario) {
         usuarioService.registrarUsuarioTemporal(usuario);
    }
    
    @GetMapping("/listarUsuario")
    public List<Usuario> listarUsuario(){
    	return usuarioService.listarUsuario();
    }
    
    @GetMapping("/aprobar")
    public ResponseEntity<String> aprobarUsuario(@RequestParam("token") String token) {
        boolean exito = usuarioService.aprobarUsuario(token);
        if (!exito) {
            return ResponseEntity.badRequest().body("Este usuario ya fue aprobado o rechazado.");
        }
        return ResponseEntity.ok("✅ Usuario aprobado correctamente.");
    }

    @GetMapping("/rechazar")
    public ResponseEntity<String> rechazarUsuario(@RequestParam("token") String token) {
        boolean exito = usuarioService.rechazarUsuario(token);
        if (!exito) {
            return ResponseEntity.badRequest().body("Este usuario ya fue aprobado o rechazado.");
        }
        return ResponseEntity.ok("❌ Usuario rechazado.");
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Login request) {
        try {
            Usuario usuario = usuarioService.ingresar(request.getCorreo(), request.getContraseña());
            return ResponseEntity.ok(usuario);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
