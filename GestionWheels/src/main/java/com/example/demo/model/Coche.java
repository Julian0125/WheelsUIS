package com.example.demo.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity	//guarda objetos de esta clase como filas en una talba
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table (name="coche")
public class Coche {
	@Id//indica clave primeraria
	@GeneratedValue(strategy = GenerationType.IDENTITY)//el valor se genera automaticamente
	private int id;
	private String placa;
	private String modelo;
	private String marca;
    @OneToOne(mappedBy = "carro")
    @JsonIgnore
    private Conductor conductor;
	
	
}
