import axios from "axios";
import { Platform } from "react-native";


const DEV_IP = '10.0.2.2'; 
const BASE_URL = Platform.select({
    ios: 'http://localhost:8080',
    android: `http://${DEV_IP}:8080`,
    default: 'http://localhost:8080',
});

// Crear instancia de axios
const http = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // Aumentado a 15 segundos para operaciones pesadas
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para REQUEST
http.interceptors.request.use(
    (config) => {
        console.log("📤 Request:", config.method.toUpperCase(), config.url);
        console.log("📦 Data:", JSON.stringify(config.data, null, 2));
        return config;
    },
    (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(error);
    }
);

// Interceptor para RESPONSE
http.interceptors.response.use(
    (response) => {
        console.log("📥 Response:", response.status);
        console.log("✅ Data:", JSON.stringify(response.data, null, 2));
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error("⏱️ Timeout - El servidor no respondió a tiempo");
        } else if (error.response) {
            console.error("🚫 API Error:", error.response.status);
            console.error("📄 Error Data:", error.response.data);
        } else if (error.request) {
            console.error("🔌 No Response - Verifica la conexión al servidor");
            console.error("Server URL:", BASE_URL);
        } else {
            console.error("❌ Error:", error.message);
        }
        return Promise.reject(error);
    }
);

// Servicio de Usuario
const UsuarioService = {
    // Registrar usuario
    registrar: async (usuario) => {
        try {
            console.log("🔄 Intentando registrar usuario...");
            const response = await http.post('/usuario/registrar', usuario);
            
            // El backend en registro exitoso
            return { 
                success: true, 
                message: 'Usuario registrado correctamente' 
            };
        } catch (error) {
            console.error("❌ Error en registro:", error);
            
            // Manejo específico de errores
            if (error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: 'Tiempo de espera agotado. Intenta nuevamente.'
                };
            }
            
            if (error.response) {
                // El servidor respondió con un error
                return {
                    success: false,
                    error: error.response.data || 'Error al registrar usuario'
                };
            }
            
            if (error.request) {
                // No hubo respuesta del servidor
                return {
                    success: false,
                    error: 'No se pudo conectar al servidor. Verifica tu conexión.'
                };
            }
            
            return {
                success: false,
                error: 'Error inesperado al registrar usuario'
            };
        }
    },

    // Login
    login: async (correo, contraseña) => {
        try {
            console.log("🔄 Intentando login...");
            const response = await http.post('/usuario/login', {
                correo,
                contraseña
            });
            
            return { 
                success: true, 
                data: response.data,
                usuario: response.data
            };
        } catch (error) {
            console.error("❌ Error en login:", error);
            
            if (error.response?.status === 400) {
                // Credenciales inválidas o usuario no aprobado
                return {
                    success: false,
                    error: error.response.data || 'Credenciales inválidas'
                };
            }
            
            if (error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: 'Tiempo de espera agotado. Intenta nuevamente.'
                };
            }
            
            return {
                success: false,
                error: 'Error al iniciar sesión. Verifica tu conexión.'
            };
        }
    },

    // Listar usuarios
    listarUsuarios: async () => {
        try {
            console.log("🔄 Listando usuarios...");
            const response = await http.get('/usuario/listarUsuario');
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error("❌ Error al listar usuarios:", error);
            return {
                success: false,
                error: error.response?.data || 'Error al listar usuarios'
            };
        }
    },

    // Aprobar usuario
    aprobarUsuario: async (token) => {
        try {
            console.log("🔄 Aprobando usuario...");
            const response = await http.get(`/usuario/aprobar?token=${token}`);
            return { 
                success: true, 
                message: response.data 
            };
        } catch (error) {
            console.error("❌ Error al aprobar usuario:", error);
            return {
                success: false,
                error: error.response?.data || 'Error al aprobar usuario'
            };
        }
    },

    // Rechazar usuario
    rechazarUsuario: async (token) => {
        try {
            console.log("🔄 Rechazando usuario...");
            const response = await http.get(`/usuario/rechazar?token=${token}`);
            return { 
                success: true, 
                message: response.data 
            };
        } catch (error) {
            console.error("❌ Error al rechazar usuario:", error);
            return {
                success: false,
                error: error.response?.data || 'Error al rechazar usuario'
            };
        }
    },

    // Método auxiliar para verificar conectividad
    verificarConexion: async () => {
        try {
            const response = await http.get('/usuario/listarUsuario');
            return { 
                conectado: true, 
                url: BASE_URL 
            };
        } catch (error) {
            return { 
                conectado: false, 
                url: BASE_URL,
                error: error.message 
            };
        }
    }
};

export default UsuarioService;
export { BASE_URL };