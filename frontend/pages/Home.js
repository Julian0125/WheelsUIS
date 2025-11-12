import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function Home({ navigation }) {
  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Lugares disponibles</Text>
          </View>
          <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
              style={styles.profileImage}
          />
        </View>

        <Text style={styles.title}>¿Qué deseas hacer?</Text>
        <Text style={styles.subtitle}>Busca o crea tu cupo en Wheels hoy</Text>

        <View style={styles.buttonsContainer}>
          <View style={styles.buttonSection}>
            <Text style={styles.helperText}>Si buscas ir con otras personas</Text>
            <TouchableOpacity style={[styles.optionButton, styles.buscarButton]}>
              <Text style={styles.optionText}>BUSCAR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonSection}>
            <Text style={styles.helperText}>Si quieres facilitar ir a algún lugar</Text>
            <TouchableOpacity
                style={[styles.optionButton, styles.crearButton]}
                onPress={() => navigation.navigate('CrearViaje')}
                activeOpacity={0.8}
            >
                <Text style={styles.optionText}>CREAR</Text>
            </TouchableOpacity>

          </View>
        </View>

        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpText}>Ayuda</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#E8E8E8',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#555',
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 50,
    textAlign: 'center',
    color: '#1C5D2F',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonSection: {
    width: '48%',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
  },
  optionButton: {
    width: '100%',
    height: 140,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buscarButton: {
    backgroundColor: '#1c3a1a', // verde medio
  },
  crearButton: {
    backgroundColor: '#239540', // su verde principal
  },
  optionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  helpButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 30,
    position: 'absolute',
    bottom: 40,
  },
  helpText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
