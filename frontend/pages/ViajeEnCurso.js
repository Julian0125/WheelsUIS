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
import { useFocusEffect } from '@react-navigation/native';
import AlertService from "../utils/AlertService";

export default function ViajeEnCurso({ navigation, route }) {
    const { usuario } = useAuth();
    const [viaje, setViaje] = useState(route.params?.viaje || null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [finalizandoViaje, setFinalizandoViaje] = useState(false);

    // Modal comentario
    const [modalCalificacionVisible, setModalCalificacionVisible] = useState(false);
    const [comentario, setComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);

    const convertirFechaLocal = (fecha) => {
        if (!fecha) return null;
        try {
            if (fecha instanceof Date) return fecha;
            return new Date(fecha);
        } catch {
            return null;
        }
    };

    // Actualización automática cada 5s
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
        if (viaje && viaje.horaSalida) {
            viaje.horaSalida = convertirFechaLocal(viaje.horaSalida);
        }
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

                // FINALIZADO → mostramos modal comentario
                if (data.estadoViaje === 'FINALIZADO') {
                    setViaje(data);
                    setModalCalificacionVisible(true);
                    return;
                }

                // CANCELADO → limpiar y volver al home
                if (data.estadoViaje === 'CANCELADO') {
                    await ViajeService.limpiarViajeActual();
                    navigation.replace('HomeConductor');
                    return;
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

    const handleFinalizarViaje = () => {
        AlertService.confirm(
            'Finalizar Viaje',
            '¿Has llegado al destino?',
            async () => {
                try {
                    setFinalizandoViaje(true);
                    const result = await ViajeService.finalizarViaje(viaje.id, usuario.id);

                    if (result && result.success) {
                        setViaje(result.data);
                        setModalCalificacionVisible(true);
                    } else {
                        AlertService.alert('Error', result?.error || 'No se pudo finalizar el viaje');
                    }
                } catch (err) {
                    console.error('Error finalizar:', err);
                    AlertService.alert('Error', 'No se pudo finalizar el viaje');
                } finally {
                    setFinalizandoViaje(false);
                }
            }
        );
    };

    const handleAbrirChat = () => {
        navigation.navigate('Chat', { viaje });
    };

    const handleEnviarComentario = async () => {
        if (!comentario.trim()) {
            AlertService.alert('Aviso', 'Escribe un comentario antes de enviar.');
            return;
        }

        try {
            setEnviandoComentario(true);

            const result = await ViajeService.enviarComentario(
                viaje.id,
                usuario.id,
                comentario
            );

            if (result.success) {
                AlertService.alert(
                    'Gracias',
                    'Tu comentario ha sido enviado 😊',
                    [{
                        text: 'OK',
                        onPress: async () => {
                            await ViajeService.limpiarViajeActual();
                            setModalCalificacionVisible(false);
                            navigation.replace('HomeConductor');
                        }
                    }]
                );
            } else {
                AlertService.alert('Error', result.error || 'No se pudo enviar el comentario');
            }
        } catch (err) {
            console.error('Error handleEnviarComentario:', err);
            AlertService.alert('Error', 'No se pudo enviar el comentario');
        } finally {
            setEnviandoComentario(false);
        }
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
                <Text style={styles.emptyText}>No hay viaje en curso</Text>
                <TouchableOpacity
                    style={styles.botonVolver}
                    onPress={() => navigation.replace('HomeConductor')}
                >
                    <Text style={styles.botonVolverText}>Volver al inicio</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#207636']} />
                }
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.headerTitleCentered}>Viaje en Curso</Text>
                </View>

                {/* ESTADO */}
                <View style={[styles.estadoBadge, { backgroundColor: '#66BB6A' }]}>
                    <Ionicons name="car-sport" size={24} color="#fff" />
                    <Text style={styles.estadoTexto}>🚗 En curso</Text>
                </View>

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

                    {viaje.pasajeros && viaje.pasajeros.length > 0 && (
                        <View style={styles.pasajerosList}>
                            <Text style={styles.pasajerosTitle}>Pasajeros en el viaje:</Text>
                            {viaje.pasajeros.map((pasajero, index) => (
                                <View key={index} style={styles.pasajeroItem}>
                                    <Ionicons name="person-circle-outline" size={24} color="#207636" />
                                    <View style={styles.pasajeroInfo}>
                                        <Text style={styles.pasajeroNombre}>{pasajero.nombre}</Text>
                                        {pasajero.celular && (
                                            <Text style={styles.pasajeroCelular}>📱 {pasajero.celular}</Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* BOTONES DE ACCIÓN */}
                <View style={styles.botonesContainer}>
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
                </View>

                {/* INFO */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={24} color="#2196F3" />
                    <Text style={styles.infoTexto}>
                        💬 Usa el chat para coordinar con tus pasajeros{'\n'}
                        🏁 Finaliza el viaje cuando llegues al destino
                    </Text>
                </View>
            </ScrollView>

            {/* MODAL COMENTARIO */}
            {modalCalificacionVisible && (
                <Modal
                    transparent
                    animationType="slide"
                    visible={modalCalificacionVisible}
                    onRequestClose={() => {}}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>🎉 ¡Viaje Finalizado!</Text>
                            <Text style={styles.modalSubtitle}>
                                Deja un comentario sobre tu experiencia
                            </Text>

                            <TextInput
                                style={styles.textArea}
                                placeholder="Escribe tu comentario..."
                                multiline
                                value={comentario}
                                onChangeText={setComentario}
                            />

                            <TouchableOpacity
                                style={styles.btnEnviarComentario}
                                onPress={handleEnviarComentario}
                                disabled={enviandoComentario}
                            >
                                {enviandoComentario ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.btnEnviarTexto}>Enviar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </>
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
        paddingVertical: 10,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    pasajeroInfo: {
        marginLeft: 10,
        flex: 1,
    },
    pasajeroNombre: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    pasajeroCelular: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
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
    botonChat: {
        backgroundColor: '#2196F3',
    },
    botonFinalizar: {
        backgroundColor: '#FF9800',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    textArea: {
        height: 120,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    btnEnviarComentario: {
        backgroundColor: '#207636',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnEnviarTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});