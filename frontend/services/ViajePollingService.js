// services/ViajePollingService.js

class ViajePollingServiceClass {
    constructor() {
        this.intervalId = null;
        this.viajeActualId = null;
    }

    iniciarMonitoreo(idViaje, onViajeIniciado) {
        if (this.intervalId && this.viajeActualId === idViaje) {
            console.log('⚠️ Ya se está monitoreando el viaje', idViaje);
            return;
        }

        this.detenerMonitoreo();

        this.viajeActualId = idViaje;
        console.log('🔄 Iniciando monitoreo del viaje', idViaje);

        this.verificarEstadoViaje(idViaje, onViajeIniciado);

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

                if (mensaje.includes('ha iniciado')) {
                    console.log('✅ ¡Viaje iniciado automáticamente!');
                    callback && callback(true, mensaje);
                    this.detenerMonitoreo();
                } else {
                    console.log('⏳ Viaje aún no puede iniciar:', mensaje);
                    callback && callback(false, mensaje);
                }
            } else if (response.status === 500) {
                const errorText = await response.text();
                console.error('❌ Error 500 del servidor:', errorText);

                // ⚠️ NO detener el monitoreo, seguir intentando
                console.log('⏳ Reintentando en 15 segundos...');
                callback && callback(false, 'Error del servidor, reintentando...');
            } else if (response.status === 400) {
                const error = await response.text();
                console.log('⏳ No se puede iniciar aún:', error);
                callback && callback(false, error);
            } else {
                const error = await response.text();
                console.log('❌ Error al verificar viaje:', error);
            }
        } catch (error) {
            console.error('❌ Error en verificarEstadoViaje:', error);
            // No detener el monitoreo por errores de red
        }
    }

    detenerMonitoreo() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.viajeActualId = null;
            console.log('⏹️ Monitoreo detenido');
        }
    }

    estaMonitoreando() {
        return this.intervalId !== null;
    }

    obtenerViajeActual() {
        return this.viajeActualId;
    }
}

const ViajePollingService = new ViajePollingServiceClass();
export default ViajePollingService;