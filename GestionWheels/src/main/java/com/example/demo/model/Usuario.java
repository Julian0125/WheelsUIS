package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity	//guarda objetos de esta clase como filas en una talba
@Inheritance(strategy = InheritanceType.JOINED)
@Table (name="usuario")
public class Usuario {
	@Id//indica clave primeraria
	@GeneratedValue(strategy = GenerationType.IDENTITY)//el valor se genera automaticamente
	private int id;
	private String nombre;
	private int codigo;
	private int celular;
	@Column(unique = true)
	private String correo;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	@Column(unique = true)
	private String token;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String contraseña;
    @Enumerated(EnumType.STRING)
    private Estado estado;
    @Enumerated(EnumType.STRING)
    private tipoUsuario tipo;
    
}
