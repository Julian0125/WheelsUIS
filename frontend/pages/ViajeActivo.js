import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ViajeService from '../services/ViajeService';
import ViajePollingService from '../services/ViajePollingService';
import { useFocusEffect } from '@react-navigation/native';
import AlertService from "../utils/AlertService";

export default function ViajeActivo({ navigation, route }) {
    const { usuario } = useAuth();
    const [viaje, setViaje] = useState(route.params?.viaje || null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [cancelandoViaje, setCancelandoViaje] = useState(false);
    const [mensajeEstado, setMensajeEstado] = useState('');

    const convertirFechaLocal = (fecha) => {
        if (!fecha) return null;
        try {
            if (fecha instanceof Date) return fecha;
            return new Date(fecha);
        } catch {
            return null;
        }
    };

    // Polling para actualizar cupos automáticamente cada 5s
    useEffect(() => {
        if (!viaje?.id) return;

        const interval = setInterval(() => {
            actualizarViajeEnSegundoPlano();
        }, 5000);

        return () => clearInterval(interval);
    }, [viaje?.id]);

    const actualizarViajeEnSegundoPlano = async () => {
        try {
            const result = await ViajeService.obtenerViajeActualConductor(usuario.id);

            if (result && result.success && result.data) {
                if (result.data.horaSalida) {
                    result.data.horaSalida = convertirFechaLocal(result.data.horaSalida);
                }

                if (JSON.stringify(result.data) !== JSON.stringify(viaje)) {
                    console.log('🔄 Viaje actualizado automáticamente');
                    setViaje(result.data);
                }
            }
        } catch (error) {
            console.error('Error al actualizar viaje:', error);
        }
    };

    useEffect(() => {
        if (viaje) {
            if (viaje.horaSalida) {
                viaje.horaSalida = convertirFechaLocal(viaje.horaSalida);
            }
            if (viaje.estadoViaje === 'CREADO') {
                ViajePollingService.iniciarMonitoreo(viaje.id, handleViajeIniciado);
            }
        } else {
            cargarViajeActual();
        }

        return () => {
            ViajePollingService.detenerMonitoreo();
        };
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (viaje?.id) cargarViajeActual();
        }, [viaje?.id])
    );

    const cargarViajeActual = async () => {
        try {
            setLoading(true);
            const result = await ViajeService.obtenerViajeActualConductor(usuario.id);

            if (result && result.success) {
                const data = result.data;
                if (data.horaSalida) data.horaSalida = convertirFechaLocal(data.horaSalida);

                // 🔥 SI EL VIAJE YA ESTÁ EN CURSO → REDIRIGIR
                if (data.estadoViaje === 'ENCURSO') {
                    ViajePollingService.detenerMonitoreo();
                    navigation.replace('ViajeEnCurso', { viaje: data });
                    return;
                }

                // FINALIZADO → mostramos modal comentario
                if (data.estadoViaje === 'FINALIZADO') {
                    ViajePollingService.detenerMonitoreo();
                    await ViajeService.limpiarViajeActual();
                    navigation.replace('HomeConductor');
                    return;
                }

                // CANCELADO → limpiar y volver al home
                if (data.estadoViaje === 'CANCELADO') {
                    ViajePollingService.detenerMonitoreo();
                    await ViajeService.limpiarViajeActual();
                    navigation.replace('HomeConductor');
                    return;
                }

                // CREADO → monitorear
                if (data.estadoViaje === 'CREADO') {
                    ViajePollingService.iniciarMonitoreo(data.id, handleViajeIniciado);
                }

                setViaje(data);
            } else {
                navigation.replace('HomeConductor');
            }
        } catch (error) {
            console.error('Error cargarViajeActual:', error);
            AlertService.alert('Error', 'No se pudo cargar el viaje');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await cargarViajeActual();
        setRefreshing(false);
    };

    const handleViajeIniciado = (iniciado, mensaje) => {
        setMensajeEstado(mensaje || '');

        if (iniciado) {
            AlertService.alert(
                '🚗 Viaje Iniciado',
                'Tu viaje ha comenzado automáticamente.',
                [{
                    text: 'OK',
                    onPress: async () => {
                        // 🔥 CARGAR VIAJE ACTUALIZADO Y REDIRIGIR
                        const result = await ViajeService.obtenerViajeActualConductor(usuario.id);
                        if (result.success && result.data) {
                            ViajePollingService.detenerMonitoreo();
                            navigation.replace('ViajeEnCurso', { viaje: result.data });
                        }
                    }
                }]
            );
        }
    };

    const handleCancelarViaje = () => {
        AlertService.confirm(
            'Cancelar Viaje',
            '¿Seguro que quiere cancelar este viaje?',
            async () => {
                try {
                    setCancelandoViaje(true);
                    const result = await ViajeService.cancelarViaje(
                        viaje.id,
                        usuario.id,
                        'CONDUCTOR'
                    );

                    if (result && result.success) {
                        ViajePollingService.detenerMonitoreo();
                        await ViajeService.limpiarViajeActual();

                        AlertService.alert(
                            'Viaje Cancelado',
                            'El viaje ha sido cancelado correctamente.',
                            [{ text: 'OK', onPress: () => navigation.replace('HomeConductor') }]
                        );
                    } else {
                        AlertService.alert('Error', result?.error || 'No se pudo cancelar el viaje');
                    }
                } catch (err) {
                    console.error('Error cancelar:', err);
                    AlertService.alert('Error', 'No se pudo cancelar el viaje');
                } finally {
                    setCancelandoViaje(false);
                }
            }
        );
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha no disponible';
        try {
            const fechaObj = typeof fecha === 'string' ? convertirFechaLocal(fecha) : fecha;
            return fechaObj.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'America/Bogota'
            });
        } catch (error) {
            return 'Error en fecha';
        }
    };

    const formatearHora = (fecha) => {
        if (!fecha) return 'Hora no disponible';
        try {
            const fechaObj = typeof fecha === 'string' ? convertirFechaLocal(fecha) : fecha;
            return fechaObj.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Bogota'
            });
        } catch {
            return 'Error en hora';
        }
    };

    if (loading && !viaje) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#207636" />
                <Text style={styles.loadingText}>Cargando viaje...</Text>
            </View>
        );
    }

    if (!viaje) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="car-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>No hay viaje activo</Text>
                <TouchableOpacity
                    style={styles.botonVolver}
                    onPress={() => navigation.replace('HomeConductor')}
                >
                    <Text style={styles.botonVolverText}>Volver al inicio</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const cuposDisponibles = (viaje.cuposMaximos || 0) - (viaje.pasajeros?.length || 0);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#207636']} />
            }
        >
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitleCentered}>Viaje Activo</Text>
            </View>

            {/* ESTADO */}
            <View style={[styles.estadoBadge, { backgroundColor: '#FFA726' }]}>
                <Ionicons name="time" size={24} color="#fff" />
                <Text style={styles.estadoTexto}>⏳ Esperando inicio automático</Text>
            </View>

            {/* MENSAJE DE ESTADO DEL MONITOREO */}
            {mensajeEstado !== '' && (
                <View style={styles.mensajeEstadoBox}>
                    <Ionicons name="information-circle" size={20} color="#2196F3" />
                    <Text style={styles.mensajeEstadoTexto}>{mensajeEstado}</Text>
                </View>
            )}

            {/* RUTA */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📍 Ruta del Viaje</Text>

                <View style={styles.rutaContainer}>
                    <View style={styles.ubicacion}>
                        <Ionicons name="location" size={28} color="#207636" />
                        <View style={styles.ubicacionInfo}>
                            <Text style={styles.ubicacionLabel}>Origen</Text>
                            <Text style={styles.ubicacionTexto}>{viaje.origen}</Text>
                        </View>
                    </View>

                    <View style={styles.lineaDivisora}>
                        <View style={styles.lineaVertical} />
                        <Ionicons name="arrow-down" size={24} color="#999" />
                    </View>

                    <View style={styles.ubicacion}>
                        <Ionicons name="location" size={28} color="#E63946" />
                        <View style={styles.ubicacionInfo}>
                            <Text style={styles.ubicacionLabel}>Destino</Text>
                            <Text style={styles.ubicacionTexto}>{viaje.destino}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* DETALLES */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📋 Detalles</Text>

                <View style={styles.detalleRow}>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                    <Text style={styles.detalleTexto}>
                        {formatearFecha(viaje.horaSalida)}
                    </Text>
                </View>

                <View style={styles.detalleRow}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.detalleTexto}>
                        {formatearHora(viaje.horaSalida)}
                    </Text>
                </View>

                <View style={styles.detalleRow}>
                    <Ionicons name="people-outline" size={20} color="#666" />
                    <Text style={styles.detalleTexto}>
                        {viaje.pasajeros?.length || 0} / {viaje.cuposMaximos || 0} pasajeros
                    </Text>
                </View>

                {cuposDisponibles > 0 && (
                    <View style={styles.cuposDisponiblesBox}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.cuposDisponiblesText}>
                            {cuposDisponibles} {cuposDisponibles === 1 ? 'cupo disponible' : 'cupos disponibles'}
                        </Text>
                    </View>
                )}

                {viaje.pasajeros && viaje.pasajeros.length > 0 && (
                    <View style={styles.pasajerosList}>
                        <Text style={styles.pasajerosTitle}>Pasajeros confirmados:</Text>
                        {viaje.pasajeros.map((pasajero, index) => (
                            <View key={index} style={styles.pasajeroItem}>
                                <Ionicons name="person-circle-outline" size={24} color="#207636" />
                                <Text style={styles.pasajeroNombre}>{pasajero.nombre}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* BOTÓN CANCELAR */}
            <View style={styles.botonesContainer}>
                <TouchableOpacity
                    style={[styles.botonAccion, styles.botonCancelar]}
                    onPress={handleCancelarViaje}
                    disabled={cancelandoViaje}
                >
                    {cancelandoViaje ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="close-circle" size={24} color="#fff" />
                            <Text style={styles.botonAccionTexto}>Cancelar Viaje</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* INFO AUTOMÁTICA */}
            <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={24} color="#2196F3" />
                <Text style={styles.infoTexto}>
                    🤖 El viaje iniciará automáticamente cuando:{'\n\n'}
                    ✅ Pasen 10 minutos desde su creación{'\n'}
                    ✅ Se llenen todos los cupos disponibles{'\n\n'}
                    ⚡ No necesitas hacer nada, el sistema lo hará por ti.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#207636',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTitleCentered: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center'
    },
    estadoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
    },
    estadoTexto: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    mensajeEstadoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        marginHorizontal: 20,
        marginTop: 10,
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#2196F3',
    },
    mensajeEstadoTexto: {
        flex: 1,
        marginLeft: 10,
        fontSize: 13,
        color: '#1976D2',
    },
    card: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 15,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    rutaContainer: {
        paddingVertical: 10,
    },
    ubicacion: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ubicacionInfo: {
        marginLeft: 15,
        flex: 1,
    },
    ubicacionLabel: {
        fontSize: 12,
        color: '#999',
    },
    ubicacionTexto: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    lineaDivisora: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    lineaVertical: {
        width: 2,
        height: 30,
        backgroundColor: '#ddd',
        marginBottom: 5,
    },
    detalleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detalleTexto: {
        fontSize: 16,
        color: '#555',
        marginLeft: 12,
    },
    cuposDisponiblesBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    cuposDisponiblesText: {
        fontSize: 14,
        color: '#2E7D32',
        fontWeight: '600',
        marginLeft: 8,
    },
    pasajerosList: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    pasajerosTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
    },
    pasajeroItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    pasajeroNombre: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
    botonesContainer: {
        padding: 20,
        paddingTop: 0,
    },
    botonAccion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    botonCancelar: {
        backgroundColor: '#F44336',
    },
    botonAccionTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    infoTexto: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#1976D2',
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 20,
        marginBottom: 30,
    },
    botonVolver: {
        backgroundColor: '#207636',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    botonVolverText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});