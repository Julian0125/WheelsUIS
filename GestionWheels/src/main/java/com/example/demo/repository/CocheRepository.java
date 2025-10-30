package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Coche;


public interface CocheRepository extends JpaRepository <Coche,Integer> {

}
