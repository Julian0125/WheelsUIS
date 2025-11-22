import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import ViajeService from "../services/ViajeService";
import AlertService from "../utils/AlertService";

export default function ViajeEnCursoPasajero({ navigation, route }) {
    const { usuario } = useAuth();
    const [viaje, setViaje] = useState(route.params?.viaje || null);
    const [loading, setLoading] = useState(false);

    // Modal comentario
    const [modalCalificacionVisible, setModalCalificacionVisible] = useState(false);
    const [comentario, setComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);

    // 🔥 Polling para detectar cuando finaliza
    useEffect(() => {
        const id = setInterval(() => cargar(), 4000);
        return () => clearInterval(id);
    }, []);

    const cargar = async () => {
        try {
            const vLocal = await ViajeService.obtenerViajeDesdeStorage();

            if (!vLocal) {
                console.log('⚠️ No hay viaje en storage');
                await ViajeService.limpiarViajeActual();
                navigation.replace("HomePasajero");
                return;
            }

            const result = await ViajeService.obtenerViajeActualPasajero(usuario.id);

            if (!result.success) {
                console.log('⚠️ Backend reporta que no hay viaje activo');
                await ViajeService.limpiarViajeActual();
                navigation.replace("HomePasajero");
                return;
            }

            const vBackend = result.data;

            // 🔥 DETECTAR FINALIZACIÓN
            if (vBackend.estadoViaje === "FINALIZADO") {
                setViaje(vBackend);
                await ViajeService.guardarViajeActual(vBackend);
                setModalCalificacionVisible(true);
                return;
            }

            // CANCELADO
            if (vBackend.estadoViaje === "CANCELADO") {
                await ViajeService.limpiarViajeActual();
                AlertService.alert(
                    "❌ Viaje Cancelado",
                    "El viaje ha sido cancelado.",
                    [{ text: "OK", onPress: () => navigation.replace("HomePasajero") }]
                );
                return;
            }

            // Actualizar
            setViaje(vBackend);
            await ViajeService.guardarViajeActual(vBackend);

        } catch (error) {
            console.error('Error al cargar viaje:', error);
        }
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
                            navigation.replace('HomePasajero');
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

    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'Fecha no disponible';
        try {
            const fecha = new Date(fechaISO);
            return fecha.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'America/Bogota'
            });
        } catch {
            return 'Error en fecha';
        }
    };

    const formatearHora = (fechaISO) => {
        if (!fechaISO) return 'Hora no disponible';
        try {
            const fecha = new Date(fechaISO);
            return fecha.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Bogota'
            });
        } catch {
            return 'Error en hora';
        }
    };

    if (!viaje) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1a502a" />
                <Text style={styles.loadingText}>Cargando viaje...</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Viaje en Curso</Text>
                </View>

                {/* ESTADO */}
                <View style={[styles.estadoBadge, { backgroundColor: '#66BB6A' }]}>
                    <Ionicons name="car-sport" size={24} color="#fff" />
                    <Text style={styles.estadoTexto}>🚗 En curso</Text>
                </View>

                {/* RUTA */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📍 Ruta</Text>
                    <View style={styles.rutaContainer}>
                        <View style={styles.ubicacion}>
                            <Ionicons name="location" size={24} color="#207636" />
                            <View style={styles.ubicacionInfo}>
                                <Text style={styles.ubicacionLabel}>Origen</Text>
                                <Text style={styles.ubicacionTexto}>{viaje.origen || 'N/A'}</Text>
                            </View>
                        </View>
                        <Ionicons name="arrow-down" size={20} color="#999" style={styles.arrow} />
                        <View style={styles.ubicacion}>
                            <Ionicons name="location" size={24} color="#E63946" />
                            <View style={styles.ubicacionInfo}>
                                <Text style={styles.ubicacionLabel}>Destino</Text>
                                <Text style={styles.ubicacionTexto}>{viaje.destino || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* DETALLES */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📋 Detalles del Viaje</Text>
                    <View style={styles.detalleRow}>
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={styles.detalleTexto}>{formatearFecha(viaje.horaSalida)}</Text>
                    </View>
                    <View style={styles.detalleRow}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={styles.detalleTexto}>{formatearHora(viaje.horaSalida)}</Text>
                    </View>
                    <View style={styles.detalleRow}>
                        <Ionicons name="people-outline" size={20} color="#666" />
                        <Text style={styles.detalleTexto}>
                            {viaje.pasajeros?.length || 0} / {viaje.cuposMaximos || 0} pasajeros
                        </Text>
                    </View>
                </View>

                {/* CONDUCTOR */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🚗 Conductor</Text>
                    <View style={styles.conductorInfo}>
                        <Ionicons name="person-circle-outline" size={48} color="#207636" />
                        <View style={styles.conductorDetalles}>
                            <Text style={styles.conductorNombre}>{viaje.conductor?.nombre || 'Conductor'}</Text>
                            {viaje.conductor?.celular && (
                                <Text style={styles.conductorCelular}>📱 {viaje.conductor.celular}</Text>
                            )}
                        </View>
                    </View>
                    {viaje.conductor?.vehiculo && (
                        <View style={styles.vehiculoInfo}>
                            <Ionicons name="car-outline" size={20} color="#666" />
                            <Text style={styles.vehiculoTexto}>
                                {viaje.conductor.vehiculo.marca} {viaje.conductor.vehiculo.modelo} • {viaje.conductor.vehiculo.placa}
                            </Text>
                        </View>
                    )}
                </View>

                {/* BOTÓN CHAT */}
                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={[styles.btn, styles.chat]}
                        onPress={() => navigation.navigate("Chat", { viaje })}
                    >
                        <Ionicons name="chatbubbles" size={22} color="#fff" />
                        <Text style={styles.btnText}>Abrir Chat</Text>
                    </TouchableOpacity>
                </View>

                {/* INFO */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#2196F3" />
                    <Text style={styles.infoTexto}>
                        Coordínate con el conductor a través del chat. El viaje finalizará cuando lleguen al destino.
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
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    header: { paddingTop: 50, paddingBottom: 20, backgroundColor: "#1a502a", alignItems: "center" },
    headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
    estadoBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, marginHorizontal: 20, marginTop: 20, borderRadius: 12 },
    estadoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    card: { backgroundColor: "#fff", margin: 20, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: '#333' },
    rutaContainer: { paddingVertical: 10 },
    ubicacion: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
    ubicacionInfo: { marginLeft: 12, flex: 1 },
    ubicacionLabel: { fontSize: 12, color: '#999' },
    ubicacionTexto: { fontSize: 16, fontWeight: '600', color: '#333' },
    arrow: { alignSelf: 'center', marginVertical: 5 },
    detalleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    detalleTexto: { fontSize: 15, color: '#555', marginLeft: 12, flex: 1 },
    conductorInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    conductorDetalles: { marginLeft: 12, flex: 1 },
    conductorNombre: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    conductorCelular: { fontSize: 14, color: '#666', marginTop: 4 },
    vehiculoInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 10, borderRadius: 8, marginTop: 8 },
    vehiculoTexto: { fontSize: 14, color: '#555', marginLeft: 10 },
    buttons: { padding: 20 },
    btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 15, borderRadius: 12, marginBottom: 15 },
    chat: { backgroundColor: "#2196F3" },
    btnText: { color: "#fff", marginLeft: 10, fontWeight: "bold", fontSize: 16 },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', marginHorizontal: 20, marginBottom: 20, padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#2196F3' },
    infoTexto: { flex: 1, marginLeft: 10, fontSize: 13, color: '#1976D2' },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#f5f5f5' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333', textAlign: 'center' },
    modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 15, textAlign: 'center' },
    textArea: { height: 120, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, padding: 10, textAlignVertical: 'top', marginBottom: 20 },
    btnEnviarComentario: { backgroundColor: '#1a502a', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    btnEnviarTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});