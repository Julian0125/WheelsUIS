package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Usuario;


public interface UsuarioRepository  extends JpaRepository<Usuario,Integer> {
	boolean existsByCorreo(String correo);
	Optional<Usuario> findByToken(String token);
}
