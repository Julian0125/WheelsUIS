package com.example.demo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
@Entity	//guarda objetos de esta clase como filas en una talba
@Table (name="coordenada")
public class Coordenada {
	@Id//indica clave primeraria
    @GeneratedValue(strategy = GenerationType.IDENTITY)//el valor se genera automaticamente
    private Long id;
	
    private double latitud;
    private double longitud;
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "viaje_id")//definiendo la clave foranea
    private Viaje viaje;
    
    @Enumerated(EnumType.STRING)
    private tipoUsuario tipo;
    
    public Coordenada(double latitud, double longitud, tipoUsuario tipo, Viaje viaje) {
        this.latitud = latitud;
        this.longitud = longitud;
        this.timestamp = LocalDateTime.now();
        this.tipo = tipo;
        this.viaje = viaje;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public double getLatitud() {
		return latitud;
	}

	public void setLatitud(double latitud) {
		this.latitud = latitud;
	}

	public double getLongitud() {
		return longitud;
	}

	public void setLongitud(double longitud) {
		this.longitud = longitud;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}

	public Viaje getViaje() {
		return viaje;
	}

	public void setViaje(Viaje viaje) {
		this.viaje = viaje;
	}

	public tipoUsuario getTipo() {
		return tipo;
	}

	public void setTipo(tipoUsuario tipo) {
		this.tipo = tipo;
	}
    
    


}
