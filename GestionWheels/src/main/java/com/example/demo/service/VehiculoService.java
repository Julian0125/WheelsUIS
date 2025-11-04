package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.demo.model.Vehiculo;
import com.example.demo.model.Conductor;
import com.example.demo.repository.VehiculoRepository;
import com.example.demo.repository.ConductorRepository;
@CrossOrigin(origins = "http://localhost:8081")
@Service
public class VehiculoService {
	  @Autowired
	    private VehiculoRepository cocheRepository;

	    @Autowired
	    private ConductorRepository conductorRepository;

	    public Vehiculo registrarVehiculo(int idConductor, Vehiculo vehiculo) {
	        Conductor conductor = conductorRepository.findById(idConductor)
	                .orElseThrow(() -> new IllegalArgumentException("Conductor no encontrado"));
	        if (conductor.getVehiculo() != null) {
	            throw new IllegalArgumentException("El conductor ya tiene un vehículo registrado.");
	        }
	        conductor.setVehiculo(vehiculo);
	        vehiculo.setConductor(conductor);

	        cocheRepository.save(vehiculo);
	        conductorRepository.save(conductor);

	        return vehiculo;
	    }
	    
	    public Vehiculo obtenerVehiculoPorConductorId(int idConductor) {
	        Conductor conductor = conductorRepository.findById(idConductor)
	                .orElseThrow(() -> new IllegalArgumentException("Conductor no encontrado"));

	        Vehiculo vehiculo = cocheRepository.findByConductor(conductor);
	        if (vehiculo == null) {
	            throw new IllegalArgumentException("El conductor no tiene Vehiculo registrado");
	        }
	        return vehiculo;
	    }
}
