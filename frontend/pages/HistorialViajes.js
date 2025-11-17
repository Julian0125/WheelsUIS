import React, { useState, useEffect, useCallback } from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; 
import ViajeService from '../services/ViajeService';

export default function HistorialViajes({ navigation }) {
    
    const { usuario } = useAuth();
    
    const [viajes, setViajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filtro, setFiltro] = useState('TODOS');
    
    const esPasajero = usuario?.tipo === 'PASAJERO';
    const idUsuario = usuario?.id;

    useEffect(() => {
        if (idUsuario) {
            cargarHistorial();
        }
    }, [filtro, idUsuario]);

    const cargarHistorial = async () => {
        try {
            setLoading(true);
            
            
            const resultado = esPasajero 
                ? await ViajeService.obtenerHistorialPasajero(idUsuario)
                : await ViajeService.obtenerHistorialConductor(idUsuario);

            if (resultado.success) {
                
                let viajesFiltrados = resultado.data;
                if (filtro !== 'TODOS') {
                    viajesFiltrados = resultado.data.filter(v => v.estadoViaje === filtro);
                }
                setViajes(viajesFiltrados);
            } else {
                Alert.alert('Error', resultado.error);
                setViajes([]);
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'No se pudo cargar el historial');
            setViajes([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await cargarHistorial();
        setRefreshing(false);
    }, [filtro, idUsuario]);


    const formatearFecha = (fechaISO) => {
        return ViajeService.formatearFecha(fechaISO);
    };

    const verDetalleViaje = (viaje) => {
        navigation.navigate('DetalleViaje', { viaje, usuario });
    };

    const renderViaje = ({ item }) => (
        <TouchableOpacity 
            style={styles.viajeCard}
            onPress={() => verDetalleViaje(item)}
        >
            <View style={styles.viajeHeader}>
                <View style={styles.rutaContainer}>
                    <Ionicons name="location" size={20} color="#207636ff" />
                    <Text style={styles.lugar} numberOfLines={1}>
                        {item.origen || 'Origen no especificado'}
                    </Text>
                </View>
                <Ionicons name="arrow-down" size={16} color="#666" />
                <View style={styles.rutaContainer}>
                    <Ionicons name="location" size={20} color="#E63946" />
                    <Text style={styles.lugar} numberOfLines={1}>
                        {item.destino || 'Destino no especificado'}
                    </Text>
                </View>
            </View>

            <View style={styles.viajeDivider} />

            <View style={styles.viajeInfo}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.infoTexto}>{formatearFecha(item.horaSalida)}</Text>
                </View>

                {esPasajero && item.conductor && (
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color="#666" />
                        <Text style={styles.infoTexto}>
                            {item.conductor.nombre || 'Conductor'}
                        </Text>
                    </View>
                )}

                {!esPasajero && item.pasajeros && item.pasajeros.length > 0 && (
                    <View style={styles.infoRow}>
                        <Ionicons name="people-outline" size={16} color="#666" />
                        <Text style={styles.infoTexto}>
                            {item.pasajeros.length} pasajero{item.pasajeros.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                )}

                <View style={styles.infoRow}>
                    <Ionicons name="car-outline" size={16} color="#666" />
                    <Text style={styles.infoTexto}>
                        {item.cuposMaximos} cupo{item.cuposMaximos !== 1 ? 's' : ''} máximo{item.cuposMaximos !== 1 ? 's' : ''}
                    </Text>
                </View>
            </View>

            <View style={styles.viajeFooter}>
                <View style={[
                    styles.estadoBadge,
                    item.estadoViaje === 'COMPLETADO' ? styles.estadoCompletado :
                    item.estadoViaje === 'EN_CURSO' ? styles.estadoEnCurso :
                    item.estadoViaje === 'CANCELADO' ? styles.estadoCancelado :
                    styles.estadoPendiente
                ]}>
                    <Text style={styles.estadoTexto}>
                        {ViajeService.obtenerEstadoTexto(item.estadoViaje)}
                    </Text>
                </View>
                
                {item.comentarios && item.comentarios.length > 0 && (
                    <View style={styles.comentariosIndicador}>
                        <Ionicons name="chatbubble-outline" size={16} color="#666" />
                        <Text style={styles.comentariosTexto}>{item.comentarios.length}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderFiltros = () => (
        <View style={styles.filtrosContainer}>
            {['TODOS', 'COMPLETADO', 'EN_CURSO', 'CANCELADO'].map((estado) => (
                <TouchableOpacity
                    key={estado}
                    style={[
                        styles.filtroButton,
                        filtro === estado && styles.filtroActivo
                    ]}
                    onPress={() => setFiltro(estado)}
                >
                    <Text style={[
                        styles.filtroTexto,
                        filtro === estado && styles.filtroTextoActivo
                    ]}>
                        {estado === 'TODOS' ? 'TODOS' : 
                         estado === 'EN_CURSO' ? 'EN CURSO' :
                         ViajeService.obtenerEstadoTexto(estado).toUpperCase()}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderVacio = () => (
        <View style={styles.vacio}>
            <Ionicons name="car-outline" size={80} color="#ccc" />
            <Text style={styles.vacioTexto}>No hay viajes en el historial</Text>
            <Text style={styles.vacioSubtexto}>
                {esPasajero 
                    ? 'Los viajes que realices aparecerán aquí'
                    : 'Los viajes que crees aparecerán aquí'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#207636ff" />
                <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>
                    Historial de Viajes
                </Text>
                <Text style={styles.subtitulo}>
                    {esPasajero ? 'Pasajero' : 'Conductor'} • {viajes.length} {viajes.length === 1 ? 'viaje' : 'viajes'}
                </Text>
            </View>

            {renderFiltros()}

            <FlatList
                data={viajes}
                renderItem={renderViaje}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.lista}
                ListEmptyComponent={renderVacio}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#207636ff']}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
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
        color: '#666',
        fontSize: 16,
    },
    header: {
        backgroundColor: '#207636ff',
        padding: 20,
        paddingTop: 40,
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    subtitulo: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 5,
    },
    filtrosContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 10,
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexWrap: 'wrap',
    },
    filtroButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginVertical: 4,
    },
    filtroActivo: {
        backgroundColor: '#207636ff',
    },
    filtroTexto: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    filtroTextoActivo: {
        color: 'white',
        fontWeight: 'bold',
    },
    lista: {
        padding: 16,
    },
    viajeCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    viajeHeader: {
        marginBottom: 12,
    },
    rutaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    lugar: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        color: '#333',
        flex: 1,
    },
    viajeDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    viajeInfo: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    infoTexto: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    viajeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    estadoBadge: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    estadoCompletado: {
        backgroundColor: '#D4EDDA',
    },
    estadoCancelado: {
        backgroundColor: '#F8D7DA',
    },
    estadoEnCurso: {
        backgroundColor: '#D1ECF1',
    },
    estadoPendiente: {
        backgroundColor: '#FFF3CD',
    },
    estadoTexto: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    comentariosIndicador: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    comentariosTexto: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    vacio: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    vacioTexto: {
        fontSize: 18,
        color: '#999',
        marginTop: 16,
        fontWeight: '600',
    },
    vacioSubtexto: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 8,
        textAlign: 'center',
    },
});