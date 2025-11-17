import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ViajeService from '../services/ViajeService';
import ViajePollingService from '../services/ViajePollingService';
import { useFocusEffect } from '@react-navigation/native';

export default function ViajeActivo({ navigation, route }) {
    const { usuario } = useAuth();
    const [viaje, setViaje] = useState(route.params?.viaje || null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [iniciandoViaje, setIniciandoViaje] = useState(false);
    const [finalizandoViaje, setFinalizandoViaje] = useState(false);
    const [cancelandoViaje, setCancelandoViaje] = useState(false);

    useEffect(() => {
        console.log('🔍 ViajeActivo montado con viaje:', viaje?.id);

        if (viaje) {
            if (viaje.estadoViaje === 'CREADO') {
                console.log('⏱️ Iniciando monitoreo del viaje:', viaje.id);
                ViajePollingService.iniciarMonitoreo(viaje.id, handleViajeIniciado);
            }
        } else {
            console.log('⚠️ No hay viaje en params, cargando desde AsyncStorage...');
            cargarViajeActual();
        }

        return () => {
            console.log('🛑 Deteniendo monitoreo');
            ViajePollingService.detenerMonitoreo();
        };
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (viaje?.id) {
                cargarViajeActual();
            }
        }, [viaje?.id])
    );

    const cargarViajeActual = async () => {
        try {
            setLoading(true);
            const result = await ViajeService.obtenerViajeActualConductor(usuario.id);

            if (result.success) {
                setViaje(result.data);

                if (result.data.estadoViaje === 'FINALIZADO' || result.data.estadoViaje === 'CANCELADO') {
                    console.log('✅ Viaje finalizado/cancelado, volviendo al home');
                    navigation.replace('HomeConductor');
                    return;
                }

                if (result.data.estadoViaje === 'CREADO') {
                    ViajePollingService.iniciarMonitoreo(result.data.id, handleViajeIniciado);
                }
            } else {
                console.log('❌ No hay viaje activo, volviendo al home');
                navigation.replace('HomeConductor');
            }
        } catch (error) {
            console.error('Error al cargar viaje:', error);
            Alert.alert('Error', 'No se pudo cargar el viaje');
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
        if (iniciado) {
            Alert.alert(
                '🚗 Viaje Iniciado',
                'Tu viaje ha comenzado automáticamente. Los pasajeros han sido notificados.',
                [{ text: 'OK', onPress: () => cargarViajeActual() }]
            );
        }
    };

    const handleIniciarManual = async () => {
        Alert.alert(
            'Iniciar Viaje',
            '¿Estás seguro que deseas iniciar el viaje ahora?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Iniciar',
                    onPress: async () => {
                        try {
                            setIniciandoViaje(true);
                            console.log('🚀 Iniciando viaje manualmente:', viaje.id);

                            const result = await ViajeService.iniciarViaje(viaje.id);

                            if (result.success) {
                                console.log('✅ Viaje iniciado exitosamente');

                                // Actualizar estado local
                                const viajeActualizado = { ...viaje, estadoViaje: 'ENCURSO' };
                                setViaje(viajeActualizado);
                                await ViajeService.guardarViajeActual(viajeActualizado);

                                // Detener monitoreo
                                ViajePollingService.detenerMonitoreo();

                                Alert.alert(
                                    'Éxito',
                                    'El viaje ha iniciado correctamente',
                                    [{ text: 'OK' }]
                                );
                            } else {
                                console.error('❌ Error al iniciar:', result.error);
                                Alert.alert('Error', result.error || 'No se pudo iniciar el viaje');
                            }
                        } catch (error) {
                            console.error('❌ Error:', error);
                            Alert.alert('Error', 'No se pudo iniciar el viaje');
                        } finally {
                            setIniciandoViaje(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCancelarViaje = () => {
        Alert.alert(
            'Cancelar Viaje',
            '¿Estás seguro que deseas cancelar este viaje? Esta acción cambiará el estado a CANCELADO y notificará a los pasajeros.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí, cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setCancelandoViaje(true);
                            console.log('🚫 Cancelando viaje:', viaje.id);

                            const result = await ViajeService.cancelarViaje(
                                viaje.id,
                                usuario.id,
                                'CONDUCTOR'
                            );

                            if (result.success) {
                                console.log('✅ Viaje cancelado exitosamente');

                                // Detener monitoreo
                                ViajePollingService.detenerMonitoreo();

                                // Limpiar AsyncStorage
                                await ViajeService.limpiarViajeActual();

                                Alert.alert(
                                    'Viaje Cancelado',
                                    'El viaje ha sido cancelado correctamente. Los pasajeros han sido notificados.',
                                    [{ text: 'OK', onPress: () => navigation.replace('HomeConductor') }]
                                );
                            } else {
                                console.error('❌ Error al cancelar:', result.error);
                                Alert.alert('Error', result.error || 'No se pudo cancelar el viaje');
                            }
                        } catch (error) {
                            console.error('❌ Error:', error);
                            Alert.alert('Error', 'No se pudo cancelar el viaje');
                        } finally {
                            setCancelandoViaje(false);
                        }
                    }
                }
            ]
        );
    };

    const handleFinalizarViaje = () => {
        Alert.alert(
            'Finalizar Viaje',
            '¿Has llegado al destino? Esto finalizará el viaje.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí, finalizar',
                    onPress: async () => {
                        try {
                            setFinalizandoViaje(true);
                            console.log('🏁 Finalizando viaje:', viaje.id);

                            const result = await ViajeService.finalizarViaje(viaje.id, usuario.id);

                            if (result.success) {
                                console.log('✅ Viaje finalizado exitosamente');

                                // Limpiar AsyncStorage
                                await ViajeService.limpiarViajeActual();

                                Alert.alert(
                                    '🏁 Viaje Finalizado',
                                    '¡Has completado el viaje exitosamente!',
                                    [{ text: 'OK', onPress: () => navigation.replace('HomeConductor') }]
                                );
                            } else {
                                console.error('❌ Error al finalizar:', result.error);
                                Alert.alert('Error', result.error || 'No se pudo finalizar el viaje');
                            }
                        } catch (error) {
                            console.error('❌ Error:', error);
                            Alert.alert('Error', 'No se pudo finalizar el viaje');
                        } finally {
                            setFinalizandoViaje(false);
                        }
                    }
                }
            ]
        );
    };

    const handleAbrirChat = () => {
        navigation.navigate('Chat', { viaje });
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenerEstadoBadge = () => {
        switch (viaje?.estadoViaje) {
            case 'CREADO':
                return { color: '#FFA726', texto: '⏳ Pendiente de iniciar', icon: 'time' };
            case 'ENCURSO':
                return { color: '#66BB6A', texto: '🚗 En curso', icon: 'car-sport' };
            case 'FINALIZADO':
                return { color: '#42A5F5', texto: '🏁 Finalizado', icon: 'flag' };
            default:
                return { color: '#999', texto: viaje?.estadoViaje, icon: 'help-circle' };
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

    const estadoBadge = obtenerEstadoBadge();

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#207636']} />
            }
        >
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.botonAtras}
                    onPress={() => navigation.navigate('HomeConductor')}
                >
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Viaje Activo</Text>
            </View>

            <View style={[styles.estadoBadge, { backgroundColor: estadoBadge.color }]}>
                <Ionicons name={estadoBadge.icon} size={24} color="#fff" />
                <Text style={styles.estadoTexto}>{estadoBadge.texto}</Text>
            </View>

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

            <View style={styles.card}>
                <Text style={styles.cardTitle}>📋 Detalles</Text>

                <View style={styles.detalleRow}>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                    <Text style={styles.detalleTexto}>
                        {formatearFecha(viaje.horaSalida)}
                    </Text>
                </View>

                <View style={styles.detalleRow}>
                    <Ionicons name="people-outline" size={20} color="#666" />
                    <Text style={styles.detalleTexto}>
                        {viaje.pasajeros?.length || 0} / {viaje.cuposMaximos} pasajeros
                    </Text>
                </View>

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

            <View style={styles.botonesContainer}>
                {viaje.estadoViaje === 'CREADO' && (
                    <TouchableOpacity
                        style={[styles.botonAccion, styles.botonIniciar]}
                        onPress={handleIniciarManual}
                        disabled={iniciandoViaje}
                    >
                        {iniciandoViaje ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="play-circle" size={24} color="#fff" />
                                <Text style={styles.botonAccionTexto}>Iniciar Ahora</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {viaje.estadoViaje === 'ENCURSO' && (
                    <>
                        <TouchableOpacity
                            style={[styles.botonAccion, styles.botonChat]}
                            onPress={handleAbrirChat}
                        >
                            <Ionicons name="chatbubbles" size={24} color="#fff" />
                            <Text style={styles.botonAccionTexto}>Abrir Chat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.botonAccion, styles.botonFinalizar]}
                            onPress={handleFinalizarViaje}
                            disabled={finalizandoViaje}
                        >
                            {finalizandoViaje ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="flag" size={24} color="#fff" />
                                    <Text style={styles.botonAccionTexto}>Finalizar Viaje</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {(viaje.estadoViaje === 'CREADO' || viaje.estadoViaje === 'ENCURSO') && (
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
                )}
            </View>

            {viaje.estadoViaje === 'CREADO' && (
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={24} color="#2196F3" />
                    <Text style={styles.infoTexto}>
                        El viaje iniciará automáticamente 2 minutos después de la hora de salida ({' '}
                        {new Date(viaje.horaSalida).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                        {' '}) o cuando se llenen los cupos. También puedes iniciarlo manualmente.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    header: {
        backgroundColor: '#207636',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    botonAtras: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
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
        marginBottom: 2,
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
        flex: 1,
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
    botonIniciar: {
        backgroundColor: '#4CAF50',
    },
    botonChat: {
        backgroundColor: '#2196F3',
    },
    botonFinalizar: {
        backgroundColor: '#FF9800',
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