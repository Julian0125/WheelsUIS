package com.example.demo.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;


import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@Entity	

@Table (name="pasajero")
public class Pasajero extends Usuario  {
	

	@ManyToOne
    @JoinColumn(name = "viaje_actual_id")
    @JsonIgnoreProperties({"pasajeros", "conductor"})
	private	Viaje viajeActual;
	
    @ManyToMany(mappedBy = "pasajeros", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"pasajeros", "conductor"})
	private List<Viaje> viajes=new ArrayList<>();
	
    public Pasajero(Usuario usuario) {
        super();
        
        this.setNombre(usuario.getNombre());
        this.setCorreo(usuario.getCorreo());
        this.setContraseña(usuario.getContraseña());
        this.setCodigo(usuario.getCodigo());
        this.setCelular(usuario.getCelular());
        this.setEstado(usuario.getEstado());
        this.setTipo(usuario.getTipo());
       
    }
	
}
