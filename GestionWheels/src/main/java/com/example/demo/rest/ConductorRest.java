package com.example.demo.rest;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Conductor;

import com.example.demo.service.ConductorService;
@RestController
@RequestMapping("/api/conductor")
public class ConductorRest {
	@Autowired
	private ConductorService conductorService;
    @GetMapping("/listar")
    public List<Conductor> listarconductores(){
    	return conductorService.listarConductores();
    }
}
