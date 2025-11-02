package com.example.demo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "comentario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comentario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String texto;
    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "viaje_id")
    private Viaje viaje;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario; // quién comentó (puede ser pasajero o conductor)
}
