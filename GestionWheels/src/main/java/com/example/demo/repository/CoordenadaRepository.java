package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Coordenada;

public interface CoordenadaRepository  extends JpaRepository<Coordenada,Integer>{

}
