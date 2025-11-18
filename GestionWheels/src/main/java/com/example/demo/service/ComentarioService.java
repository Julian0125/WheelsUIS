package com.example.demo.service;
import com.example.demo.DTO.DTOcrearComentario;
import com.example.demo.model.Comentario;
import com.example.demo.model.Usuario;
import com.example.demo.model.Viaje;
import com.example.demo.repository.ComentarioRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.repository.ViajeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;

@CrossOrigin(origins = "http://localhost:8081")
@Service
public class ComentarioService {
    @Autowired
    private  ViajeRepository viajeRepository;
    @Autowired
    private  UsuarioRepository usuarioRepository;
    @Autowired
    private  ComentarioRepository comentarioRepository;

    public Comentario crearComentario(int idViaje, DTOcrearComentario dto) {

        // 1. Buscar el viaje
        Viaje viaje = viajeRepository.findById(idViaje)
                .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado"));

        // 2. Buscar el usuario
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        int idUsuario = usuario.getId();

        // 3. Validación: solo puede comentar el conductor o un pasajero del viaje
        boolean esConductor = viaje.getConductor().getId() == idUsuario;

        boolean esPasajero = viaje.getPasajeros()
                .stream()
                .anyMatch(p -> p.getId() == idUsuario);

        if (!esConductor && !esPasajero) {
            throw new IllegalArgumentException("El usuario no pertenece al viaje y no puede comentar.");
        }

        // 4. Crear el comentario
        Comentario comentario = new Comentario();
        comentario.setTexto(dto.getTexto());
        comentario.setFecha(LocalDateTime.now());
        comentario.setViaje(viaje);
        comentario.setUsuario(usuario);

        // 5. Guardarlo
        viaje.getComentarios().add(comentario);

        return comentarioRepository.save(comentario);
    }
}
