package com.example.demo.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity	//guarda objetos de esta clase como filas en una talba
@Table (name="viaje")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Viaje {
	@Id//indica clave primeraria
	@GeneratedValue(strategy = GenerationType.IDENTITY)//el valor se genera automaticamente
	private int id;
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "conductor_id")//definiendo la clave foranea
    @JsonIgnoreProperties({"viajeActual", "viajes"})// ignora la lista de viajes al serializar el conductor
	private Conductor conductor;
    
    
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "viaje_pasajeros_historial",//crea una table de nombre pasajerso
        //fk compuesta
        joinColumns = @JoinColumn(name = "viaje_id"),//indica el nombre de la columna que referencia la tabla actual
        inverseJoinColumns = @JoinColumn(name = "pasajero_id") // indica la columna de la otra entidad
    )
    @JsonIgnoreProperties({"historialViajes", "viajes", "viajeActual"})
    private List<Pasajero> pasajeros = new ArrayList<>();
    
    private int cuposMaximos;
    
    @Enumerated(EnumType.STRING)
    private EstadoViaje estadoViaje;
    
    private LocalDateTime  horaSalida;
    private String origen;
    private String destino;
    
    @OneToMany(mappedBy = "viaje", orphanRemoval = true,cascade = CascadeType.ALL)// se le dice que ya en coordenda esta mapaeado con coordenda
    // y la cascada hace que todo lo que le ppase a vaije le pase a sus hijos (coordenada)
    private List<Coordenada> coordenadas = new ArrayList<>();
    
    @OneToMany(mappedBy = "viaje", orphanRemoval = true,cascade = CascadeType.ALL)
    private List<Comentario> comentarios = new ArrayList<>();
    
    @OneToOne(mappedBy = "viaje",cascade = CascadeType.ALL)
    @JsonManagedReference
    private Chat chat;
    
    

    
}
