import axios from "axios";
import { Platform } from "react-native";


const DEV_IP = '10.0.2.2'; // Para emulador Android
const BASE_URL = Platform.select({
    ios: 'http://localhost:8080',
    android: `http://${DEV_IP}:8080`,
    default: 'http://localhost:8080',
})

const http = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers : {
        'Content-Type': 'application/json',
    }
});

// Interceptor para REQUEST (antes de enviar)
http.interceptors.request.use(
    (config) => {  // 
        console.log("Request:", config.method.toUpperCase(), config.url);
        console.log("Data:", config.data);
        return config; 
    },
    (error) => {
        console.error(" Request Error:", error);
        return Promise.reject(error);
    }
);

// Interceptor para RESPONSE (después de recibir)
http.interceptors.response.use(
    (response) => {
        console.log("Response:", response.status);
        console.log("Data:", response.data);
        return response;
    },
    (error) => {
        console.error("API Error:", error?.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Servicio de Usuario
const UsuarioService = {
    // Registrar usuario
    registrar: async (usuario) => {
        try {
            const response = await http.post('/usuario/registrar', usuario);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || 'Error al registrar usuario'
            };
        }
    },

    // Login
    login: async (correo, contraseña) => {
        try {
            const response = await http.post('/usuario/login', {
                correo,
                contraseña
            });
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || 'Credenciales inválidas'
            };
        }
    },

    // Listar usuarios
    listarUsuarios: async () => {
        try {
            const response = await http.get('/usuario/listarUsuario');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || 'Error al listar usuarios'
            };
        }
    },

    // Aprobar usuario
    aprobarUsuario: async (token) => {
        try {
            const response = await http.get(`/usuario/aprobar?token=${token}`);
            return { success: true, message: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || 'Error al aprobar usuario'
            };
        }
    },

    // Rechazar usuario
    rechazarUsuario: async (token) => {
        try {
            const response = await http.get(`/usuario/rechazar?token=${token}`);
            return { success: true, message: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || 'Error al rechazar usuario'
            };
        }
    }
};

export default UsuarioService;