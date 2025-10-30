package com.example.demo.DTO;

import java.util.List;

import com.example.demo.model.Coche;
import com.example.demo.model.Viaje;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Login {
    private String correo;
    private String contraseña;
}
