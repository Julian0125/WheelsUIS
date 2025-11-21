import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ViajeService from '../services/ViajeService';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeConductor({ navigation }) {
    const { usuario } = useAuth();
    const [viajeActual, setViajeActual] = useState(null);
    const [cargandoInicial, setCargandoInicial] = useState(true); // 🔥 Mejor carga
    const nombre = usuario?.nombre || 'Usuario';

    // ================================================================
    // 🚀 Cargar instantáneamente desde AsyncStorage (no bloquea)
    // ================================================================
    const cargarDesdeCache = async () => {
        const local = await ViajeService.obtenerViajeDesdeStorage();
        if (local && (local.estadoViaje === "CREADO" || local.estadoViaje === "ENCURSO")) {
            setViajeActual(local);
            navigation.replace("ViajeActivo", { viaje: local });
        }
        setCargandoInicial(false);
    };

    // ================================================================
    // 🚀 Verificación real desde backend en segundo plano
    // ================================================================
    const verificarBackend = async () => {
        const result = await ViajeService.obtenerViajeActualConductor(usuario.id);

        if (result.success) {
            setViajeActual(result.data);

            if (result.data.estadoViaje === "CREADO") {
                navigation.replace("ViajeActivo", { viaje: result.data });
            } else if (result.data.estadoViaje === "ENCURSO") {
                navigation.replace("ViajeEnCurso", { viaje: result.data });
            }
        } else {
            setViajeActual(null);
        }
    };

    // ================================================================
    // 🔁 Ejecutar cada vez que la pantalla entra en foco
    // ================================================================
    useFocusEffect(
        React.useCallback(() => {
            cargarDesdeCache();                    // ⚡ instantáneo
            setTimeout(verificarBackend, 400);     // 🔍 backend sin bloquear UI
        }, [])
    );

    // ================================================================
    // 🌀 Loading SOLO para la carga inicial
    // ================================================================
    if (cargandoInicial) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#207636" />
                <Text style={styles.loadingText}>Verificando viajes activos...</Text>
            </View>
        );
    }

    // =================================================================
    // 🎨 INTERFAZ NORMAL (NO CAMBIADA)
    // =================================================================
    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/carro.png')}
                style={styles.carBackground}
                resizeMode="contain"
            />

            <View style={styles.header}>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Hola, {nombre} 👋</Text>
                </View>
            </View>

            <Text style={styles.title}>¿Listo para publicar un nuevo viaje?</Text>
            <Text style={styles.subtitle}>Comparte ruta, comparte comodidad.</Text>

            {/* ⚠️ Advertencia si hay viaje activo */}
            {viajeActual && (viajeActual.estadoViaje === 'CREADO' || viajeActual.estadoViaje === 'ENCURSO') && (
                <View style={styles.viajeActivoWarning}>
                    <Text style={styles.warningIcon}>⚠️</Text>
                    <View style={styles.warningContent}>
                        <Text style={styles.warningTitle}>Viaje Activo Detectado</Text>
                        <Text style={styles.warningText}>
                            Tienes un viaje {viajeActual.estadoViaje === 'CREADO' ? 'pendiente' : 'en curso'}
                        </Text>
                        <TouchableOpacity
                            style={styles.verViajeButton}
                            onPress={() => navigation.navigate('ViajeActivo', { viaje: viajeActual })}
                        >
                            <Text style={styles.verViajeButtonText}>Ver Viaje</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.buttonsContainer}>
                <View style={styles.buttonSection}>
                    <Text style={styles.helperText}>Si quieres facilitar ir a algún lugar</Text>
                    <TouchableOpacity
                        style={[styles.optionButton, styles.crearButton]}
                        onPress={() => {
                            if (viajeActual && (viajeActual.estadoViaje === "CREADO" || viajeActual.estadoViaje === "ENCURSO")) {
                                Alert.alert(
                                    "Viaje Activo",
                                    "Ya tienes un viaje activo. Debes finalizarlo antes de crear uno nuevo.",
                                    [
                                        { text: "Cancelar", style: "cancel" },
                                        {
                                            text: "Ver Viaje Activo",
                                            onPress: () => navigation.navigate("ViajeActivo", { viaje: viajeActual })
                                        }
                                    ]
                                );
                                return;
                            }
                            navigation.navigate("CrearViaje");
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.optionText}>CREAR</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpText}>Ayuda</Text>
            </TouchableOpacity>
        </View>
    );
}

// 🔽 Tus estilos no los toqué
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20,
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    carBackground: {
        position: 'absolute',
        bottom: 0,
        width: '150%',
        height: 320,
        opacity: 0.9,
    },
    header: {
        width: '100%',
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: '#E8E8E8',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    statusText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#555',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 60,
        textAlign: 'center',
        color: '#062f13ff',
    },
    subtitle: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginTop: 6,
    },
    viajeActivoWarning: {
        flexDirection: 'row',
        backgroundColor: '#FFF3CD',
        borderRadius: 12,
        padding: 15,
        marginTop: 20,
        marginHorizontal: 10,
        borderWidth: 2,
        borderColor: '#FFA726',
        alignItems: 'center',
    },
    warningIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F57C00',
        marginBottom: 4,
    },
    warningText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    verViajeButton: {
        backgroundColor: '#F57C00',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    verViajeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    buttonsContainer: {
        flexDirection: 'row',
        marginTop: 100,
        justifyContent: 'center',
        width: '100%',
    },
    buttonSection: {
        width: '48%',
        alignItems: 'center',
    },
    helperText: {
        fontSize: 12,
        color: '#777',
        textAlign: 'center',
        marginBottom: 14,
    },
    optionButton: {
        width: '100%',
        height: 140,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    crearButton: {
        backgroundColor: '#207636',
        marginBottom: 19,
    },
    optionText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    helpButton: {
        backgroundColor: '#207636',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 30,
        position: 'absolute',
        bottom: 40,
    },
    helpText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
