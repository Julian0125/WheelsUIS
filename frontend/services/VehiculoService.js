import axios from "axios";
import { HTTP_BASE_URL } from "./urls";

// Crear instancia de axios
const http = axios.create({
    baseURL: HTTP_BASE_URL,
    timeout: 40000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para REQUEST
http.interceptors.request.use(
    (config) => {
        console.log("Request:", config.method.toUpperCase(), config.url);
        console.log("Data:", JSON.stringify(config.data, null, 2));
        return config;
    },
    (error) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
    }
);

// Interceptor para RESPONSE
http.interceptors.response.use(
    (response) => {
        console.log("Response:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error("Timeout - El servidor no respondió a tiempo");
        } else if (error.response) {
            console.error("API Error:", error.response.status);
            console.error("Error Data:", error.response.data);
        } else if (error.request) {
            console.error("No Response - Verifica la conexión al servidor");
            console.error("Server URL:", HTTP_BASE_URL);
        } else {
            console.error("Error:", error.message);
        }
        return Promise.reject(error);
    }
);

const VehiculoService = {
    
    // Registrar vehículo
    registrar: async (conductorId, vehiculo) => {
        try {
            console.log("Intentando registrar vehículo...");
            
            const vehiculoData = {
                placa: vehiculo.placa.toUpperCase().trim(),
                marca: vehiculo.marca.trim(),
                modelo: vehiculo.modelo.trim(),
                tipo: vehiculo.tipo
            };

            console.log("Datos del vehículo:", vehiculoData);

            const response = await http.post(`/vehiculos/registrar/${conductorId}`, vehiculoData);
            
            return { 
                success: true, 
                data: response.data,
                message: 'Vehículo registrado correctamente' 
            };
        } catch (error) {
            console.error("Error al registrar vehículo:", error);
            
            if (error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: 'Tiempo de espera agotado. Intenta nuevamente.'
                };
            }
            
            if (error.response) {
                let errorMsg = 'Error al registrar vehículo';
                
                if (typeof error.response.data === 'string') {
                    errorMsg = error.response.data;
                } else if (error.response.data?.message) {
                    errorMsg = error.response.data.message;
                }
                
                return {
                    success: false,
                    error: errorMsg
                };
            }
            
            if (error.request) {
                return {
                    success: false,
                    error: 'No se pudo conectar al servidor. Verifica tu conexión.'
                };
            }
            
            return {
                success: false,
                error: 'Error inesperado al registrar vehículo'
            };
        }
    },

    // Obtener vehículo por conductor
    obtenerPorConductor: async (conductorId) => {
        try {
            console.log("🔄 Obteniendo vehículo del conductor...");
            const response = await http.get(`/vehiculos/conductor/${conductorId}`);
            
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error("Error al obtener vehículo:", error);
            
            if (error.response?.status === 400) {
                // No tiene vehículo registrado
                return {
                    success: true,
                    data: null
                };
            }
            
            return {
                success: false,
                error: error.response?.data || 'Error al obtener vehículo'
            };
        }
    }
};

export default VehiculoService;
