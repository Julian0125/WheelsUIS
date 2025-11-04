package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Conductor;
import com.example.demo.model.EstadoViaje;
import com.example.demo.model.Viaje;

public interface ViajeRepository extends JpaRepository<Viaje,Integer> {
	boolean existsByConductorAndEstadoViaje(Conductor conductor, EstadoViaje estadoViaje);

	Optional<Viaje> findByConductorIdAndEstadoViaje(int idConductor, EstadoViaje estadoViaje);
	List<Viaje> findByConductorIdAndEstadoViajeIn(int idConductor, List<EstadoViaje> estados);
	List<Viaje> findByPasajeros_IdAndEstadoViajeIn(int idPasajero, List<EstadoViaje> estados);
	Optional<Viaje> findByPasajeros_IdAndEstadoViaje(int idPasajero, EstadoViaje estadoViaje);	


}
