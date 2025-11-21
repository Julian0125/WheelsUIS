import { HTTP_BASE_URL } from './urls';


const convertirFechaLocal = (fechaISO) => {
    try {
        if (!fechaISO) return null;
       
        return new Date(fechaISO);
    } catch {
        return null; 
    }
};


/**
 * Servicio para manejar búsqueda y reserva de viajes
 */
const ViajesDisponiblesService = {

    /**
     * Obtiene viajes CREADOS con cupos disponibles
     * compensando errores del backend
     */
    obtenerViajesDisponibles: async () => {
        try {
            console.log("🔍 Buscando viajes disponibles…");

            const response = await fetch(`${HTTP_BASE_URL}/api/conductor/listar`);

            if (!response.ok) {
                throw new Error("Error al obtener conductores");
            }

            const conductores = await response.json();

            const viajes = conductores
                .filter(c => c.viajeActual)
                .map(c => {
                    const v = c.viajeActual;

                    const horaLocal = convertirFechaLocal(v.horaSalida);

                    const ocupados = v.pasajeros?.length || 0;
                    const disponibles = Math.max((v.cuposMaximos || 0) - ocupados, 0);

                    return {
                        id: v.id,
                        origen: v.origen,
                        destino: v.destino,
                        horaSalida: horaLocal,
                        cuposMaximos: v.cuposMaximos || 0,
                        cuposOcupados: ocupados,
                        cuposDisponibles: disponibles,
                        estadoViaje: v.estadoViaje,
                        conductor: {
                            id: c.id,
                            nombre: c.nombre,
                            celular: c.celular
                        },
                        vehiculo: c.vehiculo || null,
                        pasajeros: v.pasajeros || []
                    };
                })
                .filter(v =>
                    v.estadoViaje === "CREADO" &&
                    v.cuposDisponibles > 0
                );

            return { success: true, data: viajes };

        } catch (error) {
            console.error("❌ Error:", error);
            return {
                success: false,
                error: "No se pudieron cargar los viajes disponibles"
            };
        }
    },


    /**
     * Pasajero se une al viaje
     */
    unirseAViaje: async (idViaje, idPasajero) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/aceptar?idViaje=${idViaje}&idPasajero=${idPasajero}`,
                { method: "POST" }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Error al unirse');
            }

            const data = await response.json();

            // Convertimos hora a local
            if (data.horaSalida) {
                data.horaSalida = convertirFechaLocal(data.horaSalida);
            }

            return {
                success: true,
                data,
                message: "Te has unido al viaje"
            };

        } catch (error) {
            console.error("❌ Unirse error:", error);

            let msg = "No se pudo unir al viaje";

            const em = (error && error.message) ? error.message : '';

            if (em.toLowerCase().includes("cupos")) msg = "No hay cupos disponibles";
            else if (em.toLowerCase().includes("ya está")) msg = "Ya estás en este viaje";
            else if (em.toLowerCase().includes("pasajero no encontrado")) msg = "Error de autenticación. Cierra sesión e inicia de nuevo";

            return { success: false, error: msg };
        }
    },


    /**
     * Verifica si un pasajero tiene viaje activo
     * (CORREGIDO: CREADO TAMBIÉN ES ACTIVO)
     */
    verificarViajeActivo: async (idPasajero) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/pasajero/${idPasajero}/actual`
            );

            if (!response.ok) {
                return {
                    success: true,
                    tieneViajeActivo: false,
                    data: null
                };
            }

            const viaje = await response.json();

            // Convertimos hora a local
            if (viaje.horaSalida) {
                viaje.horaSalida = convertirFechaLocal(viaje.horaSalida);
            }

            // ✔ Viaje ACTIVO = CREADO O ENCURSO
            const activo = ["CREADO", "ENCURSO"].includes(viaje.estadoViaje);

            return {
                success: true,
                tieneViajeActivo: activo,
                data: viaje
            };

        } catch (error) {
            console.error("Error verificarViajeActivo:", error);
            return {
                success: false,
                error: "No se pudo verificar el viaje",
                data: null
            };
        }
    },


    /**
     * Formatea hora de salida
     */
    formatearHoraSalida: (fecha) => {
    const f = fecha instanceof Date ? fecha : convertirFechaLocal(fecha);
    if (!f) return "";
    return f.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Bogota",
    });
},

    obtenerIconoVehiculo: (tipo) => {
        const t = (tipo || "").toUpperCase();
        if (t === "MOTO") return "bicycle";
        return "car-sport";
    }
};

export default ViajesDisponiblesService;
