import React from 'react';      
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const getInitial = (nombre) => {
  return nombre.charAt(0).toUpperCase();
};

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const navigation = useNavigation();
  const inicial = getInitial(usuario?.nombre || 'U');

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      
      
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>
      </View>

      
      <Text style={styles.name}>{usuario?.nombre}</Text>

      
      <View style={styles.infoBox}>
        <Text style={styles.label}>Código UIS:</Text>
        <Text style={styles.value}>{usuario?.codigo}</Text>

        <Text style={styles.label}>Correo:</Text>
        <Text style={styles.value}>{usuario?.correo}</Text>

        <Text style={styles.label}>Celular:</Text>
        <Text style={styles.value}>{usuario?.celular}</Text>

        <Text style={styles.label}>Tipo de usuario:</Text>
        <Text style={styles.value}>{usuario?.tipoUsuario}</Text>
      </View>

    
      {usuario?.tipoUsuario === 'CONDUCTOR' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones de Conductor</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MisVehiculos')}>
            <Text style={styles.buttonText}>Mis Vehículos</Text>
          </TouchableOpacity>

        </View>
      )}

      {usuario?.tipoUsuario === 'PASAJERO' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones de Pasajero</Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Mis Reservas</Text>
          </TouchableOpacity>

        </View>
      )}

     
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 25, 
    alignItems: 'center', 
    backgroundColor: '#FFF' 
  },
  avatarContainer: { 
    marginTop: 30, 
    marginBottom: 10 
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1C5D2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
  },
  name: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#1C5D2F' 
  },
  email: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 20 
  },
  infoBox: {
    width: '90%',
    backgroundColor: '#F1F1F1',
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    marginTop: 20,
  },
  label: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  value: { 
    fontSize: 14, 
    marginBottom: 10
  },
  section: { 
    width: '90%', 
    marginTop: 10 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#1C5D2F' 
  },
  button: {
    backgroundColor: '#1C5D2F',
    padding: 12,
    borderRadius: 12,
    marginVertical: 5,
  },
  buttonText: { 
    color: '#FFF',
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#C62828',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 160,
  },
  logoutText: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  },
});
