package com.example.demo.builder;

import java.time.LocalDateTime;

import com.example.demo.model.Conductor;
import com.example.demo.model.EstadoViaje;
import com.example.demo.model.Viaje;

public class ViajeDirector {
	private final Conductor conductor;

    public ViajeDirector(Conductor conductor) {
        this.conductor = conductor;
    }

    // 🔹 Viaje desde la U al barrio Mutis
    public Viaje construirViajeUMutis() {
        return Viaje.builder()
                .conductor(conductor)
                .origen("Universidad")
                .destino("Barrio Mutis")
                .horaSalida(LocalDateTime.now().plusMinutes(10))
                .cuposMaximos(4)
                .estadoViaje(EstadoViaje.ENCURSO)
                .build();
    }

    // 🔹 Viaje desde la U al barrio La Cumbre
    public Viaje construirViajeUCumbre() {
        return Viaje.builder()
                .conductor(conductor)
                .origen("Universidad")
                .destino("Barrio La Cumbre")
                .horaSalida(LocalDateTime.now().plusMinutes(15))
                .cuposMaximos(3)
                .estadoViaje(EstadoViaje.ENCURSO)
                .build();
    }

    // 🔹 Otro tipo de viaje
    public Viaje construirViajePersonalizado(String origen, String destino, int cupos) {
        return Viaje.builder()
                .conductor(conductor)
                .origen(origen)
                .destino(destino)
                .horaSalida(LocalDateTime.now().plusMinutes(5))
                .cuposMaximos(cupos)
                .estadoViaje(EstadoViaje.ENCURSO)
                .build();
    }
}
