package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.demo.model.Conductor;
import com.example.demo.model.Pasajero;
import com.example.demo.model.Usuario;
import com.example.demo.repository.PasajeroRepository;
@CrossOrigin(origins = "http://localhost:8081")
@Service
public class PasajeroService {
	@Autowired
	private PasajeroRepository pasajeroRepsoitory;
	//listar pasajeros
	public List<Pasajero> listarPasajeros(){
		return pasajeroRepsoitory.findAll();
	}

}
