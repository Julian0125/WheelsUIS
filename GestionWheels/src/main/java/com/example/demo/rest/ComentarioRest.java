package com.example.demo.rest;

import com.example.demo.DTO.DTOcrearComentario;
import com.example.demo.model.Comentario;
import com.example.demo.service.ComentarioService;
import com.example.demo.service.PasajeroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comentario")
@CrossOrigin(origins = "*")
public class ComentarioRest {
    @Autowired
    private ComentarioService comentarioService;
    @PostMapping("/viaje/{idViaje}")
    public Comentario crear(@PathVariable int idViaje,
                            @RequestBody DTOcrearComentario dto) {
        return comentarioService.crearComentario(idViaje, dto);
    }

}
