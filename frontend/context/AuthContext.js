import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const usuarioJSON = await AsyncStorage.getItem('usuario');
      if (usuarioJSON) setUsuario(JSON.parse(usuarioJSON));
    } catch (e) {
      console.error('Error al cargar usuario:', e);
    } finally {
      setLoading(false);
    }
  })(); }, []);

  const login = async (usuarioData) => {
    try {
      setUsuario(usuarioData);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuarioData));
    } catch (e) {
      console.error('Error al guardar usuario:', e);
    }
  };

  const logout = async () => {
    try {
      setUsuario(null);
      await AsyncStorage.removeItem('usuario');
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};