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
            console.error("Server URL:", HTTP_BASE_URL);
        } else {
            console.error("❌ Error:", error.message);
        }
        return Promise.reject(error);
    }
);

const UsuarioService = {
    
    registrar: async (usuario) => {
        try {
            console.log("🔄 Intentando registrar usuario...");
            
            const usuarioBackend = {
                nombre: usuario.nombre.trim(),
                codigo: parseInt(usuario.codigo),        
                celular: parseInt(usuario.celular),      
                correo: usuario.correo.trim().toLowerCase(),
                contraseña: usuario.contraseña,            
                tipo: usuario.tipoUsuario                
            };

            console.log("📤 Datos transformados para backend:", usuarioBackend);

            const response = await http.post('/usuario/registrar', usuarioBackend);
            
            return { 
                success: true, 
                message: 'Usuario registrado correctamente' 
            };
        } catch (error) {
            console.error("❌ Error en registro:", error);
            
            if (error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: 'Tiempo de espera agotado. Intenta nuevamente.'
                };
            }
            
            if (error.response) {
                // Extraer mensaje de error del backend
                let errorMsg = 'Error al registrar usuario';
                
                if (error.response.data) {
                    if (typeof error.response.data === 'string') {
                        errorMsg = error.response.data;
                    } else if (error.response.data.error) {
                        errorMsg = error.response.data.error;
                    } else if (error.response.data.message) {
                        errorMsg = error.response.data.message;
                    }
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
                error: 'Error inesperado al registrar usuario'
            };
        }
    },

    // Login
    login: async (correo, contraseña) => {
        try {
            console.log("🔄 Intentando login...");
            const response = await http.post('/usuario/login', {
                correo: correo.trim().toLowerCase(),
                contraseña: contraseña
            });
            
            return { 
                success: true, 
                data: response.data,
                usuario: response.data
            };
        } catch (error) {
            console.error("❌ Error en login:", error);
            
            if (error.response?.status === 400) {
                let errorMsg = 'Credenciales inválidas';
                
                if (typeof error.response.data === 'string') {
                    errorMsg = error.response.data;
                }
                
                return {
                    success: false,
                    error: errorMsg
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

    // Método 
    verificarConexion: async () => {
        try {
            const response = await http.get('/usuario/listarUsuario');
            return { 
                conectado: true, 
                url: HTTP_BASE_URL 
            };
        } catch (error) {
            return { 
                conectado: false, 
                url: HTTP_BASE_URL,
                error: error.message 
            };
        }
    }
};

export default UsuarioService;
export { HTTP_BASE_URL};