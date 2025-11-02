package com.example.demo.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import com.example.demo.model.Viaje;
import com.example.demo.service.ViajeService;

@RestController
@RequestMapping("/viaje")
public class ViajeRest {
 	@Autowired
    private ViajeService viajeService;
 	
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
}
