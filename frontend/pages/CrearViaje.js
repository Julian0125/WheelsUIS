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
import ViajeService from '../services/ViajeService';

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
    const [creandoViaje, setCreandoViaje] = useState(false);

    const [modalOrigenVisible, setModalOrigenVisible] = useState(false);
    const [modalDestinoVisible, setModalDestinoVisible] = useState(false);

    // ✅ CALCULAR HORA EN 10 MINUTOS PERO EN UTC
    useEffect(() => {
        const ahora = new Date();
        const salidaLocal = new Date(ahora.getTime() + 10 * 60000);

        // Convertir a UTC para que Render no desfase la hora
        const salidaUTC = new Date(
            Date.UTC(
                salidaLocal.getFullYear(),
                salidaLocal.getMonth(),
                salidaLocal.getDate(),
                salidaLocal.getHours(),
                salidaLocal.getMinutes(),
                salidaLocal.getSeconds()
            )
        );

        setHoraSalida(salidaUTC);

        console.log("Hora local:", salidaLocal.toString());
        console.log("Hora enviada al backend (UTC):", salidaUTC.toISOString());
    }, []);

    // Acepta Date u ISO string
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const fechaObj = (typeof fecha === 'string') ? new Date(fecha) : fecha;
        const opciones = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return fechaObj.toLocaleDateString('es-CO', opciones);
    };

    // Acepta Date u ISO string
    const formatearHora = (fecha) => {
        if (!fecha) return '';
        const fechaObj = (typeof fecha === 'string') ? new Date(fecha) : fecha;
        return fechaObj.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                const usuarioGuardado = await AsyncStorage.getItem('usuario');

                if (usuarioGuardado) {
                    const usuario = JSON.parse(usuarioGuardado);

                    if (usuario.tipo === 'CONDUCTOR') {
                        setConductorId(usuario.id);

                        if (usuario.vehiculo) {
                            setVehiculo(usuario.vehiculo);
                            const tipo = (usuario.vehiculo.tipo || '').toString().toUpperCase().trim();
                            setTipoVehiculo(tipo);

                            if (tipo === 'MOTO') {
                                setCupos(1);
                                setMaxCupos(1);
                            } else if (tipo === 'COCHE' || tipo === 'CARRO') {
                                setCupos(1);
                                setMaxCupos(4);
                            }
                        } else {
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

    useEffect(() => {
        if (!conductorId) return;

        const obtenerRutas = async () => {
            try {
                setCargandoRutas(true);
                const response = await fetch(`https://wheelsuis.onrender.com/viaje/rutas-predefinidas?idConductor=${conductorId}`);

                if (response.ok) {
                    const data = await response.json();
                    setRutasDisponibles(data);
                } else {
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

    const aumentarCupos = () => {
        if (cupos < maxCupos) setCupos(cupos + 1);
    };

    const disminuirCupos = () => {
        if (cupos > 1) setCupos(cupos - 1);
    };

    const obtenerTipoViaje = (origen, destino) => {
        const origenLower = origen.toLowerCase().trim();
        const destinoLower = destino.toLowerCase().trim();

        console.log('📍 Analizando ruta:');
        console.log('   Origen:', origen, '→', origenLower);
        console.log('   Destino:', destino, '→', destinoLower);

        if (origenLower.includes('universidad') && destinoLower.includes('mutis')) {
            console.log('✅ Tipo detectado: mutis (Universidad → Barrio Mutis)');
            return 'mutis';
        }

        if (origenLower.includes('universidad') && destinoLower.includes('cumbre')) {
            console.log('✅ Tipo detectado: cumbre (Universidad → Barrio La Cumbre)');
            return 'cumbre';
        }

        if (origenLower.includes('mutis') && destinoLower.includes('universidad')) {
            console.log('✅ Tipo detectado: mutisu (Barrio Mutis → Universidad)');
            return 'mutisu';
        }

        if (origenLower.includes('cumbre') && destinoLower.includes('universidad')) {
            console.log('✅ Tipo detectado: cumbreu (Barrio La Cumbre → Universidad)');
            return 'cumbreu';
        }

        console.error('❌ No se pudo determinar el tipo de viaje');
        return null;
    };

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
            setCreandoViaje(true);

            const viajeActivoCheck = await ViajeService.obtenerViajeActualConductor(conductorId);
            if (viajeActivoCheck.success && viajeActivoCheck.data) {
                const estado = viajeActivoCheck.data.estadoViaje;
                if (estado === 'CREADO' || estado === 'ENCURSO') {
                    Alert.alert(
                        'Viaje Activo',
                        'Ya tienes un viaje activo. Finalízalo antes de crear uno nuevo.',
                        [{ text: 'OK', onPress: () => navigation.replace('ViajeActivo', { viaje: viajeActivoCheck.data }) }]
                    );
                    setCreandoViaje(false);
                    return;
                }
            }

            const tipoViaje = obtenerTipoViaje(origen, destino);

            if (!tipoViaje) {
                Alert.alert(
                    'Ruta no disponible',
                    `Actualmente solo están disponibles las rutas:\n\n` +
                    `✅ Universidad → Barrio Mutis\n` +
                    `✅ Universidad → Barrio La Cumbre\n\n` +
                    `Las rutas inversas (Barrios → Universidad) requieren una actualización del backend.\n\n` +
                    `Por favor, contacta al administrador para habilitar estas rutas.`,
                    [{ text: 'Entendido' }]
                );
                setCreandoViaje(false);
                return;
            }

            console.log('🚀 Creando viaje tipo:', tipoViaje, 'para conductor:', conductorId);
            console.log('📍 Ruta seleccionada:', origen, '→', destino);

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
                console.log('✅ Viaje creado exitosamente:', viaje);

                // Guardar viaje actual y navegar al detalle del viaje
                await ViajeService.guardarViajeActual(viaje);
                navigation.replace('ViajeActivo', { viaje });

            } else {
                const error = await response.text();
                console.error('❌ Error del servidor:', error);
                Alert.alert('Error', error || 'No se pudo crear el viaje');
            }
        } catch (error) {
            console.error('❌ Error al crear viaje:', error);
            Alert.alert('Error', 'No se pudo crear el viaje. Intenta nuevamente.');
        } finally {
            setCreandoViaje(false);
        }
    };

    const origenesUnicos = [...new Set(rutasDisponibles.map(r => r.origen))];
    const destinosDisponibles = origen
        ? rutasDisponibles.filter(r => r.origen === origen).map(r => r.destino)
        : [];

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

    if (creandoViaje) {
        return (
            <View style={styles.loadingFullScreen}>
                <ActivityIndicator size="large" color="#207636" />
                <Text style={styles.loadingText}>Creando tu viaje...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.titulo}>Crear Viaje</Text>

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

                {/* ✅ CORREGIDO: Texto actualizado */}
                <Text style={styles.infoSalida}>
                    ⏱️ El viaje iniciará automáticamente 10 minutos después de crearlo
                </Text>

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
                    disabled={creandoViaje}
                >
                    <Text style={styles.botonTexto}>
                        {creandoViaje ? 'Creando...' : 'Crear Viaje'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

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
    loadingFullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
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
