package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Conductor;
import com.example.demo.model.EstadoViaje;
import com.example.demo.model.Viaje;

public interface ViajeRepository extends JpaRepository<Viaje,Integer> {
	boolean existsByConductorAndEstadoViaje(Conductor conductor, EstadoViaje estadoViaje);
}
