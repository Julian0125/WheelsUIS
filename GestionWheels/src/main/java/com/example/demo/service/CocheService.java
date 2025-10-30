package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Coche;
import com.example.demo.model.Conductor;
import com.example.demo.repository.CocheRepository;
import com.example.demo.repository.ConductorRepository;

@Service
public class CocheService {
	  @Autowired
	    private CocheRepository cocheRepository;

	    @Autowired
	    private ConductorRepository conductorRepository;

	    public Coche registrarCoche(int idConductor, Coche coche) {
	        Conductor conductor = conductorRepository.findById(idConductor)
	                .orElseThrow(() -> new IllegalArgumentException("Conductor no encontrado"));

	        conductor.setCarro(coche);
	        coche.setConductor(conductor);

	        cocheRepository.save(coche);
	        conductorRepository.save(conductor);

	        return coche;
	    }
}
