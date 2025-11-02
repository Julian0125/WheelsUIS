package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;


import com.example.demo.builder.ViajeDirector;
import com.example.demo.model.Chat;
import com.example.demo.model.Conductor;
import com.example.demo.model.EstadoViaje;
import com.example.demo.model.Pasajero;
import com.example.demo.model.Viaje;
import com.example.demo.repository.ConductorRepository;
import com.example.demo.repository.PasajeroRepository;
import com.example.demo.repository.ViajeRepository;

@Service
public class ViajeService {

	@Autowired
	private ViajeRepository viajeRepository;
	@Autowired
	private ConductorRepository conductorRepository;
	@Autowired
	private PasajeroRepository pasajeroRepository;
	
	 public Viaje crearViajePredefinido(int idConductor, String tipo) {
		    Conductor conductor = conductorRepository.findById((int) idConductor)
		            .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));
		    
		    boolean tieneViajeActivo = viajeRepository.existsByConductorAndEstadoViaje(conductor, EstadoViaje.ENCURSO);
		    if (tieneViajeActivo) {
		        throw new IllegalArgumentException("Conductor ya tiene un viaje activo");
		    }
		    if (conductor.getVehiculo() == null) {
		        throw new IllegalArgumentException("El conductor no tiene un vehículo registrado");
		    }
	        ViajeDirector director = new ViajeDirector(conductor);
	        Viaje viaje;

	        switch (tipo.toLowerCase()) {
	            case "mutis":
	                viaje = director.construirViajeUMutis();
	                break;
	            case "cumbre":
	                viaje = director.construirViajeUCumbre();
	                break;
	            default:
	                throw new IllegalArgumentException("Tipo de viaje desconocido");
	        }

	        // 🔹 Crear el chat al mismo tiempo
	        Chat chat = new Chat();
	        chat.setViaje(viaje);
	        viaje.setChat(chat);
	        conductor.setViajeActual(viaje);


	        return viajeRepository.save(viaje);
	    }
	 
	 public Viaje aceptarViaje(int idViaje, int idPasajero) {
		    Optional<Viaje> viajeOpt = viajeRepository.findById(idViaje);
		    Optional<Pasajero> pasajeroOpt = pasajeroRepository.findById(idPasajero);

		    // Validaciones de negocio
		    if (viajeOpt.isEmpty()) throw new IllegalArgumentException("Viaje no encontrado");
		    if (pasajeroOpt.isEmpty()) throw new IllegalArgumentException("Pasajero no encontrado");

		    Viaje viaje = viajeOpt.get();
		    Pasajero pasajero = pasajeroOpt.get();

		    if (viaje.getPasajeros().contains(pasajero))
		        throw new IllegalArgumentException("El pasajero ya está en el viaje");

		    if (viaje.getPasajeros().size() >= viaje.getCuposMaximos())
		        throw new IllegalArgumentException("No hay cupos disponibles");

		    // Agregar pasajero
		    viaje.getPasajeros().add(pasajero);
		    viajeRepository.save(viaje);

		    return viaje;
		}
}
