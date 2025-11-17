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

        // Verificación periódica cada 15 segundos
        this.intervalId = setInterval(() => {
            this.verificarEstadoViaje(idViaje, onViajeIniciado);
        }, 15000);
    }

    async verificarEstadoViaje(idViaje, callback) {
        try {
            console.log('🔍 Verificando estado del viaje', idViaje);

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
                console.log('📨 Respuesta del servidor:', mensaje);

                // Resetear contador de intentos fallidos
                this.intentosFallidos = 0;

                if (mensaje.includes('ha iniciado')) {
                    console.log('✅ ¡Viaje iniciado automáticamente!');
                    callback && callback(true, mensaje);
                    this.detenerMonitoreo();
                } else {
                    console.log('⏳ Viaje aún no puede iniciar:', mensaje);
                    callback && callback(false, mensaje);
                }
            } else if (response.status === 500 || response.status === 400) {
                // ⚠️ Error del servidor - NO detener el monitoreo
                this.intentosFallidos++;

                const errorText = await response.text();
                console.log(`⚠️ Error ${response.status} del servidor:`, errorText);
                console.log(`⏳ Intento fallido ${this.intentosFallidos}/${this.maxIntentosAntesDePausar}`);

                // Si hay muchos errores consecutivos, aumentar el intervalo
                if (this.intentosFallidos >= this.maxIntentosAntesDePausar) {
                    console.log('⏸️ Pausando verificaciones frecuentes debido a errores...');
                    // Aumentar intervalo a 30 segundos después de varios errores
                    this.detenerMonitoreo();
                    this.intervalId = setInterval(() => {
                        this.verificarEstadoViaje(idViaje, callback);
                    }, 30000);
                }

                callback && callback(false, 'El viaje aún no puede iniciar. Verificando automáticamente...');
            } else {
                const error = await response.text();
                console.log('❌ Error inesperado:', error);
                callback && callback(false, 'Error al verificar viaje');
            }
        } catch (error) {
            console.error('❌ Error en verificarEstadoViaje:', error);
            this.intentosFallidos++;

            // No detener el monitoreo por errores de red
            console.log(`⏳ Error de red. Reintentando... (${this.intentosFallidos}/${this.maxIntentosAntesDePausar})`);

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