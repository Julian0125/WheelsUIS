import { HTTP_BASE_URL } from './urls';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* 🧩 Normalizador global para evitar errores de tiempo y estado */
function normalizarViaje(v) {
    if (!v) return null;

    return {
        ...v,
        estadoViaje: (v.estadoViaje || "").replace("_", "").toUpperCase(),
        horaSalida: v.horaSalida ? new Date(v.horaSalida).toISOString() : null,
        horaCreacion: v.horaCreacion ? new Date(v.horaCreacion).toISOString() : null,
        pasajeros: Array.isArray(v.pasajeros) ? v.pasajeros : [],
        cuposMaximos: v.cuposMaximos ?? 0
    };
}

const ViajeService = {
    // ===================================================
    // STORAGE
    // ===================================================
    guardarViajeActual: async (viaje) => {
        try {
            await AsyncStorage.setItem('viajeActual', JSON.stringify(viaje));
            console.log('✅ Viaje guardado en AsyncStorage:', viaje.id);
            return true;
        } catch (error) {
            console.error('Error al guardar viaje:', error);
            return false;
        }
    },

    obtenerViajeDesdeStorage: async () => {
        try {
            const viajeGuardado = await AsyncStorage.getItem('viajeActual');
            if (viajeGuardado) {
                const viaje = normalizarViaje(JSON.parse(viajeGuardado));
                return viaje;
            }
            return null;
        } catch (error) {
            console.error('Error al obtener viaje desde storage:', error);
            return null;
        }
    },

    limpiarViajeActual: async () => {
        try {
            await AsyncStorage.removeItem('viajeActual');
            return true;
        } catch (error) {
            console.error('Error al limpiar storage:', error);
            return false;
        }
    },

    obtenerViajeActualConductor: async (idConductor) => {
        try {
            // 1️⃣ Intentar leer desde almacenamiento local (rápido)
            const local = await ViajeService.obtenerViajeDesdeStorage();

            if (local && (local.estadoViaje === "CREADO" || local.estadoViaje === "ENCURSO")) {
                return { success: true, data: local };
            }

            // 2️⃣ Consultar SOLO la ruta que SÍ funciona = /api/conductor/listar
            console.log("🔍 Buscando viaje actual en /api/conductor/listar ...");

            const res = await fetch(`${HTTP_BASE_URL}/api/conductor/listar`);
            if (!res.ok) {
                await ViajeService.limpiarViajeActual();
                return { success: false, error: "No hay viaje activo" };
            }

            const lista = await res.json();
            const conductor = lista.find(c => c.id === idConductor);

            // 3️⃣ Si no existe o no tiene viajeActual → nada activo
            if (!conductor || !conductor.viajeActual) {
                await ViajeService.limpiarViajeActual();
                return { success: false, error: "No hay viaje activo" };
            }

            const viaje = normalizarViaje(conductor.viajeActual);

            // 4️⃣ Validar estado
            if (viaje.estadoViaje !== "CREADO" && viaje.estadoViaje !== "ENCURSO") {
                await ViajeService.limpiarViajeActual();
                return { success: false, error: "No hay viaje activo" };
            }

            // 5️⃣ Guardar cache
            await ViajeService.guardarViajeActual(viaje);

            return { success: true, data: viaje };

        } catch (error) {
            console.error("❌ Error obtenerViajeActualConductor:", error);
            return { success: false, error: "Error al obtener viaje actual" };
        }
    },



    // ===================================================
    // CREAR VIAJE PREDEFINIDO
    // ===================================================
    crearViajePredefinido: async (idConductor, tipoViaje) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/crear/${tipoViaje}?idConductor=${idConductor}`,
                { method: "POST", headers: { "Content-Type": "application/json" } }
            );

            if (response.ok) {
                const viaje = normalizarViaje(await response.json());
                await ViajeService.guardarViajeActual(viaje);
                return { success: true, data: viaje };
            }

            return { success: false, error: await response.text() };
        } catch (error) {
            console.error("Error al crear viaje:", error);
            return { success: false, error: "No se pudo conectar con el servidor" };
        }
    },

    // ===================================================
    // INICIAR VIAJE
    // ===================================================
    iniciarViaje: async (idViaje) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/${idViaje}/iniciar`,
                { method: "PUT", headers: { "Content-Type": "application/json" } }
            );

            if (response.ok) {
                const mensaje = await response.text();
                const viaje = await ViajeService.obtenerViajeDesdeStorage();

                if (viaje && viaje.id === idViaje) {
                    viaje.estadoViaje = "ENCURSO";
                    await ViajeService.guardarViajeActual(viaje);
                }

                return { success: true, message: mensaje };
            }

            return { success: false, error: await response.text() };
        } catch (error) {
            console.error("Error al iniciar viaje:", error);
            return { success: false, error: "No se pudo conectar con el servidor" };
        }
    },

    // ===================================================
    // HISTORIAL DE CONDUCTOR
    // ===================================================
    obtenerHistorialConductor: async (idConductor) => {
        try {
            const response = await fetch(`${HTTP_BASE_URL}/viaje/conductor/${idConductor}/historial`);
            if (!response.ok) return { success: false, error: await response.text() };

            const viajes = await response.json();
            return {
                success: true,
                data: viajes.map(v => normalizarViaje(v))
            };
        } catch (error) {
            console.error("Error historial conductor:", error);
            return { success: false, error: "No se pudo conectar con el servidor" };
        }
    },

    // ===================================================
    // HISTORIAL DEL PASAJERO
    // ===================================================
    obtenerHistorialPasajero: async (idPasajero) => {
        try {
            const response = await fetch(`${HTTP_BASE_URL}/viaje/pasajero/${idPasajero}/historial`);
            if (!response.ok) return { success: false, error: await response.text() };

            const viajes = await response.json();
            return {
                success: true,
                data: viajes.map(v => normalizarViaje(v))
            };
        } catch (error) {
            console.error("Error historial pasajero:", error);
            return { success: false, error: "No se pudo conectar con el servidor" };
        }
    },

    // ===================================================
    // CANCELAR VIAJE
    // ===================================================
    cancelarViaje: async (idViaje, idUsuario, tipo) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/${idViaje}/cancelar`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idUsuario, tipo })
                }
            );

            if (response.ok) {
                const data = await response.json();
                await ViajeService.limpiarViajeActual();
                return { success: true, data };
            }

            const error = await response.json();
            return { success: false, error: error.error || "Error al cancelar viaje" };
        } catch (error) {
            console.error("Error cancelar viaje:", error);
            return { success: false, error: "No se pudo conectar con el servidor" };
        }
    },

    // ===================================================
    // FINALIZAR VIAJE
    // ===================================================
    finalizarViaje: async (idViaje, idConductor) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/finalizar/${idViaje}/${idConductor}`,
                { method: "POST", headers: { "Content-Type": "application/json" } }
            );

            if (response.ok) {
                const viaje = normalizarViaje(await response.json());
                await ViajeService.limpiarViajeActual();
                return { success: true, data: viaje };
            }

            return { success: false, error: await response.text() };
        } catch (error) {
            console.error("Error finalizar viaje:", error);
            return { success: false, error: "No se pudo conectar con el servidor" };
        }
    },

    // ===================================================
    // UTILIDADES
    // ===================================================
    formatearFecha: (fechaISO) => {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    },

    obtenerEstadoTexto: (estado) => {
        const estados = {
            CREADO: "Creado",
            ENCURSO: "En curso",
            FINALIZADO: "Finalizado",
            COMPLETADO: "Completado",
            CANCELADO: "Cancelado"
        };
        return estados[estado] || estado;
    },

    obtenerColorEstado: (estado) => {
        const colores = {
            CREADO: "#FFC107",
            ENCURSO: "#2196F3",
            FINALIZADO: "#4CAF50",
            COMPLETADO: "#4CAF50",
            CANCELADO: "#F44336"
        };
        return colores[estado] || "#999";
    }
};

export default ViajeService;
