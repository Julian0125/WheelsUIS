package com.example.demo.service;


import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.demo.model.Conductor;
import com.example.demo.model.Estado;
import com.example.demo.model.Pasajero;
import com.example.demo.model.Usuario;
import com.example.demo.model.tipoUsuario;
import com.example.demo.repository.ConductorRepository;
import com.example.demo.repository.PasajeroRepository;
import com.example.demo.repository.UsuarioRepository;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:8081")
@Service
public class UsuarioService  {

	@Autowired
	private ConductorService conductorService;
	@Autowired
	private PasajeroService pasajeroService;
	@Autowired
	private PasajeroRepository pasajeroRepository;
	@Autowired
	private ConductorRepository conductorRepository;
	@Autowired
	private UsuarioRepository usuarioRepository;
	@Autowired
	private EmailService emailService;
	
	public void registrarUsuarioTemporal(Usuario usuario) {
	    // Validaciones
	    if (usuario.getNombre() == null || usuario.getNombre().isEmpty())
	        throw new IllegalArgumentException("Nombre obligatorio");
	    if (usuario.getCorreo() == null || usuario.getCorreo().isEmpty())
	        throw new IllegalArgumentException("Correo obligatorio");
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
	    if (usuario.getTipo() == null)
	        throw new IllegalArgumentException("Tipo de usuario obligatorio");
	    if (usuario.getContraseña() == null || usuario.getContraseña().isEmpty())
	        throw new IllegalArgumentException("Contraseña obligatoria");

	    // Generamos token temporal
	    String token = UUID.randomUUID().toString();
	    usuario.setToken(token);
	    usuario.setEstado(Estado.REVISION);



	    // Según el tipo, creamos la entidad específica
	    if (usuario.getTipo() == tipoUsuario.CONDUCTOR) {
	        Conductor conductor = new Conductor(usuario);
	        conductor.setToken(usuario.getToken());
	        emailService.notificarNuevoUsuario(conductor);
	        conductorRepository.save(conductor);
	      
	    } else if (usuario.getTipo() == tipoUsuario.PASAJERO) {
	        Pasajero pasajero = new Pasajero(usuario);
	        pasajero.setToken(usuario.getToken());
	        emailService.notificarNuevoUsuario(pasajero);
	        pasajeroRepository.save(pasajero);
	    }

	    // Enviamos correo con token
	    
	}
	//APROBACION O RECHAZO
	public boolean aprobarUsuario(String token) {
	    Usuario usuario = usuarioRepository.findByToken(token)
	        .orElseThrow(() -> new IllegalArgumentException("Token inválido"));

	    if (usuario.getEstado() != Estado.REVISION) return false;

	    usuario.setEstado(Estado.ACEPTADO);
	    usuarioRepository.save(usuario);

	    return true;
	}

	public boolean rechazarUsuario(String token) {
	    Usuario usuario = usuarioRepository.findByToken(token)
	        .orElseThrow(() -> new IllegalArgumentException("Token inválido"));

	    if (usuario.getEstado() != Estado.REVISION) {
	        return false; // ya fue aprobado o rechazado
	    }
	    usuario.setEstado(Estado.RECHAZADO);
	    usuarioRepository.save(usuario);

	    return true;

	   
	}


	public Usuario ingresar(String correo, String contraseña) {
		Usuario usuario = usuarioRepository.findByCorreo(correo)
				.orElseThrow(() -> new IllegalArgumentException("Correo incorrecto o no registrado"));

		// Verificar contraseña
		if (!usuario.getContraseña().equals(contraseña)) {
			throw new IllegalArgumentException("Contraseña incorrecta");
		}

		// Verificar estado del usuario
		switch (usuario.getEstado()) {
			case ACEPTADO:
				return usuario;

			case REVISION:
				throw new IllegalArgumentException("Tu cuenta está en revisión. Espera la aprobación.");

			case RECHAZADO:
				throw new IllegalArgumentException("Tu cuenta ha sido rechazada. No puedes iniciar sesión.");

			default:
				throw new IllegalArgumentException("Estado de usuario no válido.");
		}
	}

	
	//listar usuario
	public List<Usuario> listarUsuario(){
		return usuarioRepository.findAll();
	}
}
