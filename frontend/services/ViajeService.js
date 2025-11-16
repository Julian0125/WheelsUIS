import { HTTP_BASE_URL } from './urls';

const ViajeService = {
    // Crear viaje predefinido
    crearViajePredefinido: async (idConductor, tipoViaje) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/crear/${tipoViaje}?idConductor=${idConductor}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const viaje = await response.json();
                return { success: true, data: viaje };
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            console.error('Error al crear viaje:', error);
            return { success: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    // Iniciar viaje manualmente
    iniciarViaje: async (idViaje) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/${idViaje}/iniciar`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const mensaje = await response.text();
                return { success: true, message: mensaje };
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            console.error('Error al iniciar viaje:', error);
            return { success: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    // Obtener historial del conductor
    obtenerHistorialConductor: async (idConductor) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/conductor/${idConductor}/historial`
            );

            if (response.ok) {
                const viajes = await response.json();
                return { success: true, data: viajes };
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            console.error('Error al obtener historial:', error);
            return { success: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    // Obtener historial del pasajero
    obtenerHistorialPasajero: async (idPasajero) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/pasajero/${idPasajero}/historial`
            );

            if (response.ok) {
                const viajes = await response.json();
                return { success: true, data: viajes };
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            console.error('Error al obtener historial:', error);
            return { success: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    // Obtener viaje actual del conductor
    obtenerViajeActualConductor: async (idConductor) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/conductor/${idConductor}/actual`
            );

            if (response.ok) {
                const viaje = await response.json();
                return { success: true, data: viaje };
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            console.error('Error al obtener viaje actual:', error);
            return { success: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    // Obtener viaje actual del pasajero
    obtenerViajeActualPasajero: async (idPasajero) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/pasajero/${idPasajero}/actual`
            );

            if (response.ok) {
                const viaje = await response.json();
                return { success: true, data: viaje };
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            console.error('Error al obtener viaje actual:', error);
            return { success: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    // Aceptar viaje como pasajero
    aceptarViaje: async (idViaje, idPasajero) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/aceptar?idViaje=${idViaje}&idPasajero=${idPasajero}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const viaje = await response.json();
                return { success: true, data: viaje };
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            console.error('Error al aceptar viaje:', error);
            return { success: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    // Cancelar viaje
    cancelarViaje: async (idViaje, idUsuario, tipo) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/${idViaje}/cancelar`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        idUsuario,
                        tipo
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const error = await response.json();
                return { success: false, error: error.error || 'Error al cancelar viaje' };
            }
        } catch (error) {
            console.error('Error al cancelar viaje:', error);
            return { success: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    // Finalizar viaje
    finalizarViaje: async (idViaje, idConductor) => {
        try {
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/finalizar/${idViaje}/${idConductor}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const viaje = await response.json();
                return { success: true, data: viaje };
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            console.error('Error al finalizar viaje:', error);
            return { success: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    // Formatear fecha para mostrar
    formatearFecha: (fechaISO) => {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Obtener texto del estado del viaje
    obtenerEstadoTexto: (estado) => {
        const estados = {
            'CREADO': 'Creado',
            'ENCURSO': 'En curso',
            'EN_CURSO': 'En curso',
            'FINALIZADO': 'Finalizado',
            'COMPLETADO': 'Completado',
            'CANCELADO': 'Cancelado'
        };
        return estados[estado] || estado;
    },

    // Obtener color del estado
    obtenerColorEstado: (estado) => {
        const colores = {
            'CREADO': '#FFC107',
            'ENCURSO': '#2196F3',
            'EN_CURSO': '#2196F3',
            'FINALIZADO': '#4CAF50',
            'COMPLETADO': '#4CAF50',
            'CANCELADO': '#F44336'
        };
        return colores[estado] || '#999';
    }
};

export default ViajeService;