package com.example.demo.builder;

import java.time.LocalDateTime;

import com.example.demo.model.Conductor;
import com.example.demo.model.EstadoViaje;
import com.example.demo.model.TipoVehiculo;
import com.example.demo.model.Viaje;

public class ViajeDirector {
    private final Conductor conductor;

    public ViajeDirector(Conductor conductor) {
        this.conductor = conductor;
    }

    // Método auxiliar para determinar cupos según el tipo de vehículo
    private int obtenerCuposPorVehiculo() {
        if (conductor.getVehiculo() != null &&
                conductor.getVehiculo().getTipo() == TipoVehiculo.MOTO) {
            return 1;
        }
        return 3; // Por defecto si no es moto
    }


    // 🔹 Viaje desde la U al barrio Mutis
    public Viaje construirViajeUMutis() {
        return Viaje.builder()
                .conductor(conductor)
                .origen("Universidad")
                .destino("Barrio Mutis")
                .horaSalida(LocalDateTime.now().plusMinutes(15))
                .cuposMaximos(obtenerCuposPorVehiculo())
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
                .cuposMaximos(obtenerCuposPorVehiculo())
                .estadoViaje(EstadoViaje.ENCURSO)
                .build();
    }


}
