package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.demo.builder.ViajeDirector;
import com.example.demo.model.Chat;
import com.example.demo.model.Conductor;
import com.example.demo.model.EstadoViaje;
import com.example.demo.model.Pasajero;
import com.example.demo.model.Viaje;
import com.example.demo.repository.ConductorRepository;
import com.example.demo.repository.PasajeroRepository;
import com.example.demo.repository.ViajeRepository;

import jakarta.transaction.Transactional;
@CrossOrigin(origins = "http://localhost:8081")
@Service
public class ViajeService {

	@Autowired
	private ViajeRepository viajeRepository;
	@Autowired
	private ConductorRepository conductorRepository;
	@Autowired
	private PasajeroRepository pasajeroRepository;
	@Autowired
	private NotificacionService notificacionService;
	
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
		    // 🔹 Asociar viaje al pasajero
		    
		    viajeRepository.save(viaje);
		    pasajero.setViajeActual(viaje);
		    pasajeroRepository.save(pasajero);
		    
		    return viaje;
		}
	 
	 @Transactional
	 public void cancelarViaje(int idViaje, int idConductor) {
	     Viaje viaje = viajeRepository.findById(idViaje)
	             .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado"));

	     // Clonar lista para evitar ConcurrentModificationException
	     List<Pasajero> pasajeros = new ArrayList<>(viaje.getPasajeros());

	     // Desvincular pasajeros
	     for (Pasajero pasajero : pasajeros) {
	         pasajero.setViajeActual(null);
	         pasajeroRepository.save(pasajero);

	         String mensaje = "El viaje con destino a " + viaje.getDestino() + " fue cancelado por el conductor.";
	         notificacionService.enviar(pasajero.getId(), mensaje);
	     }

	     // Limpiar todas las relaciones antes de eliminar
	     viaje.getPasajeros().clear();
	     viaje.setConductor(null);

	     // Guardar el viaje limpio antes de eliminar
	     viajeRepository.save(viaje);
	     viajeRepository.flush(); // Sincroniza el estado en la BD
	     System.out.println("Viaje a eliminar: " + viaje.getId());
	     System.out.println("Pasajeros asociados: " + viaje.getPasajeros().size());
	     System.out.println("Chat: " + (viaje.getChat() != null ? viaje.getChat().getId() : "null"));
	     System.out.println("Comentarios: " + (viaje.getComentarios() != null ? viaje.getComentarios().size() : "0"));
	     System.out.println("Coordenadas: " + (viaje.getCoordenadas() != null ? viaje.getCoordenadas().size() : "0"));

	     // Ahora sí eliminar
	     viajeRepository.delete(viaje);

	     System.out.println("Viaje cancelado correctamente por el conductor ID " + idConductor);
	 }


}
