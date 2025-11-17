// services/ViajePollingService.js

class ViajePollingServiceClass {
    constructor() {
        this.intervalId = null;
        this.viajeActualId = null;
        this.intentosFallidos = 0;
        this.maxIntentosAntesDePausar = 3;
        this.horaCreacionViaje = null; // ✅ NUEVO: Guardamos la hora de creación
    }

    iniciarMonitoreo(idViaje, onViajeIniciado, horaCreacion = null) {
        if (this.intervalId && this.viajeActualId === idViaje) {
            console.log('⚠️ Ya se está monitoreando el viaje', idViaje);
            return;
        }

        this.detenerMonitoreo();

        this.viajeActualId = idViaje;
        this.intentosFallidos = 0;
        this.horaCreacionViaje = horaCreacion || new Date(); // ✅ Guardamos hora de creación

        console.log('🔄 Iniciando monitoreo del viaje', idViaje);
        console.log('⏰ Hora de creación:', this.horaCreacionViaje);

        // Primera verificación inmediata
        this.verificarEstadoViaje(idViaje, onViajeIniciado);

        // Verificación periódica cada 10 segundos
        this.intervalId = setInterval(() => {
            this.verificarEstadoViaje(idViaje, onViajeIniciado);
        }, 10000);
    }

    normalizarFecha(fechaISO) {
        if (!fechaISO) return null;
        return new Date(fechaISO);
    }

    async verificarEstadoViaje(idViaje, callback) {
        try {
            console.log('🔍 Verificando estado del viaje', idViaje);

            const response = await fetch(
                `https://wheelsuis.onrender.com/api/conductor/listar`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const conductores = await response.json();

                // Buscar el conductor que tenga este viaje activo
                const conductorConViaje = conductores.find(c =>
                    c.viajeActual && c.viajeActual.id === idViaje
                );

                if (conductorConViaje && conductorConViaje.viajeActual) {
                    const viaje = conductorConViaje.viajeActual;

                    console.log('📦 Estado del viaje:', viaje.estadoViaje);
                    console.log('👥 Pasajeros actuales:', viaje.pasajeros?.length || 0);
                    console.log('🎯 Cupos máximos:', viaje.cuposMaximos);

                    this.intentosFallidos = 0;

                    // ✅ Si ya está EN CURSO, notificar y detener
                    if (viaje.estadoViaje === 'ENCURSO') {
                        console.log('✅ ¡Viaje iniciado automáticamente!');
                        callback && callback(true, 'El viaje ha iniciado automáticamente');
                        this.detenerMonitoreo();
                        return;
                    }

                    // ✅ Si está CREADO, verificar condiciones de inicio
                    if (viaje.estadoViaje === 'CREADO') {
                        const ahora = new Date();
                        const horaCreacion = this.horaCreacionViaje || new Date(viaje.horaSalida);

                        // ✅ CALCULAR MINUTOS DESDE LA CREACIÓN
                        const minutosDesdeCreacion = Math.floor((ahora - horaCreacion) / 1000 / 60);

                        // ✅ VERIFICAR CUPOS
                        const cuposOcupados = viaje.pasajeros?.length || 0;
                        const cuposDisponibles = viaje.cuposMaximos - cuposOcupados;

                        console.log('⏱️ Minutos desde creación:', minutosDesdeCreacion);
                        console.log('👥 Cupos disponibles:', cuposDisponibles);

                        let mensaje = '';

                        // ✅ CONDICIÓN 1: CUPOS LLENOS
                        if (cuposDisponibles === 0) {
                            console.log('🎯 ¡Cupos llenos! Intentando iniciar viaje...');
                            const inicioExitoso = await this.intentarIniciarViaje(idViaje);

                            if (inicioExitoso) {
                                callback && callback(true, 'El viaje ha iniciado: cupos llenos');
                                this.detenerMonitoreo();
                                return;
                            } else {
                                mensaje = 'Cupos llenos. Esperando confirmación del servidor...';
                            }
                        }
                        // ✅ CONDICIÓN 2: 10 MINUTOS DESDE CREACIÓN
                        else if (minutosDesdeCreacion >= 10) {
                            console.log('⏰ ¡10 minutos transcurridos! Intentando iniciar viaje...');
                            const inicioExitoso = await this.intentarIniciarViaje(idViaje);

                            if (inicioExitoso) {
                                callback && callback(true, 'El viaje ha iniciado: tiempo cumplido');
                                this.detenerMonitoreo();
                                return;
                            } else {
                                mensaje = '10 minutos cumplidos. Esperando confirmación del servidor...';
                            }
                        }
                        // ⏳ AÚN NO SE CUMPLEN LAS CONDICIONES
                        else {
                            const minutosRestantes = 10 - minutosDesdeCreacion;
                            mensaje = `El viaje iniciará en ${minutosRestantes} minuto(s) o cuando se llenen los cupos (${cuposOcupados}/${viaje.cuposMaximos})`;
                        }

                        console.log('⏳', mensaje);
                        callback && callback(false, mensaje);
                        return;
                    }

                    // ✅ VIAJE FINALIZADO O CANCELADO
                    if (viaje.estadoViaje === 'FINALIZADO' || viaje.estadoViaje === 'CANCELADO') {
                        console.log('🏁 Viaje finalizado/cancelado');
                        this.detenerMonitoreo();
                        callback && callback(false, 'El viaje ha sido ' + viaje.estadoViaje.toLowerCase());
                        return;
                    }
                } else {
                    console.log('⚠️ No se encontró el viaje en los conductores activos');
                    this.intentosFallidos++;

                    if (this.intentosFallidos >= this.maxIntentosAntesDePausar) {
                        console.log('⚠️ Varios intentos fallidos. Es posible que el viaje no exista.');
                    }

                    callback && callback(false, 'Verificando estado del viaje...');
                    return;
                }
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error al verificar estado del viaje:', error);
            this.intentosFallidos++;

            console.log(`⏳ Error de conexión. Reintentando... (${this.intentosFallidos}/${this.maxIntentosAntesDePausar})`);

            callback && callback(false, 'Error de conexión. Reintentando...');
        }
    }

    // ✅ NUEVA FUNCIÓN: Intenta iniciar el viaje en el backend
    async intentarIniciarViaje(idViaje) {
        try {
            console.log('🚀 Intentando iniciar viaje en el servidor...');

            const response = await fetch(
                `https://wheelsuis.onrender.com/viaje/${idViaje}/iniciar`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const mensaje = await response.text();
                console.log('✅ Respuesta del servidor:', mensaje);
                return true;
            } else {
                const error = await response.text();
                console.log('⚠️ El servidor aún no permite iniciar:', error);
                return false;
            }
        } catch (error) {
            console.error('❌ Error al intentar iniciar viaje:', error);
            return false;
        }
    }

    detenerMonitoreo() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.viajeActualId = null;
            this.horaCreacionViaje = null;
            this.intentosFallidos = 0;
            console.log('⏹️ Monitoreo detenido');
        }
    }

    estaMonitoreando() {
        return this.intervalId !== null;
    }

    obtenerViajeActual() {
        return this.viajeActualId;
    }

    reiniciarContadorErrores() {
        this.intentosFallidos = 0;
    }
}

const ViajePollingService = new ViajePollingServiceClass();
export default ViajePollingService;