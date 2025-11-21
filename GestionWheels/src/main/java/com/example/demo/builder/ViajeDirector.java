package com.example.demo.builder;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

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
        return 4; // Por defecto si no es moto
    }


// ================================
    // 🔹 VIAJES DESDE LA UNIVERSIDAD
    // ================================

    public Viaje construirViajeUMutis() {
        return Viaje.builder()
                .conductor(conductor)
                .origen("Universidad")
                .destino("Barrio Mutis")
                .horaSalida(OffsetDateTime.now(ZoneOffset.of("-05:00")).plusMinutes(15))
                .cuposMaximos(obtenerCuposPorVehiculo())
                .estadoViaje(EstadoViaje.CREADO)
                .build();
    }

    public Viaje construirViajeUCumbre() {
        return Viaje.builder()
                .conductor(conductor)
                .origen("Universidad")
                .destino("Barrio La Cumbre")
                .horaSalida(OffsetDateTime.now(ZoneOffset.of("-05:00")).plusMinutes(15))
                .cuposMaximos(obtenerCuposPorVehiculo())
                .estadoViaje(EstadoViaje.CREADO)
                .build();
    }

    // ================================
    // 🔹 VIAJES DE REGRESO (BARRIO → UNIVERSIDAD)
    // ================================

    public Viaje construirViajeMutisU() {
        return Viaje.builder()
                .conductor(conductor)
                .origen("Barrio Mutis")
                .destino("Universidad")
                .horaSalida(OffsetDateTime.now(ZoneOffset.of("-05:00")).plusMinutes(15))
                .cuposMaximos(obtenerCuposPorVehiculo())
                .estadoViaje(EstadoViaje.CREADO)
                .build();
    }

    public Viaje construirViajeCumbreU() {
        return Viaje.builder()
                .conductor(conductor)
                .origen("Barrio La Cumbre")
                .destino("Universidad")
                .horaSalida(OffsetDateTime.now(ZoneOffset.of("-05:00")).plusMinutes(15))
                .cuposMaximos(obtenerCuposPorVehiculo())
                .estadoViaje(EstadoViaje.CREADO)
                .build();
    }


}
