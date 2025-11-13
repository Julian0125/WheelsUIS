package com.example.demo.rest;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import com.example.demo.model.Pasajero;

import com.example.demo.service.PasajeroService;

@RestController
@RequestMapping("/api/pasajero")
@CrossOrigin(origins = "*")
public class PasajeroRest {
	
	@Autowired
	private PasajeroService pasajeroService;
    @GetMapping("/listarPasajeros")
    public List<Pasajero> listarPasajero(){
    	return pasajeroService.listarPasajeros();
    }

}
