package com.example.demo.DTO;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
public class RutasPredefinidas {
    private String origen;
    private String destino;
    private int cupos;
    private LocalDateTime horaSalida;
}
