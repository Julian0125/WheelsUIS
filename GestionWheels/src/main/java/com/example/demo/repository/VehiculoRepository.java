package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Vehiculo;
import com.example.demo.model.Conductor;


public interface VehiculoRepository extends JpaRepository <Vehiculo,Integer> {
	Vehiculo findByConductor(Conductor conductor);
}
