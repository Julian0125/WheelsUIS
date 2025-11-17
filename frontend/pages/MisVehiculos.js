import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import VehiculoService from '../services/VehiculoService_tmp';


export default function MisVehiculos() {
  const navigation = useNavigation();
  const { usuario } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  const verde = '#239540';
  const gris = '#777';

  
  useFocusEffect(
    React.useCallback(() => {
      cargarVehiculos();
    }, [usuario])
  );

  const cargarVehiculos = async () => {
    console.log('=== CARGANDO VEHÍCULOS ===');
    
    if (!usuario?.id) {
      console.log('No hay ID de usuario');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const result = await VehiculoService.obtenerPorConductor(usuario.id);
      
      if (result.success) {
        console.log('Vehículo obtenido:', result.data);
        setVehiculos(result.data ? [result.data] : []);
      } else {
        console.log('Error no carga:', result.error);
        setVehiculos([]);
      }
    } catch (error) {
      console.log('Error, no se obtiene vehiculo:', error);
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  };



  const renderVehiculo = (vehiculo) => (
    <View key={vehiculo.id} style={styles.vehiculoCard}>
      <View style={styles.vehiculoHeader}>
        <FontAwesome5 
          name={vehiculo.tipo === 'MOTO' ? 'motorcycle' : 'car'} 
          size={32} 
          color={verde} 
        />
        <View style={styles.vehiculoInfo}>
          <Text style={styles.vehiculoPlaca}>{vehiculo.placa}</Text>
          <Text style={styles.vehiculoTipo}>{vehiculo.tipo}</Text>
        </View>
      </View>

      <View style={styles.vehiculoDetalle}>
        <View style={styles.detalleRow}>
          <Ionicons name="business-outline" size={18} color={gris} />
          <Text style={styles.detalleText}>Marca: {vehiculo.marca}</Text>
        </View>
        <View style={styles.detalleRow}>
          <Ionicons name="car-outline" size={18} color={gris} />
          <Text style={styles.detalleText}>Modelo: {vehiculo.modelo}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: verde }]}>Mis Vehículos</Text>
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={verde} />
          <Text style={styles.loadingText}>Cargando vehículos...</Text>
        </View>
      ) : vehiculos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="car" size={80} color="#DDD" />
          <Text style={styles.emptyText}>No tienes vehículos registrados</Text>
          <Text style={styles.emptySubtext}>
            Agrega tu primer vehículo para comenzar
          </Text>
        </View>
      ) : (
        <View style={styles.vehiculosList}>
          {vehiculos.map(renderVehiculo)}
        </View>
      )}

      {/* Botón Agregar */}
      <TouchableOpacity 
        style={[styles.agregarButton, { backgroundColor: verde }]}
        onPress={() => navigation.navigate('RegistrarVehiculo')}
      >
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.agregarText}>Agregar Nuevo Vehículo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 22,
    paddingBottom: 10,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  vehiculosList: {
    padding: 22,
    paddingTop: 10,
  },
  vehiculoCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  vehiculoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehiculoInfo: {
    flex: 1,
    marginLeft: 15,
  },
  vehiculoPlaca: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  vehiculoTipo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  vehiculoDetalle: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detalleText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 10,
  },
  agregarButton: {
    margin: 22,
    marginTop: 10,
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  agregarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
  },
});