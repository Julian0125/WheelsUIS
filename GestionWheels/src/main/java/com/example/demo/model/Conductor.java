package com.example.demo.model;

import java.util.ArrayList;
import java.util.List;



import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OneToMany;
@Getter
@Setter
@NoArgsConstructor

@Entity	//guarda objetos de esta clase como filas en una talba
@Table (name="conductor")
public class Conductor extends Usuario {

	@OneToOne
	@JoinColumn(name="carro_id")//definiendo la clave foranea
	private Coche carro;
    @OneToOne
    @JoinColumn(name = "viaje_actual_id") //definiendo la clave foranea
	private	Viaje viajeActual;
    @OneToMany(mappedBy = "conductor", cascade = CascadeType.ALL)// se le dice que ya en viaje esta mapaeado con conductor
    // y la cascada hace que todo lo que le ppase a conductor le pase a sus hijos (viajes)
	private List<Viaje> viajes=new ArrayList<>();
    //contructor para pasar usuario 

    public Conductor(Usuario usuario) {
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
