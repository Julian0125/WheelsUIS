package com.example.demo.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
@Entity	//guarda objetos de esta clase como filas en una talba
@Table (name="viaje")
public class Viaje {
	@Id//indica clave primeraria
	@GeneratedValue(strategy = GenerationType.IDENTITY)//el valor se genera automaticamente
	private int id;
    @ManyToOne
    @JoinColumn(name = "conductor_id")//definiendo la clave foranea
	private Conductor conductor;
    @ManyToMany
    @JoinTable(
        name = "viaje_pasajeros",//crea una table de nombre pasajerso
        //fk compuesta
        joinColumns = @JoinColumn(name = "viaje_id"),//indica el nombre de la columna que referencia la tabla actual
        inverseJoinColumns = @JoinColumn(name = "pasajero_id") // indica la columna de la otra entidad
    )
    private List<Pasajero> pasajeros = new ArrayList<>();
    
    private int cuposMaximos;
    
    @Enumerated(EnumType.STRING)
    private estadoViaje EstadoViaje;
    
    private LocalDateTime  horaSalida;
    private String origen;
    private String destino;
    
    @OneToMany(mappedBy = "viaje", cascade = CascadeType.ALL)// se le dice que ya en coordenda esta mapaeado con coordenda
    // y la cascada hace que todo lo que le ppase a vaije le pase a sus hijos (coordenada)
    private List<Coordenada> coordenadas = new ArrayList<>();

	public Viaje(com.example.demo.model.Conductor conductor, List<Pasajero> pasajeros, int cuposMaximos,
			estadoViaje estadoViaje, LocalDateTime horaSalida, String origen, String destino) {
		super();
		this.conductor = conductor;
		this.pasajeros = pasajeros;
		this.cuposMaximos = cuposMaximos;
		this.EstadoViaje = estadoViaje;
		this.horaSalida = horaSalida;
		this.origen = origen;
		this.destino = destino;
		this.coordenadas = new ArrayList<>(); 
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Conductor getConductor() {
		return conductor;
	}

	public void setConductor(Conductor conductor) {
		this.conductor = conductor;
	}

	public List<Pasajero> getPasajeros() {
		return pasajeros;
	}

	public void setPasajeros(List<Pasajero> pasajeros) {
		this.pasajeros = pasajeros;
	}

	public int getCuposMaximos() {
		return cuposMaximos;
	}

	public void setCuposMaximos(int cuposMaximos) {
		this.cuposMaximos = cuposMaximos;
	}

	public estadoViaje getEstadoViaje() {
		return EstadoViaje;
	}

	public void setEstadoViaje(estadoViaje estadoViaje) {
		EstadoViaje = estadoViaje;
	}

	public LocalDateTime getHoraSalida() {
		return horaSalida;
	}

	public void setHoraSalida(LocalDateTime horaSalida) {
		this.horaSalida = horaSalida;
	}

	public String getOrigen() {
		return origen;
	}

	public void setOrigen(String origen) {
		this.origen = origen;
	}

	public String getDestino() {
		return destino;
	}

	public void setDestino(String destino) {
		this.destino = destino;
	}

	public List<Coordenada> getCoordenadas() {
		return coordenadas;
	}

	public void setCoordenadas(List<Coordenada> coordenadas) {
		this.coordenadas = coordenadas;
	}
    
    
}
