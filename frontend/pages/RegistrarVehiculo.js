import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput , Alert} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import VehiculoService from '../services/VehiculoService';
import { useAuth } from '../context/AuthContext';


export default function RegistrarVehiculo() {
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [tipo, setTipo] = useState('COCHE');
  const navigation = useNavigation();
  const {usuario } = useAuth();

  const verde = '#239540';
  const gris = '#777';

  const handleRegistrar = async() => {
    const nuevoVehiculo = {
      placa,
      marca,
      modelo,
      tipo,
    };

    console.log('Registrando vehículo:', nuevoVehiculo);
    try {
      const result = await VehiculoService.registrar(usuario.id, nuevoVehiculo);

      if (result.success) {
        Alert.alert("Éxito", result.message || "Vehículo registrado correctamente");
        navigation.goBack();
      } else {
        Alert.alert("Error", result.error || "No se pudo registrar el vehículo");
      }
    } catch (error) {
      console.error('Error al registrar vehículo:', error);
      Alert.alert("Error", "Ocurrió un error inesperado al registrar el vehículo");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Botón atrás */}
      <TouchableOpacity style={styles.atrasBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={verde} />
      </TouchableOpacity>

      {/* Título */}
      <Text style={[styles.titulo, { color: verde }]}> Registrar vehículo </Text>

      {/* Tipo de vehículo */}
      <Text style={styles.subtitulo}>Tipo de vehículo</Text>
      <View style={styles.iconosVehiculos}>
        <TouchableOpacity
          style={[
            styles.iconoBox,
            tipo === 'MOTO' && { backgroundColor: '#EAF8EE', borderColor: verde },
            tipo !== 'MOTO' && { borderColor: 'transparent' },
          ]}
          onPress={() => setTipo('MOTO')}
        >
          <FontAwesome5 name="motorcycle" size={28} color={tipo === 'MOTO' ? verde : gris} />
          <Text style={[styles.textoVehiculo, tipo === 'MOTO' && { color: verde }]}>Moto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconoBox,
            tipo === 'COCHE' && { backgroundColor: '#EAF8EE', borderColor: verde },
            tipo !== 'COCHE' && { borderColor: 'transparent' },
          ]}
          onPress={() => setTipo('COCHE')}
        >
          <FontAwesome5 name="car" size={28} color={tipo === 'COCHE' ? verde : gris} />
          <Text style={[styles.textoVehiculo, tipo === 'COCHE' && { color: verde }]}>Coche</Text>
        </TouchableOpacity>
      </View>

      {/* Placa */}
      <Text style={styles.subtitulo}>Placa del vehículo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: ABC123"
        value={placa}
        onChangeText={setPlaca}
        autoCapitalize="characters"
        maxLength={6}
      />

      {/* Marca */}
      <Text style={styles.subtitulo}>Marca</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Chevrolet, Mazda, Toyota"
        value={marca}
        onChangeText={setMarca}
      />

      {/* Modelo */}
      <Text style={styles.subtitulo}>Modelo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Spark, 3, Corolla, 2020"
        value={modelo}
        onChangeText={setModelo}
      />

      {/* Botón registrar */}
      <TouchableOpacity 
        style={[styles.registrarButton, { backgroundColor: verde }]}
        onPress={handleRegistrar}
      >
        <Text style={styles.registrarText}>Registrar vehículo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    backgroundColor: '#fff',
  },
  atrasBtn: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  iconosVehiculos: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  iconoBox: {
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '40%',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textoVehiculo: {
    marginTop: 5,
    fontSize: 14,
    color: '#444',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  registrarButton: {
    marginTop: 30,
    marginBottom: 20,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 3,
  },
  registrarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});