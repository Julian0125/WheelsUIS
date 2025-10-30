package com.example.demo.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Coche;
import com.example.demo.service.CocheService;

@RestController
@RequestMapping("/coches")
public class CocheRest {
	 @Autowired
	    private CocheService cocheService;

	    @PostMapping("/registrar/{id}")
	    public ResponseEntity<?> registrarCoche(@PathVariable("id") int id, @RequestBody Coche coche) {
	        try {
	            Coche nuevoCoche = cocheService.registrarCoche(id, coche);
	            return ResponseEntity.ok(nuevoCoche);
	        } catch (IllegalArgumentException e) {
	            return ResponseEntity.badRequest().body(e.getMessage());
	        }
	    }
}
