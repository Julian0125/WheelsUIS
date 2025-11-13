package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.example.demo.DTO.RutasPredefinidas;
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

	public List<RutasPredefinidas> listarRutasPredefinidasPorConductor(int idConductor) {
		// 🔹 Buscar conductor
		Conductor conductor = conductorRepository.findById(idConductor)
				.orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

		// 🔹 Crear el director para ese conductor
		ViajeDirector director = new ViajeDirector(conductor);

		// 🔹 Crear lista de viajes predefinidos usando el director
		List<Viaje> viajes = new ArrayList<>();
		viajes.add(director.construirViajeUMutis());
		viajes.add(director.construirViajeUCumbre());
		viajes.add(director.construirViajeMutisU());
		viajes.add(director.construirViajeCumbreU());
		// aquí puedes agregar más viajes si los defines en ViajeDirector

		// 🔹 Convertir a DTO
		List<RutasPredefinidas> rutas = new ArrayList<>();
		for (Viaje v : viajes) {
			rutas.add(new RutasPredefinidas(
					v.getOrigen(),
					v.getDestino(),
					v.getCuposMaximos(),
					v.getHoraSalida()
			));
		}

		return rutas;
	}

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
	 public void cancelarViaje(int idViaje, int idUsuario, boolean esConductor) {
	     Viaje viaje = viajeRepository.findById(idViaje)
	             .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado"));

	     if (esConductor) {
	         // ===== CONDUCTOR CANCELA: Elimina el viaje completo =====
	         
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
	         // Ahora sí eliminar
	         viajeRepository.delete(viaje);

	         System.out.println("Viaje cancelado completamente por el conductor ID " + idUsuario);
	         
	     } else {
	         // ===== PASAJERO CANCELA: Solo se desvincula él =====
	         
	         Pasajero pasajero = pasajeroRepository.findById(idUsuario)
	                 .orElseThrow(() -> new IllegalArgumentException("Pasajero no encontrado"));

	         // Verificar que el pasajero esté en este viaje
	         if (!viaje.getPasajeros().contains(pasajero)) {
	             throw new IllegalArgumentException("El pasajero no está en este viaje");
	         }

	         // Desvincular solo este pasajero
	         viaje.getPasajeros().remove(pasajero);
	         pasajero.setViajeActual(null);
	         
	         pasajeroRepository.save(pasajero);
	         viajeRepository.save(viaje);

	         // Notificar al conductor
	         String mensaje = "El pasajero " + pasajero.getNombre() + " ha cancelado su participación en el viaje a " + viaje.getDestino();
	         notificacionService.enviar(viaje.getConductor().getId(), mensaje);

	         System.out.println("Pasajero ID " + idUsuario + " se ha desvinculado del viaje ID " + idViaje);
	     }
	 }

	 public Viaje obtenerViajeActivoPorConductor(int idConductor) {
    return viajeRepository.findByConductorIdAndEstadoViaje(idConductor, EstadoViaje.ENCURSO)
            .orElseThrow(() -> new IllegalArgumentException("No hay viaje activo para este conductor"));


}
		
		public List<Viaje> listarHistorialPorConductor(int idConductor) {
		    List<EstadoViaje> estadosHistorial = List.of(EstadoViaje.FINALIZADO, EstadoViaje.CANCELADO);
		    return viajeRepository.findByConductorIdAndEstadoViajeIn(idConductor, estadosHistorial);
		}

		public List<Viaje> listarHistorialPorPasajero(int idPasajero) {
		    List<EstadoViaje> estadosHistorial = List.of(EstadoViaje.FINALIZADO, EstadoViaje.CANCELADO);
		    return viajeRepository.findByPasajeros_IdAndEstadoViajeIn(idPasajero, estadosHistorial);
		}

		public Viaje obtenerViajeActualPorPasajero(int idPasajero) {
		    return viajeRepository.findByPasajeros_IdAndEstadoViaje(idPasajero, EstadoViaje.ENCURSO)
		            .orElseThrow(() -> new IllegalArgumentException("El pasajero no tiene un viaje activo"));
		}






}
