package com.example.demo.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Vehiculo;
import com.example.demo.service.VehiculoService;

@RestController
@RequestMapping("/vehiculos")
@CrossOrigin(origins = "*")
public class VehiculoRest {
	 	@Autowired
	    private VehiculoService vehiculoService;

	    @PostMapping("/registrar/{id}")
	    public ResponseEntity<?> registrarCoche(@PathVariable("id") int id, @RequestBody Vehiculo coche) {
	        try {
	            Vehiculo nuevoVehiculo = vehiculoService.registrarVehiculo(id, coche);
	            return ResponseEntity.ok(nuevoVehiculo);
	        } catch (IllegalArgumentException e) {
	            return ResponseEntity.badRequest().body(e.getMessage());
	        }
	    }
	    
	    @GetMapping("/conductor/{id}")
	    public ResponseEntity<?> obtenerCochePorConductor(@PathVariable("id") int id) {
	        try {
	            Vehiculo vehiculo = vehiculoService.obtenerVehiculoPorConductorId(id);
	            return ResponseEntity.ok(vehiculo);
	        } catch (IllegalArgumentException e) {
	            return ResponseEntity.badRequest().body(e.getMessage());
	        }
	    }
}
