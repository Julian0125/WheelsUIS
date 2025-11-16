import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ViajeService from '../services/ViajeService';
import ViajePollingService from '../services/ViajePollingService';

export default function HomeConductor({ navigation }) {
    const { usuario } = useAuth();
    const [viajeActual, setViajeActual] = useState(null);
    const [cargando, setCargando] = useState(true);
    const nombre = usuario?.nombre || 'Usuario';

    useEffect(() => {
        cargarViajeActual();
    }, []);

    const cargarViajeActual = async () => {
        try {
            setCargando(true);
            const result = await ViajeService.obtenerViajeActualConductor(usuario.id);

            if (result.success) {
                setViajeActual(result.data);

                // Si el viaje está creado, iniciar monitoreo
                if (result.data.estadoViaje === 'CREADO') {
                    ViajePollingService.iniciarMonitoreo(result.data.id, (iniciado) => {
                        if (iniciado) {
                            Alert.alert('¡Viaje iniciado!', 'Tu viaje ha comenzado automáticamente.');
                            cargarViajeActual(); // Recargar para actualizar el estado
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error al cargar viaje actual:', error);
        } finally {
            setCargando(false);
        }
    };

    const iniciarViajeManualmente = async () => {
        if (!viajeActual) return;

        Alert.alert(
            'Iniciar Viaje',
            '¿Estás seguro que deseas iniciar el viaje ahora?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Iniciar',
                    onPress: async () => {
                        const result = await ViajeService.iniciarViaje(viajeActual.id);
                        if (result.success) {
                            Alert.alert('Éxito', 'El viaje ha iniciado correctamente');
                            cargarViajeActual();
                        } else {
                            Alert.alert('Error', result.error);
                        }
                    }
                }
            ]
        );
    };

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

            {/* Mostrar viaje actual si existe */}
            {viajeActual && (
                <View style={styles.viajeActualCard}>
                    <Text style={styles.viajeActualTitulo}>Viaje Actual</Text>
                    <Text style={styles.viajeActualRuta}>
                        {viajeActual.origen} → {viajeActual.destino}
                    </Text>
                    <Text style={styles.viajeActualEstado}>
                        Estado: {ViajeService.obtenerEstadoTexto(viajeActual.estadoViaje)}
                    </Text>

                    {viajeActual.estadoViaje === 'CREADO' && (
                        <TouchableOpacity
                            style={styles.botonIniciarManual}
                            onPress={iniciarViajeManualmente}
                        >
                            <Text style={styles.botonIniciarManualText}>Iniciar Ahora</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View style={styles.buttonsContainer}>
                <View style={styles.buttonSection}>
                    <Text style={styles.helperText}>Si quieres facilitar ir a algún lugar</Text>
                    <TouchableOpacity
                        style={[styles.optionButton, styles.crearButton]}
                        onPress={() => navigation.navigate('CrearViaje')}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20,
        alignItems: 'center',
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
    viajeActualCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 15,
        padding: 15,
        marginTop: 20,
        width: '90%',
        borderWidth: 2,
        borderColor: '#207636',
    },
    viajeActualTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#207636',
        marginBottom: 8,
    },
    viajeActualRuta: {
        fontSize: 15,
        color: '#333',
        marginBottom: 5,
    },
    viajeActualEstado: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    botonIniciarManual: {
        backgroundColor: '#207636',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
    },
    botonIniciarManualText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
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