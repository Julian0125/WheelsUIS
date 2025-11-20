package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DTOcrearComentario {
    private int usuarioId;
    private String texto;
    private int viajeId;
}
