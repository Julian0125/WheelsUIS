import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CrearViaje() {
    const [origen, setOrigen] = useState('');
    const [destino, setDestino] = useState('');
    const [cupos, setCupos] = useState(1);
    const [maxCupos, setMaxCupos] = useState(4);
    const [vehiculo, setVehiculo] = useState(null);
    const [tipoVehiculo, setTipoVehiculo] = useState('');
    const [conductorId, setConductorId] = useState(null);
    const [rutasDisponibles, setRutasDisponibles] = useState([]);
    const [cargandoRutas, setCargandoRutas] = useState(true);

    // 🔹 Cargar usuario logueado Y su vehículo desde AsyncStorage
    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                const usuarioGuardado = await AsyncStorage.getItem('usuario');
                console.log('📦 Usuario en AsyncStorage:', usuarioGuardado);

                if (usuarioGuardado) {
                    const usuario = JSON.parse(usuarioGuardado);
                    console.log('👤 Usuario parseado:', usuario);

                    if (usuario.tipo === 'CONDUCTOR') {
                        setConductorId(usuario.id);

                        // ✅ SOLUCIÓN: Usar el vehículo que viene del login
                        if (usuario.vehiculo) {
                            setVehiculo(usuario.vehiculo);
                            console.log('🚗 Vehículo del usuario:', usuario.vehiculo);

                            const tipo = (usuario.vehiculo.tipo || '').toString().toUpperCase().trim();
                            console.log('🔍 Tipo de vehículo detectado:', tipo);
                            setTipoVehiculo(tipo);

                            // Ajustar cupos según el tipo
                            if (tipo === 'MOTO') {
                                console.log('🏍️ Configurado como MOTO: 1 cupo');
                                setCupos(1);
                                setMaxCupos(1);
                            } else if (tipo === 'COCHE' || tipo === 'CARRO') {
                                console.log('🚗 Configurado como COCHE: hasta 4 cupos');
                                setCupos(1);
                                setMaxCupos(4);
                            } else {
                                console.log('⚠️ Tipo no reconocido:', tipo);
                            }
                        } else {
                            console.log('❌ No hay vehículo en el usuario');
                            Alert.alert('Error', 'No tienes un vehículo registrado.');
                        }
                    } else {
                        Alert.alert('Error', 'Solo los conductores pueden crear viajes.');
                    }
                } else {
                    Alert.alert('Error', 'No hay usuario logueado.');
                }
            } catch (error) {
                console.error('❌ Error al cargar usuario:', error);
            }
        };

        cargarUsuario();
    }, []);

    // 🔹 Obtener rutas predefinidas del backend
    useEffect(() => {
        if (!conductorId) return;

        const obtenerRutas = async () => {
            try {
                setCargandoRutas(true);
                const response = await fetch(`https://wheelsuis.onrender.com/viaje/rutas-predefinidas?idConductor=${conductorId}`);

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Rutas obtenidas del backend:', data);
                    setRutasDisponibles(data);
                } else {
                    console.log('⚠️ No se pudieron obtener las rutas, usando fallback');
                    usarRutasPredefinidas();
                }
            } catch (error) {
                console.error('❌ Error al cargar rutas:', error);
                usarRutasPredefinidas();
            } finally {
                setCargandoRutas(false);
            }
        };

        const usarRutasPredefinidas = () => {
            setRutasDisponibles([
                { origen: 'Universidad', destino: 'Barrio Mutis', cupos: maxCupos },
                { origen: 'Universidad', destino: 'Barrio La Cumbre', cupos: maxCupos },
                { origen: 'Barrio Mutis', destino: 'Universidad', cupos: maxCupos },
                { origen: 'Barrio La Cumbre', destino: 'Universidad', cupos: maxCupos },
            ]);
        };

        obtenerRutas();
    }, [conductorId, maxCupos]);

    // 🗑️ Función para limpiar caché (temporal para debug)
    const limpiarCache = async () => {
        try {
            await AsyncStorage.removeItem('usuario');
            Alert.alert('✅ Listo', 'Caché limpiada. Por favor vuelve a iniciar sesión.');
        } catch (error) {
            console.error('Error al limpiar caché:', error);
        }
    };

    // 🔹 Control de cupos
    const aumentarCupos = () => {
        if (cupos < maxCupos) setCupos(cupos + 1);
    };

    const disminuirCupos = () => {
        if (cupos > 1) setCupos(cupos - 1);
    };

    // 🔹 Crear viaje
    const crearViaje = async () => {
        if (!origen || !destino) {
            Alert.alert('Error', 'Por favor selecciona origen y destino.');
            return;
        }

        if (!vehiculo) {
            Alert.alert('Error', 'Debes tener un vehículo registrado para crear un viaje.');
            return;
        }

        try {
            let tipoViaje = '';
            if (destino.toLowerCase().includes('mutis')) {
                tipoViaje = 'mutis';
            } else if (destino.toLowerCase().includes('cumbre')) {
                tipoViaje = 'cumbre';
            } else {
                Alert.alert('Error', 'Tipo de viaje no reconocido. Selecciona Mutis o Cumbre como destino.');
                return;
            }

            console.log('🚀 Creando viaje tipo:', tipoViaje, 'para conductor:', conductorId);

            const response = await fetch(
                `https://wheelsuis.onrender.com/viaje/crear/${tipoViaje}?idConductor=${conductorId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const viaje = await response.json();
                console.log('✅ Viaje creado:', viaje);
                Alert.alert('Éxito', '✅ Viaje creado correctamente');

                setOrigen('');
                setDestino('');
                setCupos(tipoVehiculo === 'MOTO' ? 1 : 1);
            } else {
                const error = await response.text();
                Alert.alert('Error', error || 'No se pudo crear el viaje');
            }
        } catch (error) {
            console.error('❌ Error al crear viaje:', error);
            Alert.alert('Error', 'No se pudo crear el viaje. Intenta nuevamente.');
        }
    };

    const origenesUnicos = [...new Set(rutasDisponibles.map(r => r.origen))];
    const destinosDisponibles = origen
        ? rutasDisponibles.filter(r => r.origen === origen).map(r => r.destino)
        : [];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.titulo}>Crear Viaje</Text>

                {/* 🗑️ Botón temporal para limpiar caché - ELIMINAR EN PRODUCCIÓN */}

                {/* 🔹 Vehículo y tipo */}
                <View style={styles.vehiculoSection}>
                    <Text style={styles.subtitulo}>Tu vehículo:</Text>
                    <View style={styles.tipoVehiculoContainer}>
                        <TouchableOpacity
                            style={[styles.iconContainer, tipoVehiculo === 'MOTO' && styles.iconSeleccionado]}
                            disabled
                        >
                            <FontAwesome5
                                name="motorcycle"
                                size={30}
                                color={tipoVehiculo === 'MOTO' ? 'white' : 'gray'}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.iconContainer, (tipoVehiculo === 'COCHE' || tipoVehiculo === 'CARRO') && styles.iconSeleccionado]}
                            disabled
                        >
                            <Ionicons
                                name="car-sport"
                                size={30}
                                color={(tipoVehiculo === 'COCHE' || tipoVehiculo === 'CARRO') ? 'white' : 'gray'}
                            />
                        </TouchableOpacity>
                    </View>

                    {vehiculo && (
                        <Text style={styles.detalleVehiculo}>
                            {vehiculo.marca} {vehiculo.modelo} {'\n'}
                            Placa: {vehiculo.placa}
                        </Text>
                    )}
                </View>

                {/* 🔹 Cupos */}
                <View style={styles.cuposContainer}>
                    <Text style={styles.label}>Número de cupos disponibles:</Text>
                    <View style={styles.cuposControles}>
                        <TouchableOpacity
                            style={[
                                styles.cupoBoton,
                                (tipoVehiculo === 'MOTO' || cupos <= 1) && styles.botonDeshabilitado
                            ]}
                            onPress={disminuirCupos}
                            disabled={tipoVehiculo === 'MOTO' || cupos <= 1}
                        >
                            <Ionicons name="remove" size={24} color="white" />
                        </TouchableOpacity>

                        <Text style={styles.cupoTexto}>{cupos}</Text>

                        <TouchableOpacity
                            style={[
                                styles.cupoBoton,
                                (tipoVehiculo === 'MOTO' || cupos >= maxCupos) && styles.botonDeshabilitado
                            ]}
                            onPress={aumentarCupos}
                            disabled={tipoVehiculo === 'MOTO' || cupos >= maxCupos}
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.infoText}>
                        {tipoVehiculo === 'MOTO'
                            ? 'Las motos solo permiten 1 cupo'
                            : `Máximo ${maxCupos} cupos para tu vehículo`
                        }
                    </Text>
                </View>

                {/* 🔹 Origen */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Origen:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={origen}
                            onValueChange={(value) => {
                                setOrigen(value);
                                setDestino('');
                            }}
                            style={styles.picker}
                            enabled={!cargandoRutas}
                        >
                            <Picker.Item
                                label={cargandoRutas ? "Cargando..." : "Seleccione origen"}
                                value=""
                            />
                            {origenesUnicos.map((org, index) => (
                                <Picker.Item key={index} label={org} value={org} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* 🔹 Destino */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Destino:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={destino}
                            onValueChange={(value) => setDestino(value)}
                            style={styles.picker}
                            enabled={!cargandoRutas && origen !== ''}
                        >
                            <Picker.Item
                                label={origen === '' ? "Seleccione origen primero" : "Seleccione destino"}
                                value=""
                            />
                            {destinosDisponibles.map((dest, index) => (
                                <Picker.Item key={index} label={dest} value={dest} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <TouchableOpacity style={styles.boton} onPress={crearViaje}>
                    <Text style={styles.botonTexto}>Crear Viaje</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#207636',
    },
    botonDebug: {
        backgroundColor: '#ff6b6b',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    textoDebug: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    subtitulo: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
    },
    vehiculoSection: {
        alignItems: 'center',
        marginBottom: 15,
    },
    tipoVehiculoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '60%',
        marginVertical: 10,
    },
    iconContainer: {
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    iconSeleccionado: {
        backgroundColor: '#207636',
        borderColor: '#207636',
    },
    detalleVehiculo: {
        textAlign: 'center',
        color: '#555',
        fontWeight: '500',
    },
    cuposContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    cuposControles: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    cupoBoton: {
        backgroundColor: '#207636',
        borderRadius: 10,
        padding: 10,
    },
    botonDeshabilitado: {
        backgroundColor: '#ccc',
    },
    cupoTexto: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 15,
        color: '#333',
    },
    infoText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 5,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontWeight: '600',
        color: '#444',
        marginBottom: 5,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        overflow: 'hidden',
    },
    picker: {
        height: 45,
    },
    boton: {
        backgroundColor: '#207636',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    botonTexto: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});