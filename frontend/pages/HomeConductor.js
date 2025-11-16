
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Home({ navigation }) {
  const { usuario } = useAuth();
  const nombre = usuario?.nombre || 'Usuario';
  return (
      <View style={styles.container}>
        <Image
            source={require('../assets/carro.png')}
            style={styles.carBackground}
            resizeMode="contain"  
        />
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Hola, {nombre} 👋</Text>
          </View>
        </View>

        <Text style={styles.title}>¿Listo para publicar un nuevo viaje?</Text>
        <Text style={styles.subtitle}>Comparte ruta, comparte comodidad.</Text>

        <View style={styles.buttonsContainer}>
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
  carBackground: {
    position: 'absolute',
    bottom: 0,
    width: '150%',
    height: 320,       
    opacity: 0.9,      
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
    fontSize: 20,
    fontWeight: 'bold',
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
    marginTop: 60,
    textAlign: 'center',
    color: '#062f13ff',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 6,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 100,
    justifyContent: 'center',
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
    marginBottom: 14,
  
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
  crearButton: {
    backgroundColor: '#207636', // su verde principal
    marginBottom: 19,
  },
  optionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  helpButton: {
    backgroundColor: '#207636',
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
