import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = (usuarioData) => {
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

    console.log('Login exitoso - Usuario en memoria:', usuarioNormalizado);
    setUsuario(usuarioNormalizado); 
  };

  const logout = () => {
    console.log('Cerrando sesión...');
    setUsuario(null); // vuelve al Login
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
