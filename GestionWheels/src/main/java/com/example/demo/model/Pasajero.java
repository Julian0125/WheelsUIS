package com.example.demo.model;

import java.util.ArrayList;
import java.util.List;



import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import jakarta.persistence.JoinColumn;
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
	
	@OneToOne
	@JoinColumn(name = "viaje_actual_id")
	
	private	Viaje viajeActual;
	
	@OneToMany(mappedBy = "pasajeros", cascade = CascadeType.ALL)
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
