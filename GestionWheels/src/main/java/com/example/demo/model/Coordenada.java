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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity	//guarda objetos de esta clase como filas en una talba
@Table (name="coordenada")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

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


    


}
