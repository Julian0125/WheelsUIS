package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
@Entity	//guarda objetos de esta clase como filas en una talba
@Table (name="coche")
public class Coche {
	@Id//indica clave primeraria
	@GeneratedValue(strategy = GenerationType.IDENTITY)//el valor se genera automaticamente
	private int id;
	private String placa;
	private String modelo;
	private String marca;
	
	
	public Coche(String placa, String modelo, String marca) {
		super();
		this.placa = placa;
		this.modelo = modelo;
		this.marca = marca;
	}
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getPlaca() {
		return placa;
	}
	public void setPlaca(String placa) {
		this.placa = placa;
	}
	public String getModelo() {
		return modelo;
	}
	public void setModelo(String modelo) {
		this.modelo = modelo;
	}
	public String getMarca() {
		return marca;
	}
	public void setMarca(String marca) {
		this.marca = marca;
	}
	
	
}
