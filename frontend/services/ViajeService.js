import { HTTP_BASE_URL } from './urls';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViajeService = {
    // ✅ Guardar viaje en AsyncStorage
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

    // ✅ Obtener viaje desde AsyncStorage
    obtenerViajeDesdeStorage: async () => {
        try {
            const viajeGuardado = await AsyncStorage.getItem('viajeActual');
            if (viajeGuardado) {
                const viaje = JSON.parse(viajeGuardado);
                console.log('✅ Viaje recuperado de AsyncStorage:', viaje.id);
                return viaje;
            }
            return null;
        } catch (error) {
            console.error('Error al obtener viaje:', error);
            return null;
        }
    },

    // ✅ Limpiar viaje de AsyncStorage
    limpiarViajeActual: async () => {
        try {
            await AsyncStorage.removeItem('viajeActual');
            console.log('✅ Viaje limpiado de AsyncStorage');
            return true;
        } catch (error) {
            console.error('Error al limpiar viaje:', error);
            return false;
        }
    },

    // ✅ CORREGIDO: Buscar viaje activo consultando DIRECTAMENTE al conductor
    obtenerViajeActualConductor: async (idConductor) => {
        console.log('🔍 Buscando viaje activo para conductor:', idConductor);

        try {
            // Primero verificar AsyncStorage
            const viajeLocal = await ViajeService.obtenerViajeDesdeStorage();

            if (viajeLocal && (viajeLocal.estadoViaje === 'CREADO' || viajeLocal.estadoViaje === 'ENCURSO')) {
                console.log('✅ Viaje activo en AsyncStorage:', viajeLocal.id);
                return { success: true, data: viajeLocal };
            }

            // ✅ NUEVO: Consultar directamente al conductor para ver su viajeActual
            console.log('🌐 Consultando conductor en el backend...');
            const conductorResponse = await fetch(
                `${HTTP_BASE_URL}/api/conductor/listar`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (conductorResponse.ok) {
                const conductores = await conductorResponse.json();
                const conductor = conductores.find(c => c.id === idConductor);

                if (conductor && conductor.viajeActual) {
                    console.log('✅ Viaje actual encontrado en conductor:', conductor.viajeActual);

                    // Verificar que el viaje esté activo
                    if (conductor.viajeActual.estadoViaje === 'CREADO' ||
                        conductor.viajeActual.estadoViaje === 'ENCURSO') {
                        await ViajeService.guardarViajeActual(conductor.viajeActual);
                        return { success: true, data: conductor.viajeActual };
                    }
                }
            }

            // Si no encontró en conductor, intentar con historial
            console.log('🌐 Buscando en historial de viajes...');
            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/conductor/${idConductor}/historial`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const viajes = await response.json();
                console.log('📦 Viajes obtenidos del backend:', viajes.length);

                const viajesValidos = viajes.filter(v => v.estadoViaje !== null && v.estadoViaje !== undefined);

                console.log('🔍 Estados de todos los viajes:');
                viajesValidos.forEach((v, i) => {
                    console.log(`  Viaje ${i + 1} (ID: ${v.id}): estado="${v.estadoViaje}"`);
                });

                const viajeActivo = viajesValidos.find(v =>
                    v.estadoViaje === 'CREADO' || v.estadoViaje === 'ENCURSO'
                );

                if (viajeActivo) {
                    console.log('✅ Viaje activo encontrado en historial:', viajeActivo.id);
                    await ViajeService.guardarViajeActual(viajeActivo);
                    return { success: true, data: viajeActivo };
                }
            }

            console.log('ℹ️ No hay viajes activos');
            await ViajeService.limpiarViajeActual();
            return { success: false, error: 'No hay viaje activo' };

        } catch (error) {
            console.error('❌ Error al obtener viaje actual:', error);
            return { success: false, error: 'Error al obtener viaje actual' };
        }
    },

    // ✅ Crear viaje predefinido
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
                await ViajeService.guardarViajeActual(viaje);
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

    // ✅ Iniciar viaje manualmente
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

                const viajeActual = await ViajeService.obtenerViajeDesdeStorage();
                if (viajeActual && viajeActual.id === idViaje) {
                    viajeActual.estadoViaje = 'ENCURSO';
                    await ViajeService.guardarViajeActual(viajeActual);
                }

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

    // Obtener viaje actual del pasajero
    obtenerViajeActualPasajero: async (idPasajero) => {
        try {
            const viajeLocal = await ViajeService.obtenerViajeDesdeStorage();

            if (viajeLocal && viajeLocal.estadoViaje === 'ENCURSO') {
                return { success: true, data: viajeLocal };
            }

            const response = await fetch(
                `${HTTP_BASE_URL}/viaje/pasajero/${idPasajero}/historial`
            );

            if (response.ok) {
                const viajes = await response.json();
                const viajeActivo = viajes.find(v => v.estadoViaje === 'ENCURSO');

                if (viajeActivo) {
                    await ViajeService.guardarViajeActual(viajeActivo);
                    return { success: true, data: viajeActivo };
                }
            }

            await ViajeService.limpiarViajeActual();
            return { success: false, error: 'No hay viaje activo' };
        } catch (error) {
            console.error('Error al obtener viaje actual:', error);
            return { success: false, error: 'Error al obtener viaje actual' };
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
                await ViajeService.limpiarViajeActual();
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
                await ViajeService.limpiarViajeActual();
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