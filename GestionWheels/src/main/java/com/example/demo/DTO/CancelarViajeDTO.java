package com.example.demo.DTO;

import com.example.demo.model.tipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CancelarViajeDTO {
    private int idUsuario;
    private tipoUsuario tipo; // Usa tu enum directamente
}