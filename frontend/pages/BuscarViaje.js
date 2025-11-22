import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ViajesDisponiblesService from '../services/ViajesDisponiblesService';
import AlertService from '../utils/AlertService';
import ViajeService from '../services/ViajeService';

export default function BuscarViaje({ navigation }) {
    const { usuario } = useAuth();
    const [viajes, setViajes] = useState([]);
    const [viajesFiltrados, setViajesFiltrados] = useState([]);
    const [loading, setLoading] = useState(true); // ahora controla sólo la sección de resultados
    const [refreshing, setRefreshing] = useState(false);
    const [filtroOrigen, setFiltroOrigen] = useState(null);
    const [filtroDestino, setFiltroDestino] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
    const [uniendose, setUniendose] = useState(false);

    // selectores
    const [modalSelectorVisible, setModalSelectorVisible] = useState(false);
    const [selectorOptions, setSelectorOptions] = useState([]);
    const [selectorTitle, setSelectorTitle] = useState('');
    const [selectorTarget, setSelectorTarget] = useState(null); // 'origen' | 'destino'

    useEffect(() => {
        cargarViajes();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [filtroOrigen, filtroDestino, viajes]);

    const cargarViajes = async () => {
        try {
            setLoading(true);

            if (usuario?.id) {
                try {
                    const verificacion = await ViajesDisponiblesService.verificarViajeActivo(usuario.id);

                    if (verificacion?.tieneViajeActivo) {
                        if (verificacion.data) {
                            // 🔥 Redirigir según el estado del viaje
                            const viajeActivo = verificacion.data;

                            AlertService.alert(
                                'Viaje Activo',
                                'Ya tienes un viaje activo. Te llevaremos al detalle de tu viaje actual.',
                                [{
                                    text: 'Ver mi viaje',
                                    onPress: () => {
                                        if (viajeActivo.estadoViaje === "CREADO") {
                                            navigation.replace('ViajeActivoPasajero', { viaje: viajeActivo });
                                        } else if (viajeActivo.estadoViaje === "ENCURSO") {
                                            navigation.replace('ViajeEnCursoPasajero', { viaje: viajeActivo });
                                        }
                                    }
                                }]
                            );
                            return;
                        } else {
                            AlertService.alert(
                                'Viaje Activo',
                                'Ya tienes un viaje activo. No puedes unirte a otro hasta que termine.',
                                [{ text: 'OK', onPress: () => navigation.goBack() }]
                            );
                            return;
                        }
                    }
                } catch (err) {
                    console.warn('No se pudo verificar viaje activo (no crítico):', err);
                }
            }

            const result = await ViajesDisponiblesService.obtenerViajesDisponibles();

            if (result.success) {
                // Normalizamos la estructura mínima que usamos (asegurar campos)
                const prepared = (result.data || []).map(v => ({
                    ...v,
                    origen: v.origen || '',
                    destino: v.destino || '',
                    vehiculo: v.vehiculo || null,
                    conductor: v.conductor || { nombre: 'Conductor' },
                    cuposDisponibles: typeof v.cuposDisponibles === 'number' ? v.cuposDisponibles : (v.cuposMaximos - (v.cuposOcupados ?? 0)),
                    cuposMaximos: v.cuposMaximos ?? 0,
                    cuposOcupados: v.cuposOcupados ?? 0,
                }));

                setViajes(prepared);
            } else {
                AlertService.alert('Error', result.error);
                setViajes([]);
            }
        } catch (error) {
            console.error('Error al cargar viajes:', error);
            AlertService.alert('Error', 'No se pudieron cargar los viajes disponibles');
            setViajes([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await cargarViajes();
        setRefreshing(false);
    };

    const aplicarFiltros = () => {
        let filtro = [...viajes];

        if (filtroOrigen) filtro = filtro.filter(v => v.origen === filtroOrigen);
        if (filtroDestino) filtro = filtro.filter(v => v.destino === filtroDestino);

        setViajesFiltrados(filtro);
    };

    const obtenerOrigenes = () => {
        const origenes = [...new Set(viajes.map(v => v.origen).filter(Boolean))];
        return origenes.sort();
    };

    const obtenerDestinos = () => {
        let destinos = viajes.map(v => v.destino).filter(Boolean);

        if (filtroOrigen) destinos = viajes.filter(v => v.origen === filtroOrigen).map(v => v.destino).filter(Boolean);

        return [...new Set(destinos)].sort();
    };

    const abrirSelector = (target) => {
        if (target === 'origen') {
            setSelectorOptions(obtenerOrigenes());
            setSelectorTitle('Selecciona Origen');
        } else {
            setSelectorOptions(obtenerDestinos());
            setSelectorTitle('Selecciona Destino');
        }
        setSelectorTarget(target);
        setModalSelectorVisible(true);
    };

    const onSelectOption = (option) => {
        setModalSelectorVisible(false);
        if (selectorTarget === 'origen') {
            setFiltroOrigen(option);
            setFiltroDestino(null); // limpiar destino al cambiar origen
        } else {
            setFiltroDestino(option);
        }
    };

    const handleVerDetalleViaje = (viaje) => {
        setViajeSeleccionado(viaje);
        setModalVisible(true);
    };

    const handleUnirseAlViaje = async () => {
        if (!viajeSeleccionado) return;

        try {
            setUniendose(true);

            const result = await ViajesDisponiblesService.unirseAViaje(
                viajeSeleccionado.id,
                usuario.id
            );

            if (result.success) {
                // Serializar el viaje antes de guardar (convertir fechas a strings)
                const viajeSerializado = {
                    ...result.data,
                    horaSalida: result.data.horaSalida ? result.data.horaSalida.toString() : null,
                    horaLlegada: result.data.horaLlegada ? result.data.horaLlegada.toString() : null,
                };

                // guardar viaje SERIALIZADO en storage
                await ViajeService.guardarViajeActual(viajeSerializado);

                setModalVisible(false);

                // Pequeño delay para asegurar que el storage se guarde
                setTimeout(() => {
                    // Pasar viaje SERIALIZADO en navegación
                    navigation.replace("ViajeActivoPasajero", { viaje: viajeSerializado });
                }, 100);
            } else {
                AlertService.alert('Error', result.error);
            }
        } catch (error) {
            console.error('Error al unirse:', error);
            AlertService.alert('Error', 'No se pudo completar la reserva');
        } finally {
            setUniendose(false);
        }
    };


    const obtenerIconoVehiculo = (tipo) => {
        if (!tipo) return 'car-sport';
        const t = tipo.toString().toUpperCase();
        if (t.includes('MOTO') || t.includes('MOTOCICLETA')) return 'motorcycle'; // usaremos FontAwesome5
        // por defecto carro
        return 'car-sport'; // Ionicons
    };

    const renderVehiculoIcon = (tipo) => {
        const iconName = obtenerIconoVehiculo(tipo);
        if (iconName === 'motorcycle') {
            return <FontAwesome5 name="motorcycle" size={32} color="#207636" />;
        }
        return <Ionicons name="car-sport" size={32} color="#207636" />;
    };

    const renderViajeCard = (viaje) => {
        const horaSalida = ViajesDisponiblesService.formatearHoraSalida
            ? ViajesDisponiblesService.formatearHoraSalida(viaje.horaSalida)
            : (viaje.horaSalida ? new Date(viaje.horaSalida).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '');

        return (
            <TouchableOpacity
                key={viaje.id}
                style={styles.card}
                onPress={() => handleVerDetalleViaje(viaje)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconoVehiculoContainer}>
                        {renderVehiculoIcon(viaje.vehiculo?.tipo)}
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.rutaContainer}>
                            <Ionicons name="location" size={16} color="#207636" />
                            <Text style={styles.lugar} numberOfLines={1}>
                                {viaje.origen}
                            </Text>
                        </View>

                        <Ionicons name="arrow-forward" size={14} color="#999" style={styles.flechaRuta} />

                        <View style={styles.rutaContainer}>
                            <Ionicons name="location" size={16} color="#E63946" />
                            <Text style={styles.lugar} numberOfLines={1}>
                                {viaje.destino}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={18} color="#666" />
                        <Text style={styles.infoText}>{horaSalida}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={18} color="#666" />
                        <Text style={styles.infoText}>{viaje.conductor?.nombre || 'Conductor'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="people-outline" size={18} color="#666" />
                        <Text style={[
                            styles.infoText,
                            viaje.cuposDisponibles === 1 && styles.ultimoCupo
                        ]}>
                            {viaje.cuposDisponibles} {viaje.cuposDisponibles === 1 ? 'cupo' : 'cupos'} disponible{viaje.cuposDisponibles !== 1 ? 's' : ''}
                        </Text>
                    </View>

                    {viaje.vehiculo && (
                        <View style={styles.infoRow}>
                            <Ionicons name="car-outline" size={18} color="#666" />
                            <Text style={styles.infoText}>
                                {viaje.vehiculo.marca} {viaje.vehiculo.modelo}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.badgeCupos}>
                        <Text style={styles.badgeCuposText}>
                            {viaje.cuposOcupados}/{viaje.cuposMaximos} ocupados
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
            </TouchableOpacity>
        );
    };

    // --- UI ---
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.botonAtras}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Buscar Viaje</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#207636']}
                    />
                }
            >
                {/* Filtros */}
                <View style={styles.filtrosContainer}>
                    <Text style={styles.filtrosTitle}>Filtrar por:</Text>

                    <View style={styles.filtrosRow}>
                        <View style={styles.filtroWrapper}>
                            <Text style={styles.filtroLabel}>Origen</Text>
                            <TouchableOpacity
                                style={styles.filtroButton}
                                onPress={() => abrirSelector('origen')}
                            >
                                <Text style={styles.filtroButtonText}>
                                    {filtroOrigen || 'Todos'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filtroWrapper}>
                            <Text style={styles.filtroLabel}>Destino</Text>
                            <TouchableOpacity
                                style={styles.filtroButton}
                                onPress={() => abrirSelector('destino')}
                                disabled={obtenerDestinos().length === 0}
                            >
                                <Text style={styles.filtroButtonText}>
                                    {filtroDestino || 'Todos'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {(filtroOrigen || filtroDestino) && (
                        <TouchableOpacity
                            style={styles.limpiarFiltrosButton}
                            onPress={() => {
                                setFiltroOrigen(null);
                                setFiltroDestino(null);
                            }}
                        >
                            <Ionicons name="close-circle" size={18} color="#666" />
                            <Text style={styles.limpiarFiltrosText}>Limpiar filtros</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Zona de resultados: si está cargando mostramos indicador aquí, no pantalla completa */}
                <View style={{ minHeight: 200 }}>
                    {loading ? (
                        <View style={styles.loadingInline}>
                            <ActivityIndicator size="large" color="#207636" />
                            <Text style={styles.loadingText}>Buscando viajes disponibles...</Text>
                        </View>
                    ) : (
                        <>
                            {viajesFiltrados.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="car-outline" size={80} color="#ccc" />
                                    <Text style={styles.emptyText}>
                                        {viajes.length === 0
                                            ? 'No hay viajes disponibles en este momento'
                                            : 'No hay viajes que coincidan con los filtros'}
                                    </Text>
                                    <Text style={styles.emptySubtext}>
                                        Los viajes aparecerán aquí cuando los conductores los publiquen
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.resultadosText}>
                                        {viajesFiltrados.length} {viajesFiltrados.length === 1 ? 'viaje disponible' : 'viajes disponibles'}
                                    </Text>

                                    {viajesFiltrados.map(viaje => renderViajeCard(viaje))}
                                </>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Modal de detalle del viaje */}
            {viajeSeleccionado && (
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Detalles del Viaje</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={28} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                {/* Ruta */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>📍 Ruta</Text>
                                    <Text style={styles.modalRutaText}>
                                        {viajeSeleccionado.origen} → {viajeSeleccionado.destino}
                                    </Text>
                                </View>

                                {/* Hora */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>🕐 Hora de Salida</Text>
                                    <Text style={styles.modalInfoText}>
                                        {viajeSeleccionado.horaSalida ? new Date(viajeSeleccionado.horaSalida).toLocaleString('es-CO', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            timeZone: 'America/Bogota', 
                                        }) : 'Hora no disponible'}
                                    </Text>
                                </View>

                                {/* Conductor */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>👤 Conductor</Text>
                                    <Text style={styles.modalInfoText}>
                                        {viajeSeleccionado.conductor?.nombre}
                                    </Text>
                                    <Text style={styles.modalInfoSubtext}>
                                        Tel: {viajeSeleccionado.conductor?.celular || 'No disponible'}
                                    </Text>
                                </View>

                                {/* Vehículo */}
                                {viajeSeleccionado.vehiculo && (
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>🚗 Vehículo</Text>
                                        <Text style={styles.modalInfoText}>
                                            {viajeSeleccionado.vehiculo.marca} {viajeSeleccionado.vehiculo.modelo}
                                        </Text>
                                        <Text style={styles.modalInfoSubtext}>
                                            Tipo: {viajeSeleccionado.vehiculo.tipo} • Placa: {viajeSeleccionado.vehiculo.placa}
                                        </Text>
                                    </View>
                                )}

                                {/* Cupos */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>👥 Disponibilidad</Text>
                                    <Text style={[
                                        styles.modalInfoText,
                                        viajeSeleccionado.cuposDisponibles === 1 && styles.ultimoCupo
                                    ]}>
                                        {viajeSeleccionado.cuposDisponibles} de {viajeSeleccionado.cuposMaximos} cupos disponibles
                                    </Text>
                                    {viajeSeleccionado.cuposDisponibles === 1 && (
                                        <Text style={styles.ultimoCupoText}>⚠️ ¡Último cupo disponible!</Text>
                                    )}
                                </View>

                                {/* Advertencia */}
                                <View style={styles.advertenciaBox}>
                                    <Ionicons name="information-circle" size={20} color="#2196F3" />
                                    <Text style={styles.advertenciaText}>
                                        Al unirte al viaje, el conductor podrá ver tu información de contacto.
                                    </Text>
                                </View>
                            </ScrollView>

                            {/* Botones */}
                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.botonCancelar}
                                    onPress={() => setModalVisible(false)}
                                    disabled={uniendose}
                                >
                                    <Text style={styles.botonCancelarText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.botonUnirse,
                                        uniendose && styles.botonDeshabilitado
                                    ]}
                                    onPress={handleUnirseAlViaje}
                                    disabled={uniendose}
                                >
                                    {uniendose ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                            <Text style={styles.botonUnirseText}>Unirme al Viaje</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* SelectorModal para filtros (origen/destino) */}
            <Modal animationType="slide" transparent visible={modalSelectorVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectorTitle}</Text>
                            <TouchableOpacity onPress={() => setModalSelectorVisible(false)}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 300 }}>
                            {selectorOptions.length === 0 ? (
                                <View style={{ padding: 20 }}>
                                    <Text style={{ color: '#666' }}>No hay opciones</Text>
                                </View>
                            ) : (
                                selectorOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.optionItem, ((selectorTarget === 'origen' && option === filtroOrigen) || (selectorTarget === 'destino' && option === filtroDestino)) && styles.optionItemSelected]}
                                        onPress={() => onSelectOption(option)}
                                    >
                                        <Text style={[styles.optionText, ((selectorTarget === 'origen' && option === filtroOrigen) || (selectorTarget === 'destino' && option === filtroDestino)) && styles.optionTextSelected]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#207636',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    botonAtras: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    loadingInline: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingContainer: {
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
    filtrosContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        marginBottom: 10,
    },
    filtrosTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    filtrosRow: {
        flexDirection: 'row',
        gap: 10,
    },
    filtroWrapper: {
        flex: 1,
    },
    filtroLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    filtroButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filtroButtonText: {
        fontSize: 14,
        color: '#333',
    },
    limpiarFiltrosButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        padding: 8,
    },
    limpiarFiltrosText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    resultadosText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconoVehiculoContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoContainer: {
        flex: 1,
    },
    rutaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    lugar: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    flechaRuta: {
        marginLeft: 24,
        marginVertical: 2,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    cardBody: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
        flex: 1,
    },
    ultimoCupo: {
        color: '#F57C00',
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    badgeCupos: {
        backgroundColor: '#E8F5E9',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    badgeCuposText: {
        fontSize: 12,
        color: '#207636',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#bbb',
        textAlign: 'center',
        marginTop: 10,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
    },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
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
    modalBody: {
        padding: 20,
    },
    modalSection: {
        marginBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    modalRutaText: {
        fontSize: 18,
        color: '#207636',
        fontWeight: '600',
    },
    modalInfoText: {
        fontSize: 16,
        color: '#333',
    },
    modalInfoSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    ultimoCupoText: {
        fontSize: 14,
        color: '#F57C00',
        fontWeight: 'bold',
        marginTop: 5,
    },
    advertenciaBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    advertenciaText: {
        flex: 1,
        fontSize: 13,
        color: '#1976D2',
        marginLeft: 10,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    botonCancelar: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    botonCancelarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    botonUnirse: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#207636',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    botonUnirseText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    botonDeshabilitado: {
        opacity: 0.6,
    },

    // selector modal options
    optionItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    optionItemSelected: { backgroundColor: '#e8f5e9' },
    optionText: { fontSize: 16 },
    optionTextSelected: { fontWeight: 'bold', color: '#207636' },
});
