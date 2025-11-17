// services/ViajePollingService.js

class ViajePollingServiceClass {
    constructor() {
        this.intervalId = null;
        this.viajeActualId = null;
        this.intentosFallidos = 0;
        this.maxIntentosAntesDePausar = 3;
    }

    iniciarMonitoreo(idViaje, onViajeIniciado) {
        if (this.intervalId && this.viajeActualId === idViaje) {
            console.log('⚠️ Ya se está monitoreando el viaje', idViaje);
            return;
        }

        this.detenerMonitoreo();

        this.viajeActualId = idViaje;
        this.intentosFallidos = 0;
        console.log('🔄 Iniciando monitoreo del viaje', idViaje);

        // Primera verificación inmediata
        this.verificarEstadoViaje(idViaje, onViajeIniciado);

        // Verificación periódica cada 10 segundos
        this.intervalId = setInterval(() => {
            this.verificarEstadoViaje(idViaje, onViajeIniciado);
        }, 10000);
    }

    // 👉 Convertir siempre la fecha a hora local correcta
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

                    this.intentosFallidos = 0;

                    if (viaje.estadoViaje === 'ENCURSO') {
                        console.log('✅ ¡Viaje iniciado automáticamente!');
                        callback && callback(true, 'El viaje ha iniciado automáticamente');
                        this.detenerMonitoreo();
                        return;
                    }

                    if (viaje.estadoViaje === 'CREADO') {

                        const ahora = new Date();

                        // Convertir horaSalida a hora local REAL
                        const horaSalidaUTC = new Date(viaje.horaSalida);
                        const horaSalidaLocal = new Date(horaSalidaUTC.getTime() - (horaSalidaUTC.getTimezoneOffset() * 60000));

                        const minutosRestantes = Math.ceil((horaSalidaLocal - ahora) / 1000 / 60);


                        let mensaje = '';

                        if (minutosRestantes > 0) {
                            // ⏱️ Siempre mostrar 10 minutos exactos
                            mensaje = `El viaje iniciará en 10 minuto(s) o cuando se llenen los cupos (${viaje.pasajeros.length}/${viaje.cuposMaximos})`;
                        } else {
                            const minutosTranscurridos = Math.abs(minutosRestantes);

                            if (minutosTranscurridos >= 2) {
                                mensaje = 'El viaje debería iniciar en cualquier momento...';
                            } else {
                                mensaje = `Esperando 2 minutos desde la hora de salida (${2 - minutosTranscurridos} min restantes)`;
                            }
                        }

                        console.log('⏳', mensaje);
                        callback && callback(false, mensaje);
                        return;
                    }

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

    detenerMonitoreo() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.viajeActualId = null;
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
