package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Mensaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contenido;
    private LocalDateTime fechaEnvio = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"viajes", "viajeActual", "vehiculo"})
    private Usuario autor;

    @ManyToOne
    @JoinColumn(name = "chat_id")
    @JsonBackReference
    private Chat chat;
}
