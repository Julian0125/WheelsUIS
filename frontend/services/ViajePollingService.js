// services/ViajePollingService.js

class ViajePollingServiceClass {
    constructor() {
        this.intervalId = null;
        this.viajeActualId = null;
    }

    // Iniciar monitoreo de un viaje
    iniciarMonitoreo(idViaje, onViajeIniciado) {
        // Si ya está monitoreando este viaje, no hacer nada
        if (this.intervalId && this.viajeActualId === idViaje) {
            console.log('⚠️ Ya se está monitoreando el viaje', idViaje);
            return;
        }

        // Detener cualquier monitoreo previo
        this.detenerMonitoreo();

        this.viajeActualId = idViaje;
        console.log('🔄 Iniciando monitoreo del viaje', idViaje);

        // Verificar inmediatamente
        this.verificarEstadoViaje(idViaje, onViajeIniciado);

        // Luego verificar cada 30 segundos
        this.intervalId = setInterval(() => {
            this.verificarEstadoViaje(idViaje, onViajeIniciado);
        }, 30000); // 30 segundos
    }

    // Verificar el estado del viaje
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

                if (mensaje.includes('ha iniciado')) {
                    console.log('✅ ¡Viaje iniciado automáticamente!');
                    callback && callback(true, mensaje);
                    this.detenerMonitoreo();
                } else {
                    console.log('⏳ Viaje aún no puede iniciar');
                    callback && callback(false, mensaje);
                }
            } else {
                const error = await response.text();
                console.log('❌ Error al verificar viaje:', error);
            }
        } catch (error) {
            console.error('❌ Error en verificarEstadoViaje:', error);
        }
    }

    // Detener monitoreo
    detenerMonitoreo() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.viajeActualId = null;
            console.log('⏹️ Monitoreo detenido');
        }
    }

    // Verificar si está monitoreando
    estaMonitoreando() {
        return this.intervalId !== null;
    }

    // Obtener ID del viaje actual
    obtenerViajeActual() {
        return this.viajeActualId;
    }
}

// Exportar una instancia única (Singleton)
const ViajePollingService = new ViajePollingServiceClass();
export default ViajePollingService;