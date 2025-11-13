package com.example.demo.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
@Data

@AllArgsConstructor
public class RutasPredefinidas {
    private String origen;
    private String destino;
    private int cupos;
    private LocalDateTime horaSalida;
}
