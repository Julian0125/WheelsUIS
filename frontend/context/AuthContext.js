import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ NUEVO: Cargar usuario desde AsyncStorage al iniciar
    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                const usuarioGuardado = await AsyncStorage.getItem('usuario');
                console.log('🔍 Cargando usuario desde AsyncStorage:', usuarioGuardado);

                if (usuarioGuardado) {
                    const usuarioParseado = JSON.parse(usuarioGuardado);
                    setUsuario(usuarioParseado);
                    console.log('✅ Usuario restaurado:', usuarioParseado);
                }
            } catch (error) {
                console.error('❌ Error al cargar usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarUsuario();
    }, []);

    // ✅ CORREGIDO: Ahora guarda en AsyncStorage
    const login = async (usuarioData) => {
        try {
            const tipoUsuario = usuarioData.tipoUsuario || usuarioData.tipo;

            if (!tipoUsuario) {
                console.warn('Usuario sin tipo definido:', usuarioData);
                throw new Error('Usuario sin tipo de usuario definido');
            }

            const usuarioNormalizado = {
                ...usuarioData,
                tipoUsuario: tipoUsuario,
                tipo: tipoUsuario,
            };

            console.log('💾 Guardando usuario en AsyncStorage:', usuarioNormalizado);

            // ✅ CRÍTICO: Limpiar primero y luego guardar
            await AsyncStorage.removeItem('usuario');
            await AsyncStorage.setItem('usuario', JSON.stringify(usuarioNormalizado));

            // Verificar que se guardó
            const verificacion = await AsyncStorage.getItem('usuario');
            console.log('✅ Usuario guardado y verificado:', verificacion);

            setUsuario(usuarioNormalizado);
            console.log('Login exitoso - Usuario en memoria:', usuarioNormalizado);
        } catch (error) {
            console.error('❌ Error al guardar usuario:', error);
            throw error;
        }
    };

    // ✅ CORREGIDO: Ahora limpia AsyncStorage
    const logout = async () => {
        try {
            console.log('Cerrando sesión...');
            await AsyncStorage.removeItem('usuario');
            setUsuario(null);
            console.log('👋 Logout exitoso - AsyncStorage limpiado');
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
        }
    };

    const esConductor = () => usuario?.tipoUsuario === 'CONDUCTOR';
    const esPasajero  = () => usuario?.tipoUsuario === 'PASAJERO';

    const value = {
        usuario,
        user: usuario,
        loading,
        login,
        logout,
        esConductor,
        esPasajero,
        tipoUsuario: usuario?.tipoUsuario || null,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return ctx;
};