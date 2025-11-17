package com.example.demo.rest;

import java.util.List;
import java.util.Map;

import com.example.demo.DTO.RutasPredefinidas;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.DTO.CancelarViajeDTO;
import com.example.demo.model.Viaje;
import com.example.demo.model.tipoUsuario;
import com.example.demo.service.ViajeService;

@RestController
@RequestMapping("/viaje")
@CrossOrigin(origins = "*")
public class ViajeRest {
 	@Autowired
    private ViajeService viajeService;


	@PutMapping("/{idViaje}/iniciar")
	public ResponseEntity<String> iniciarViaje(@PathVariable("idViaje") int idViaje) {
		boolean iniciado = viajeService.iniciarViaje(idViaje);

		if (iniciado) {
			return ResponseEntity.ok("El viaje ha iniciado.");
		} else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body("Aún no puede iniciar el viaje.");
		}
	}
 	@PostMapping("/crear/{tipo}")
 	public ResponseEntity<?> crearViaje(@PathVariable("tipo") String tipo, @RequestParam("idConductor") int idConductor) {
 	    try {
 	        // Crear el viaje usando el patrón Builder
 	        Viaje viaje = viajeService.crearViajePredefinido(idConductor, tipo);
 	        return ResponseEntity.ok(viaje);
 	    } catch (IllegalArgumentException e) {
 	        // Devuelve un JSON con el mensaje de error
 	    	return ResponseEntity.badRequest().body(e.getMessage());
 	    }
 	 }
 	
 	@PostMapping("/aceptar")
 	public ResponseEntity<?> aceptarViaje(
 	        @RequestParam("idViaje") int idViaje,
 	        @RequestParam("idPasajero") int idPasajero) {
 	    try {
 	        Viaje viajeActualizado = viajeService.aceptarViaje(idViaje, idPasajero);
 	        return ResponseEntity.ok(viajeActualizado);
 	    } catch (IllegalArgumentException e) {
 	        return ResponseEntity.badRequest().body(e.getMessage());
 	    }
 	}
 	
 	
 	@PostMapping("/{idViaje}/cancelar")
 	public ResponseEntity<?> cancelarViaje(
 	        @PathVariable("idViaje") int idViaje,@RequestBody CancelarViajeDTO request) {
 	    
 	    try {
 	        // Detecta automáticamente si es conductor o pasajero usando tu enum
 	        boolean esConductor = request.getTipo() == tipoUsuario.CONDUCTOR;
 	        
 	        viajeService.cancelarViaje(idViaje, request.getIdUsuario(), esConductor);
 	        
 	        String mensaje = esConductor 
 	            ? "Viaje cancelado completamente" 
 	            : "Te has desvinculado del viaje exitosamente";
 	        
 	        return ResponseEntity.ok().body(Map.of(
 	            "mensaje", mensaje,
 	            "idViaje", idViaje
 	        ));
 	    } catch (IllegalArgumentException e) {
 	        return ResponseEntity.badRequest().body(Map.of(
 	            "error", e.getMessage()
 	        ));
 	    } catch (Exception e) {
 	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
 	            "error", "Error al cancelar: " + e.getMessage()
 	        ));
 	    }
 	}
 		//historial de conductor
		@GetMapping("/conductor/{idConductor}/historial")
		public ResponseEntity<?> historialPorConductor(@PathVariable int idConductor) {
	    try {
	        List<Viaje> viajes = viajeService.listarHistorialPorConductor(idConductor);
	        return ResponseEntity.ok(viajes);
	    } catch (IllegalArgumentException e) {
	        return ResponseEntity.badRequest().body(e.getMessage());
	    }
	}
	//  Viaje actual del pasajero
	    @GetMapping("/pasajero/{idPasajero}/actual")
	    public ResponseEntity<?> viajeActualPasajero(@PathVariable int idPasajero) {
	        try {
	            Viaje viaje = viajeService.obtenerViajeActualPorPasajero(idPasajero);
	            return ResponseEntity.ok(viaje);
	        } catch (IllegalArgumentException e) {
	            return ResponseEntity.badRequest().body(e.getMessage());
	        }
	    }

	    // ✅ Historial del pasajero
	    @GetMapping("/pasajero/{idPasajero}/historial")
	    public ResponseEntity<?> historialPasajero(@PathVariable int idPasajero) {
	        try {
	            List<Viaje> viajes = viajeService.listarHistorialPorPasajero(idPasajero);
	            return ResponseEntity.ok(viajes);
	        } catch (IllegalArgumentException e) {
	            return ResponseEntity.badRequest().body(e.getMessage());
	        }
	    }

	@GetMapping("/rutas-predefinidas")
	public ResponseEntity<List<RutasPredefinidas>> listarRutasPorConductor(
			@RequestParam int idConductor) {
		List<RutasPredefinidas> rutas = viajeService.listarRutasPredefinidasPorConductor(idConductor);
		return ResponseEntity.ok(rutas);
	}

	@PostMapping("/finalizar/{idViaje}/{idConductor}")
	public Viaje finalizarViaje(
			@PathVariable int idViaje,
			@PathVariable int idConductor
	) {
		return viajeService.finalizarViaje(idViaje, idConductor);
	}
}
