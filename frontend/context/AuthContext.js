import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    (async () => {
      try {
        const usuarioJSON = await AsyncStorage.getItem('usuario');
        if (usuarioJSON) {
          const usuarioData = JSON.parse(usuarioJSON);
          console.log('Usuario cargado desde AsyncStorage:', usuarioData);
          setUsuario(usuarioData);
        } else {
          console.log('No hay usuario guardado');
        }
      } catch (e) {
        console.error('Error al cargar usuario:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (usuarioData) => {
    try {
      // se asegura que se este pasando el tipo de usuario
      if (!usuarioData.tipoUsuario) {
        console.warn('Usuario sin tipoUsuario definido:', usuarioData);
      }
      
      console.log('Login exitoso - Guardando usuario:', usuarioData);
      setUsuario(usuarioData);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuarioData));
    } catch (e) {
      console.error('Error al guardar usuario:', e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      console.log('Cerrando sesión...');
      setUsuario(null);
      await AsyncStorage.removeItem('usuario');
      console.log('Sesión cerrada correctamente');
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
      throw e;
    }
  };

  // verifica si el usuario es conductor
  const esConductor = () => {
    return usuario?.tipoUsuario === 'CONDUCTOR';
  };

  // verifica si el usuario es pasajero
  const esPasajero = () => {
    return usuario?.tipoUsuario === 'PASAJERO';
  };

  const value = {
    usuario,        
    user: usuario,  
    loading,
    login,
    logout,
    esConductor,
    esPasajero,
    // Acceso directo al rol
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