import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import ViajeService from "../services/ViajeService";
import AlertService from "../utils/AlertService";


export default function ViajeActivoPasajero({ navigation, route }) {
    const { usuario } = useAuth();
    const [viaje, setViaje] = useState(route.params?.viaje || null);
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef(null);
    const isNavigatingRef = useRef(false); // Evitar múltiples navegaciones
    const intentosRef = useRef(0); // Contador de intentos fallidos
    const MAX_INTENTOS_BACKEND = 1000; // Número de intentos antes de confiar solo en storage

    // 🔥 Polling para detectar cambios de estado
    useEffect(() => {
        cargar(); // Cargar inmediatamente
        intervalRef.current = setInterval(() => cargar(), 4000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const cargar = async () => {
        // Si ya estamos navegando, no hacer nada
        if (isNavigatingRef.current) return;

        try {
            const vLocal = await ViajeService.obtenerViajeDesdeStorage();

            if (!vLocal) {
                console.log('⚠️ No hay viaje en storage');
                await ViajeService.limpiarViajeActual();
                if (intervalRef.current) clearInterval(intervalRef.current);
                isNavigatingRef.current = true;
                navigation.replace("HomePasajero");
                return;
            }

            // Si tenemos viaje local, primero mostrarlo mientras verificamos con backend
            if (!viaje) {
                setViaje(vLocal);
            }

            const result = await ViajeService.obtenerViajeActualPasajero(usuario.id);

            // Si es un error de red temporal, mantener viaje local
            if (!result.success && result.networkError) {
                console.log('⚠️ Error de red temporal, manteniendo viaje local');
                return;
            }

            // Si el backend confirma que no hay viaje activo
            if (!result.success && result.noActiveTrip) {
                intentosRef.current += 1;
                console.log(`⚠️ Backend dice que no hay viaje (intento ${intentosRef.current}/${MAX_INTENTOS_BACKEND})`);

                // Si aún no hemos superado los intentos máximos, confiar en el storage local
                if (intentosRef.current <= MAX_INTENTOS_BACKEND) {
                    console.log('✅ Confiando en storage local por ahora...');
                    return;
                }

                // Después de varios intentos, el backend realmente no tiene el viaje
                console.log('⚠️ Backend confirma definitivamente que no hay viaje activo');
                await ViajeService.limpiarViajeActual();
                if (intervalRef.current) clearInterval(intervalRef.current);
                isNavigatingRef.current = true;
                navigation.replace("HomePasajero");
                return;
            }

            // Si hay otro tipo de error, mantener viaje local
            if (!result.success) {
                console.log('⚠️ Error al consultar backend, manteniendo viaje local');
                return;
            }

            // ✅ El backend respondió correctamente - resetear contador
            intentosRef.current = 0;
            const vBackend = result.data;

            // 🔥 REDIRIGIR SI EL VIAJE INICIÓ
            if (vBackend.estadoViaje === "ENCURSO") {
                // Serializar el viaje antes de guardar y navegar
                const viajeSerializado = {
                    ...vBackend,
                    horaSalida: vBackend.horaSalida ? vBackend.horaSalida.toString() : null,
                    horaLlegada: vBackend.horaLlegada ? vBackend.horaLlegada.toString() : null,
                };

                await ViajeService.guardarViajeActual(viajeSerializado);

                // ✅ DETENER EL POLLING
                if (intervalRef.current) clearInterval(intervalRef.current);

                isNavigatingRef.current = true;

                AlertService.alert(
                    "🚗 Viaje Iniciado",
                    "El conductor ha iniciado el viaje. ¡Buen viaje!",
                    [{
                        text: "OK",
                        onPress: () => {
                            navigation.replace("ViajeEnCursoPasajero", {
                                viaje: viajeSerializado
                            });
                        }
                    }]
                );
                return;
            }

            // CANCELADO
            if (vBackend.estadoViaje === "CANCELADO") {
                await ViajeService.limpiarViajeActual();
                if (intervalRef.current) clearInterval(intervalRef.current);
                isNavigatingRef.current = true;

                AlertService.alert(
                    "❌ Viaje Cancelado",
                    "El viaje ha sido cancelado por el conductor.",
                    [{ text: "OK", onPress: () => navigation.replace("HomePasajero") }]
                );
                return;
            }

            // FINALIZADO (por si acaso)
            if (vBackend.estadoViaje === "FINALIZADO") {
                await ViajeService.limpiarViajeActual();
                if (intervalRef.current) clearInterval(intervalRef.current);
                isNavigatingRef.current = true;
                navigation.replace("HomePasajero");
                return;
            }

            // Actualizar viaje si sigue CREADO
            setViaje(vBackend);
            await ViajeService.guardarViajeActual(vBackend);

        } catch (error) {
            console.error('Error al cargar viaje:', error);
        }
    };

    const cancelarViaje = () => {
        AlertService.confirm(
            "Cancelar viaje",
            "¿Seguro que deseas cancelar este viaje?",
            async () => {
                try {
                    setLoading(true);
                    const result = await ViajeService.cancelarViaje(viaje.id, usuario.id, "PASAJERO");

                    if (result.success) {
                        await ViajeService.limpiarViajeActual();
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        isNavigatingRef.current = true;

                        AlertService.alert(
                            "Viaje Cancelado",
                            "Te has desvinculado del viaje correctamente.",
                            [{ text: "OK", onPress: () => navigation.replace("HomePasajero") }]
                        );
                    } else {
                        AlertService.alert("Error", result.error || "No se pudo cancelar el viaje");
                    }
                } catch (error) {
                    console.error("Error al cancelar viaje:", error);
                    AlertService.alert("Error", "No se pudo cancelar el viaje");
                } finally {
                    setLoading(false);
                }
            }
        );
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
        <ScrollView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Viaje Próximo</Text>
            </View>

            {/* ESTADO */}
            <View style={[styles.estadoBadge, { backgroundColor: '#FFA726' }]}>
                <Ionicons name="time" size={24} color="#fff" />
                <Text style={styles.estadoTexto}>⏳ Esperando inicio</Text>
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

            {/* BOTONES */}
            <View style={styles.buttons}>
                <TouchableOpacity
                    style={[styles.btn, styles.cancel]}
                    onPress={cancelarViaje}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="close-circle" size={22} color="#fff" />
                            <Text style={styles.btnText}>Cancelar Viaje</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* INFO */}
            <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#2196F3" />
                <Text style={styles.infoTexto}>
                    El conductor iniciará el viaje automáticamente cuando se cumplan las condiciones.
                </Text>
            </View>
        </ScrollView>
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
    cancel: { backgroundColor: "#E53935" },
    btnText: { color: "#fff", marginLeft: 10, fontWeight: "bold", fontSize: 16 },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', marginHorizontal: 20, marginBottom: 20, padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#2196F3' },
    infoTexto: { flex: 1, marginLeft: 10, fontSize: 13, color: '#1976D2' },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#f5f5f5' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' }
});