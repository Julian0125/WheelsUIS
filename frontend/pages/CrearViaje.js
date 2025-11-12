import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

export default function CrearViaje() {
  const [vehiculo, setVehiculo] = useState('moto');
  const [cupos, setCupos] = useState(1);
  const [fecha, setFecha] = useState(new Date());
  const [recogida, setRecogida] = useState('');
  const [destino, setDestino] = useState('');
  const navigation = useNavigation();

  const verde = '#239540';
  const gris = '#777';

  // Calcular fecha y hora por defecto (+10 min)
  useEffect(() => {
    const ahora = new Date();
    const salida = new Date(ahora.getTime() + 10 * 60000);
    setFecha(salida);
  }, []);

  const formatearFecha = (fecha) => {
    const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return fecha.toLocaleDateString('es-CO', opcionesFecha);
  };

  const formatearHora = (fecha) => {
    const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
    return fecha.toLocaleTimeString('es-CO', opcionesHora);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Botón atrás */}
      <TouchableOpacity style={styles.atrasBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={verde} />
      </TouchableOpacity>

      {/* Título */}
      <Text style={[styles.titulo, { color: verde }]}>
        Crear <Text style={{ color: '#000' }}>cupo</Text>
      </Text>

      {/* Tipo de vehículo */}
      <Text style={styles.subtitulo}>Tipo de vehículo</Text>
      <View style={styles.iconosVehiculos}>
        <TouchableOpacity
          style={[
            styles.iconoBox,
            vehiculo === 'moto' && { backgroundColor: '#EAF8EE', borderColor: verde },
            vehiculo !== 'moto' && { borderColor: 'transparent' },
          ]}
          onPress={() => setVehiculo('moto')}
        >
          <FontAwesome5 name="motorcycle" size={28} color={vehiculo === 'moto' ? verde : gris} />
          <Text style={[styles.textoVehiculo, vehiculo === 'moto' && { color: verde }]}>Moto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconoBox,
            vehiculo === 'carro' && { backgroundColor: '#EAF8EE', borderColor: verde },
            vehiculo !== 'carro' && { borderColor: 'transparent' },
          ]}
          onPress={() => setVehiculo('carro')}
        >
          <FontAwesome5 name="car" size={28} color={vehiculo === 'carro' ? verde : gris} />
          <Text style={[styles.textoVehiculo, vehiculo === 'carro' && { color: verde }]}>Carro</Text>
        </TouchableOpacity>
      </View>

      {/* Cupos */}
      <Text style={styles.subtitulo}>Número de cupos</Text>
      <View style={styles.cuposContainer}>
        <TouchableOpacity onPress={() => setCupos(Math.max(1, cupos - 1))}>
          <Ionicons name="remove-circle-outline" size={32} color={verde} />
        </TouchableOpacity>
        <Text style={styles.cuposTexto}>{cupos} cupo{cupos > 1 && 's'}</Text>
        <TouchableOpacity onPress={() => setCupos(cupos + 1)}>
          <Ionicons name="add-circle-outline" size={32} color={verde} />
        </TouchableOpacity>
      </View>

      {/* Fecha y hora */}
      <Text style={styles.subtitulo}>Fecha y hora</Text>
      <View style={styles.fechaHoraContainer}>
        <View style={styles.fechaHoraBox}>
          <Ionicons name="calendar-outline" size={20} color={verde} />
          <Text style={styles.fechaHoraTexto}>{formatearFecha(fecha)}</Text>
        </View>
        <View style={styles.fechaHoraBox}>
          <Ionicons name="time-outline" size={20} color={verde} />
          <Text style={styles.fechaHoraTexto}>{formatearHora(fecha)}</Text>
        </View>
      </View>

      {/* Recogida y destino */}
      <Text style={styles.subtitulo}>Selecciona la recogida y el destino</Text>

      <Text style={styles.label}>Recogida</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={recogida} onValueChange={(item) => setRecogida(item)}>
          <Picker.Item label="Seleccione un punto" value="" />
          <Picker.Item label="Cañaveral CC" value="Cañaveral CC" />
          <Picker.Item label="UIS" value="UIS" />
          <Picker.Item label="Mutis" value="Mutis" />
        </Picker>
      </View>

      <Text style={styles.label}>Destino</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={destino} onValueChange={(item) => setDestino(item)}>
          <Picker.Item label="Seleccione un destino" value="" />
          <Picker.Item label="UIS" value="UIS" />
          <Picker.Item label="Centro" value="Centro" />
          <Picker.Item label="Real de Minas" value="Real de Minas" />
        </Picker>
      </View>

      {/* Botón crear */}
      <TouchableOpacity style={[styles.crearButton, { backgroundColor: verde }]}>
        <Text style={styles.crearText}>Crear cupo</Text>
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
  cuposContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginVertical: 10,
  },
  cuposTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fechaHoraContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 10,
  },
  fechaHoraBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EAF8EE',
    paddingVertical: 12,
    borderRadius: 12,
  },
  fechaHoraTexto: {
    fontSize: 15,
    color: '#333',
  },
  label: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  pickerBox: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 6,
    backgroundColor: '#FAFAFA',
  },
  crearButton: {
    marginTop: 30,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 3,
  },
  crearText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
