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
    const [vehiculo, setVehiculo] = useState(null);
    const [tipoVehiculo, setTipoVehiculo] = useState(''); // valores esperados: 'MOTO' o 'COCHE'
    const [conductorId, setConductorId] = useState(null);
    const [rutasDisponibles, setRutasDisponibles] = useState([]);
    const [cargandoRutas, setCargandoRutas] = useState(true);
    const [horaSalida, setHoraSalida] = useState(null);
    const [creandoViaje, setCreandoViaje] = useState(false);

    const [modalOrigenVisible, setModalOrigenVisible] = useState(false);
    const [modalDestinoVisible, setModalDestinoVisible] = useState(false);

    // ============================
    // HORA (+10 MINUTOS)
    // ============================
    useEffect(() => {
        const ahora = new Date();
        const salidaLocal = new Date(ahora.getTime() + 10 * 60000);

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
    }, []);

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatearHora = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============================
    // CARGAR CONDUCTOR + VEHÍCULO
    // ============================
    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                const usuarioGuardado = await AsyncStorage.getItem('usuario');

                if (!usuarioGuardado) {
                    console.warn('No se encontró usuario en AsyncStorage (key "usuario")');
                    return;
                }

                const usuario = JSON.parse(usuarioGuardado);

                if (usuario.tipo === 'CONDUCTOR') {
                    setConductorId(usuario.id);

                    if (usuario.vehiculo) {
                        setVehiculo(usuario.vehiculo);

                        // Tipo EXACTO desde la BD: 'MOTO' o 'COCHE'
                        const tipoRaw = (usuario.vehiculo.tipo || '').toString();
                        const tipo = tipoRaw.toUpperCase().trim();

                        // Mapear solamente los valores esperados
                        if (tipo === 'MOTO') {
                            setTipoVehiculo('MOTO');
                            setCupos(1);
                        } else if (tipo === 'COCHE' || tipo === 'CARRO' || tipo === 'AUTO') {
                            // Aceptamos varias variantes por si hay inconsistencias
                            setTipoVehiculo('COCHE');
                            setCupos(4);
                        } else {
                            // Si llega otro valor, asumimos COCHE por defecto pero mostramos alerta leve
                            console.warn(`Tipo de vehículo desconocido desde BD: "${tipo}" — usando COCHE por defecto`);
                            setTipoVehiculo('COCHE');
                            setCupos(4);
                        }
                    } else {
                        Alert.alert('Error', 'No tienes un vehículo registrado.');
                    }
                }
            } catch (error) {
                console.error('Error al cargar usuario:', error);
            }
        };

        cargarUsuario();
    }, []);

    // ============================
    // RUTAS PREDEFINIDAS
    // ============================
    useEffect(() => {
        if (!conductorId) return;

        const obtenerRutas = async () => {
            try {
                setCargandoRutas(true);

                const response = await fetch(
                    `https://wheelsuis.onrender.com/viaje/rutas-predefinidas?idConductor=${conductorId}`
                );

                if (response.ok) {
                    const data = await response.json();
                    // Aseguramos que venga como array de {origen, destino}
                    if (Array.isArray(data)) setRutasDisponibles(data);
                    else setRutasDisponibles([]);
                } else {
                    usarRutasLocales();
                }
            } catch (err) {
                console.warn('No se pudo obtener rutas remotas, usando locales.', err);
                usarRutasLocales();
            } finally {
                setCargandoRutas(false);
            }
        };

        const usarRutasLocales = () => {
            setRutasDisponibles([
                { origen: 'Universidad', destino: 'Barrio Mutis' },
                { origen: 'Universidad', destino: 'Barrio La Cumbre' },
                { origen: 'Barrio Mutis', destino: 'Universidad' },
                { origen: 'Barrio La Cumbre', destino: 'Universidad' },
            ]);
        };

        obtenerRutas();
    }, [conductorId]);

    // ============================
    // TIPO VIAJE
    // ============================
    const obtenerTipoViaje = (origenStr, destinoStr) => {
        const o = (origenStr || '').toLowerCase();
        const d = (destinoStr || '').toLowerCase();

        if (o.includes('universidad') && d.includes('mutis')) return 'mutis';
        if (o.includes('universidad') && d.includes('cumbre')) return 'cumbre';
        if (o.includes('mutis') && d.includes('universidad')) return 'mutisu';
        if (o.includes('cumbre') && d.includes('universidad')) return 'cumbreu';

        return null;
    };

    // ============================
    // CREAR VIAJE
    // ============================
    const crearViaje = async () => {
        if (!origen || !destino) {
            Alert.alert('Error', 'Selecciona origen y destino.');
            return;
        }

        try {
            setCreandoViaje(true);

            const tipoViaje = obtenerTipoViaje(origen, destino);
            if (!tipoViaje) {
                Alert.alert('Ruta no disponible', 'Selecciona una ruta válida.');
                setCreandoViaje(false);
                return;
            }

            const response = await fetch(
                `https://wheelsuis.onrender.com/viaje/crear/${tipoViaje}?idConductor=${conductorId}`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' } }
            );

            if (response.ok) {
                const viaje = await response.json();
                await ViajeService.guardarViajeActual(viaje);
                navigation.replace('ViajeActivo', { viaje });
            } else {
                Alert.alert('Error', 'No se pudo crear el viaje');
            }
        } catch (error) {
            console.error('Error crear viaje:', error);
            Alert.alert('Error', 'Hubo un problema al crear el viaje.');
        } finally {
            setCreandoViaje(false);
        }
    };

    const origenesUnicos = [...new Set(rutasDisponibles.map(r => r.origen || '').filter(Boolean))];
    const destinosDisponibles = origen
        ? rutasDisponibles.filter(r => r.origen === origen).map(r => r.destino || '').filter(Boolean)
        : [];

    // ============================
    // MODAL SELECTOR (robusto)
    // - acepta options: array de strings o array de objetos {label,value}
    // - onSelect recibe el valor (string)
    // ============================
    const SelectorModal = ({ visible, onClose, options = [], onSelect, title, selectedValue }) => {
        // Normalizar opciones a array de {label, value}
        const opts = options.map(opt => {
            if (opt == null) return null;
            if (typeof opt === 'string' || typeof opt === 'number') return { label: String(opt), value: String(opt) };
            if (typeof opt === 'object') {
                // si es objeto {origen,destino} lo ignoramos aquí (esperamos strings)
                if (opt.label && opt.value) return { label: String(opt.label), value: String(opt.value) };
                // fallback: stringify
                return { label: JSON.stringify(opt), value: JSON.stringify(opt) };
            }
            return null;
        }).filter(Boolean);

        return (
            <Modal animationType="slide" transparent visible={visible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{title}</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 300 }}>
                            {opts.length === 0 && (
                                <View style={{ padding: 20 }}>
                                    <Text style={{ color: '#666' }}>No hay opciones disponibles</Text>
                                </View>
                            )}

                            {opts.map((option, index) => {
                                const isSelected = String(selectedValue) === option.value;
                                return (
                                    <TouchableOpacity
                                        key={`${option.value}-${index}`}
                                        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                                        onPress={() => {
                                            onSelect(option.value);
                                            onClose();
                                        }}
                                    >
                                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    // ============================
    // Render
    // ============================
    if (creandoViaje) {
        return (
            <View style={styles.loadingFullScreen}>
                <ActivityIndicator size="large" color="#207636" />
                <Text style={styles.loadingText}>Creando viaje...</Text>
            </View>
        );
    }

    // Función para permitir cambiar el tipo manualmente tocando el icono (opcional)
    const onSeleccionarTipoVehiculo = (tipo) => {
        if (tipo === 'MOTO') {
            setTipoVehiculo('MOTO');
            setCupos(1);
        } else {
            setTipoVehiculo('COCHE');
            setCupos(4);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.titulo}>Crear Viaje</Text>

                {/* HORARIO */}
                <View style={styles.horarioContainer}>
                    <View style={styles.horarioCard}>
                        <Ionicons name="calendar" size={24} color="#207636" />
                        <View style={styles.horarioInfo}>
                            <Text style={styles.horarioLabel}>Fecha</Text>
                            <Text style={styles.horarioValor}>{formatearFecha(horaSalida)}</Text>
                        </View>
                    </View>

                    <View style={styles.horarioCard}>
                        <Ionicons name="time" size={24} color="#207636" />
                        <View style={styles.horarioInfo}>
                            <Text style={styles.horarioLabel}>Hora</Text>
                            <Text style={styles.horarioValor}>{formatearHora(horaSalida)}</Text>
                        </View>
                    </View>
                </View>

                {/* VEHÍCULO */}
                <View style={styles.vehiculoSection}>
                    <Text style={styles.subtitulo}>Tu vehículo</Text>

                    <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                        {/* MOTO (touchable para validar visualmente) */}
                        {/* MOTO (NO táctil) */}
                        <View style={[styles.iconContainer, tipoVehiculo === 'MOTO' && styles.iconSeleccionado]}>
                            <FontAwesome5
                                name="motorcycle"
                                size={30}
                                color={tipoVehiculo === 'MOTO' ? '#fff' : 'gray'}
                            />
                        </View>

                        {/* COCHE (NO táctil) */}
                        <View style={[styles.iconContainer, tipoVehiculo === 'COCHE' && styles.iconSeleccionado]}>
                            <Ionicons
                                name="car-sport"
                                size={30}
                                color={tipoVehiculo === 'COCHE' ? '#fff' : 'gray'}
                            />
                        </View>

                    </View>

                    {vehiculo && (
                        <Text style={styles.detalleVehiculo}>
                            {vehiculo.marca} {vehiculo.modelo} {'\n'}
                            Placa: {vehiculo.placa}
                        </Text>
                    )}
                </View>

                {/* CUPOS */}
                <View style={styles.cuposContainer}>
                    <Text style={styles.label}>Cupos disponibles:</Text>
                    <View style={styles.cuposFijosBox}>
                        <Ionicons name="people" size={24} color="#207636" />
                        <Text style={styles.cuposFijosTexto}>{cupos} cupos</Text>
                    </View>
                </View>

                {/* ORIGEN */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Origen:</Text>
                    <TouchableOpacity
                        style={styles.selectorButton}
                        onPress={() => setModalOrigenVisible(true)}
                    >
                        <Text style={[styles.selectorText, !origen && styles.selectorPlaceholder]}>
                            {origen || 'Seleccione origen'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* DESTINO */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Destino:</Text>
                    <TouchableOpacity
                        style={styles.selectorButton}
                        onPress={() => setModalDestinoVisible(true)}
                        disabled={!origen}
                    >
                        <Text style={[styles.selectorText, !destino && styles.selectorPlaceholder]}>
                            {destino || (origen ? 'Seleccione destino' : 'Seleccione origen primero')}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* BOTÓN CREAR */}
                <TouchableOpacity style={styles.boton} onPress={crearViaje}>
                    <Text style={styles.botonTexto}>Crear Viaje</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* MODALES */}
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
                onSelect={(value) => setDestino(value)}
                title="Selecciona Destino"
                selectedValue={destino}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 30 : 0 },
    container: { padding: 20 },
    titulo: { fontSize: 28, fontWeight: 'bold', color: '#207636', textAlign: 'center', marginBottom: 20 },

    horarioContainer: { marginBottom: 10 },
    horarioCard: { flexDirection: 'row', backgroundColor: '#f8f8f8', padding: 15, borderRadius: 12, marginBottom: 10 },
    horarioInfo: { marginLeft: 15 },
    horarioLabel: { fontSize: 14, color: '#666' },
    horarioValor: { fontSize: 16, fontWeight: '600', color: '#333' },

    vehiculoSection: { alignItems: 'center', marginBottom: 20 },
    subtitulo: { fontSize: 18, fontWeight: '600', color: '#444' },

    iconContainer: {
        padding: 15,
        marginHorizontal: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc'
    },
    iconSeleccionado: {
        backgroundColor: '#207636',
        borderColor: '#207636'
    },
    detalleVehiculo: { textAlign: 'center', marginTop: 10, color: '#555', fontWeight: '500' },

    cuposContainer: { marginBottom: 20, alignItems: 'center' },
    cuposFijosBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e8f5e9',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 12
    },
    cuposFijosTexto: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#207636' },

    inputContainer: { marginBottom: 15 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 5 },

    selectorButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 15,
        borderRadius: 10
    },
    selectorText: { fontSize: 16, color: '#333' },
    selectorPlaceholder: { color: '#999' },

    boton: { backgroundColor: '#207636', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    botonTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    optionItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    optionItemSelected: { backgroundColor: '#e8f5e9' },
    optionText: { fontSize: 16 },
    optionTextSelected: { fontWeight: 'bold', color: '#207636' },

    loadingFullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666' },
});
