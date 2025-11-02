package com.example.demo.DTO;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrearViaje {
	private int idConductor;
    private int cuposMaximos;
    private LocalDateTime horaSalida;
    private String origen;
    private String destino;
}
