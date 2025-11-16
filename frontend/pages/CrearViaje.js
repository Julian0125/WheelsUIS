import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViajePollingService from '../services/ViajePollingService';

export default function CrearViaje({ navigation }) {
    const [origen, setOrigen] = useState('');
    const [destino, setDestino] = useState('');
    const [cupos, setCupos] = useState(1);
    const [maxCupos, setMaxCupos] = useState(4);
    const [vehiculo, setVehiculo] = useState(null);
    const [tipoVehiculo, setTipoVehiculo] = useState('');
    const [conductorId, setConductorId] = useState(null);
    const [rutasDisponibles, setRutasDisponibles] = useState([]);
    const [cargandoRutas, setCargandoRutas] = useState(true);
    const [horaSalida, setHoraSalida] = useState(null);

    // Estados para los modals
    const [modalOrigenVisible, setModalOrigenVisible] = useState(false);
    const [modalDestinoVisible, setModalDestinoVisible] = useState(false);

    // Calcular hora de salida (10 minutos después)
    useEffect(() => {
        const ahora = new Date();
        const salidaEnDiezMinutos = new Date(ahora.getTime() + 10 * 60000);
        setHoraSalida(salidaEnDiezMinutos);
    }, []);

    // Limpiar monitoreo al desmontar el componente
    useEffect(() => {
        return () => {
            ViajePollingService.detenerMonitoreo();
        };
    }, []);

    // Formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const opciones = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return fecha.toLocaleDateString('es-CO', opciones);
    };

    // Formatear hora
    const formatearHora = (fecha) => {
        if (!fecha) return '';
        return fecha.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Cargar usuario logueado Y su vehículo desde AsyncStorage
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


                        if (usuario.vehiculo) {
                            setVehiculo(usuario.vehiculo);
                            console.log('🚗 Vehículo del usuario:', usuario.vehiculo);

                            const tipo = (usuario.vehiculo.tipo || '').toString().toUpperCase().trim();
                            console.log('🔍 Tipo de vehículo detectado:', tipo);
                            setTipoVehiculo(tipo);

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

    // Obtener rutas predefinidas del backend
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

    // Control de cupos
    const aumentarCupos = () => {
        if (cupos < maxCupos) setCupos(cupos + 1);
    };

    const disminuirCupos = () => {
        if (cupos > 1) setCupos(cupos - 1);
    };

    // Callback cuando el viaje inicia automáticamente
    const onViajeIniciado = (iniciado, mensaje) => {
        if (iniciado) {
            Alert.alert(
                '🚗 Viaje Iniciado',
                'Tu viaje ha iniciado automáticamente. Los pasajeros han sido notificados.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Opcional: navegar a otra pantalla
                            // navigation.navigate('ViajeEnCurso');
                        }
                    }
                ]
            );
        }
    };

    // ✅ FUNCIÓN SIMPLIFICADA PARA DETERMINAR TIPO DE VIAJE
    const determinarTipoViaje = (origen, destino) => {
        const origenLower = origen.toLowerCase();
        const destinoLower = destino.toLowerCase();

        console.log('🔍 Analizando ruta:', { origen: origenLower, destino: destinoLower });

        // Cualquier ruta que involucre Mutis
        if (origenLower.includes('mutis') || destinoLower.includes('mutis')) {
            console.log('✅ Detectado: Ruta Mutis (tipo: mutis)');
            return 'mutis';
        }

        // Cualquier ruta que involucre Cumbre
        if (origenLower.includes('cumbre') || destinoLower.includes('cumbre')) {
            console.log('✅ Detectado: Ruta Cumbre (tipo: cumbre)');
            return 'cumbre';
        }

        console.log('❌ No se pudo determinar el tipo de viaje');
        return null;
    };

    // ✅ CREAR VIAJE - VERSIÓN SIMPLIFICADA SIN VERIFICACIÓN PREVIA
    const crearViaje = async () => {
        // Validaciones básicas
        if (!origen || !destino) {
            Alert.alert('Error', 'Por favor selecciona origen y destino.');
            return;
        }

        if (!vehiculo) {
            Alert.alert('Error', 'Debes tener un vehículo registrado para crear un viaje.');
            return;
        }

        if (!conductorId) {
            Alert.alert('Error', 'No se pudo identificar el conductor.');
            return;
        }

        try {
            // Determinar tipo de viaje
            const tipoViaje = determinarTipoViaje(origen, destino);

            if (!tipoViaje) {
                Alert.alert(
                    'Error',
                    `No se pudo determinar el tipo de viaje para la ruta:\n\n${origen} → ${destino}\n\nPor favor, selecciona una ruta válida.`
                );
                return;
            }

            console.log('🚀 Iniciando creación de viaje con:');
            console.log('   - Conductor ID:', conductorId);
            console.log('   - Tipo de viaje:', tipoViaje);
            console.log('   - Origen:', origen);
            console.log('   - Destino:', destino);
            console.log('   - Cupos:', cupos);
            console.log('   - Vehículo:', vehiculo.placa, '-', vehiculo.tipo);

            const url = `https://wheelsuis.onrender.com/viaje/crear/${tipoViaje}?idConductor=${conductorId}`;
            console.log('📡 URL completa:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('📡 Response status:', response.status);

            if (response.ok) {
                const viaje = await response.json();
                console.log('✅ Viaje creado exitosamente:', viaje);

                // Iniciar monitoreo del viaje
                ViajePollingService.iniciarMonitoreo(viaje.id, onViajeIniciado);

                Alert.alert(
                    '✅ Éxito',
                    `Viaje creado correctamente\n\nRuta: ${origen} → ${destino}\nSalida: ${formatearHora(horaSalida)}\nCupos: ${cupos}\n\n🔔 El viaje iniciará automáticamente en 10 minutos o cuando se llenen los cupos.`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Resetear formulario
                                setOrigen('');
                                setDestino('');
                                setCupos(tipoVehiculo === 'MOTO' ? 1 : 1);

                                // Recalcular nueva hora
                                const ahora = new Date();
                                const nuevaSalida = new Date(ahora.getTime() + 10 * 60000);
                                setHoraSalida(nuevaSalida);

                                // Navegar de vuelta
                                navigation.goBack();
                            }
                        }
                    ]
                );
            } else {
                // Manejo de errores
                const contentType = response.headers.get('content-type');
                let errorData = null;

                try {
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await response.json();
                        console.log('❌ Error JSON completo:', JSON.stringify(errorData, null, 2));
                    } else {
                        const errorText = await response.text();
                        console.log('❌ Error de texto:', errorText);
                        errorData = { message: errorText };
                    }
                } catch (parseError) {
                    console.error('❌ Error al parsear respuesta:', parseError);
                }

                // ⚠️ MENSAJE ESPECÍFICO PARA ERROR 500
                if (response.status === 500) {
                    Alert.alert(
                        '⚠️ No se pudo crear el viaje',
                        'El servidor encontró un problema al procesar tu solicitud.\n\n' +
                        '🔍 Posibles causas:\n' +
                        '• Ya tienes un viaje activo en el sistema\n' +
                        '• Hay un problema con el servidor\n\n' +
                        '💡 Soluciones:\n' +
                        '1. Cierra sesión y vuelve a iniciar\n' +
                        '2. Si el problema persiste, contacta al administrador\n' +
                        '3. Intenta crear el viaje desde la app móvil',
                        [
                            {
                                text: 'Cerrar sesión',
                                style: 'destructive',
                                onPress: async () => {
                                    // Aquí podrías llamar a tu función de logout
                                    // await logout();
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'Login' }],
                                    });
                                }
                            },
                            {
                                text: 'Volver',
                                style: 'cancel'
                            }
                        ]
                    );
                } else if (response.status === 400) {
                    const errorMsg = errorData?.message || errorData?.error || 'Datos inválidos';
                    Alert.alert('Error', errorMsg);
                } else {
                    const errorMsg = errorData?.message || `Error ${response.status}`;
                    Alert.alert('Error al Crear Viaje', errorMsg);
                }
            }
        } catch (error) {
            console.error('❌ Error crítico:', error);
            Alert.alert(
                'Error de Conexión',
                'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
            );
        }
    };

    const origenesUnicos = [...new Set(rutasDisponibles.map(r => r.origen))];
    const destinosDisponibles = origen
        ? rutasDisponibles.filter(r => r.origen === origen).map(r => r.destino)
        : [];

    // Componente de selección con modal
    const SelectorModal = ({ visible, onClose, options, onSelect, title, selectedValue }) => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScroll}>
                        {options.length === 0 ? (
                            <View style={styles.emptyOptions}>
                                <Text style={styles.emptyText}>
                                    {title === 'Selecciona Origen'
                                        ? 'No hay orígenes disponibles'
                                        : 'Selecciona un origen primero'}
                                </Text>
                            </View>
                        ) : (
                            options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionItem,
                                        selectedValue === option && styles.optionItemSelected
                                    ]}
                                    onPress={() => {
                                        onSelect(option);
                                        onClose();
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedValue === option && styles.optionTextSelected
                                    ]}>
                                        {option}
                                    </Text>
                                    {selectedValue === option && (
                                        <Ionicons name="checkmark-circle" size={24} color="#207636" />
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.titulo}>Crear Viaje</Text>


                {/* Fecha y Hora de salida */}
                <View style={styles.horarioContainer}>
                    <View style={styles.horarioCard}>
                        <Ionicons name="calendar" size={24} color="#207636" />
                        <View style={styles.horarioInfo}>
                            <Text style={styles.horarioLabel}>Fecha de salida</Text>
                            <Text style={styles.horarioValor}>
                                {formatearFecha(horaSalida)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.horarioCard}>
                        <Ionicons name="time" size={24} color="#207636" />
                        <View style={styles.horarioInfo}>
                            <Text style={styles.horarioLabel}>Hora de salida</Text>
                            <Text style={styles.horarioValor}>
                                {formatearHora(horaSalida)}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.infoSalida}>
                    ⏱️ El viaje iniciará automáticamente 10 minutos después de crearlo
                </Text>

                {/* Vehículo y tipo */}
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

                {/* Cupos */}
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

                {/* Origen con modal */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Origen:</Text>
                    <TouchableOpacity
                        style={styles.selectorButton}
                        onPress={() => setModalOrigenVisible(true)}
                        disabled={cargandoRutas}
                    >
                        <Text style={[
                            styles.selectorText,
                            !origen && styles.selectorPlaceholder
                        ]}>
                            {cargandoRutas
                                ? 'Cargando...'
                                : origen || 'Seleccione origen'}
                        </Text>
                        <Ionicons name="chevron-down" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Destino con modal */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Destino:</Text>
                    <TouchableOpacity
                        style={[
                            styles.selectorButton,
                            !origen && styles.selectorDisabled
                        ]}
                        onPress={() => setModalDestinoVisible(true)}
                        disabled={cargandoRutas || !origen}
                    >
                        <Text style={[
                            styles.selectorText,
                            !destino && styles.selectorPlaceholder
                        ]}>
                            {!origen
                                ? 'Seleccione origen primero'
                                : destino || 'Seleccione destino'}
                        </Text>
                        <Ionicons name="chevron-down" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.boton}
                    onPress={crearViaje}
                >
                    <Text style={styles.botonTexto}>Crear Viaje</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modals */}
            <SelectorModal
                visible={modalOrigenVisible}
                onClose={() => setModalOrigenVisible(false)}
                options={origenesUnicos}
                onSelect={(value) => {
                    setOrigen(value);
                    setDestino('');
                }}
                title="Selecciona Origen"
                selectedValue={origen}
            />

            <SelectorModal
                visible={modalDestinoVisible}
                onClose={() => setModalDestinoVisible(false)}
                options={destinosDisponibles}
                onSelect={setDestino}
                title="Selecciona Destino"
                selectedValue={destino}
            />
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
        marginBottom: 20,
        color: '#207636',
    },
    horarioContainer: {
        marginBottom: 10,
    },
    horarioCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    horarioInfo: {
        marginLeft: 15,
        flex: 1,
    },
    horarioLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 3,
    },
    horarioValor: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    infoSalida: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 20,
        paddingHorizontal: 10,
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
        fontSize: 16,
    },
    selectorButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    selectorDisabled: {
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
    },
    selectorPlaceholder: {
        color: '#999',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalScroll: {
        maxHeight: 400,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionItemSelected: {
        backgroundColor: '#e8f5e9',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    optionTextSelected: {
        fontWeight: 'bold',
        color: '#207636',
    },
    emptyOptions: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
});