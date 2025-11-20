import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ViajeService from '../services/ViajeService';

export default function HomePasajero({ navigation }) {
    const { usuario } = useAuth();
    const nombre = usuario?.nombre || 'Usuario';

    useEffect(() => {
        verificarViajeActivo();
    }, []);

    const verificarViajeActivo = async () => {
        const viaje = await ViajeService.obtenerViajeDesdeStorage();
        if (viaje && viaje.estadoViaje !== "FINALIZADO" && viaje.estadoViaje !== "CANCELADO") {
            navigation.replace("ViajeActivoPasajero", { viaje });
        }
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

            <Text style={styles.title}>¿Preparado para tu próximo viaje?</Text>
            <Text style={styles.subtitle}>Encuentra viajes disponibles cerca de ti</Text>

            <View style={styles.buttonsContainer}>
                <View style={styles.buttonSection}>
                    <Text style={styles.helperText}>Si buscas ir con otras personas</Text>

                    <TouchableOpacity
                        style={[styles.optionButton, styles.buscarButton]}
                        onPress={() => navigation.navigate("BuscarViaje")}
                    >
                        <Text style={styles.optionText}>BUSCAR</Text>
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
    container:{ flex:1, backgroundColor:'#FFF', padding:20, alignItems:'center' },
    carBackground:{ position:'absolute', bottom:0, width:'150%', height:320, opacity:0.9 },
    header:{ width:'100%', marginTop:50, flexDirection:'row', justifyContent:'space-between' },
    statusBadge:{ backgroundColor:'#E8E8E8', borderRadius:15, paddingHorizontal:10, paddingVertical:5 },
    statusText:{ fontSize:20, fontWeight:'bold', color:'#555' },
    title:{ fontSize:22, fontWeight:'bold', marginTop:60, textAlign:'center', color:'#062f13ff' },
    subtitle:{ fontSize:14, color:'#555', textAlign:'center', marginTop:6 },
    buttonsContainer:{ marginTop:130, width:'100%' },
    buttonSection:{ width:'100%', alignItems:'center' },
    helperText:{ fontSize:12, color:'#777', marginBottom:10 },
    optionButton:{
        width:'70%',
        height:140,
        borderRadius:20,
        justifyContent:'center',
        alignItems:'center',
        elevation:4,
        backgroundColor:'#2e5b32ff'
    },
    buscarButton:{ backgroundColor:'#2e5b32ff' },
    optionText:{ color:'#FFF', fontSize:18, fontWeight:'bold' },
    helpButton:{ backgroundColor:'#2e5b32ff', borderRadius:30, paddingVertical:10, paddingHorizontal:30, position:'absolute', bottom:40 },
    helpText:{ color:'#FFF', fontWeight:'bold' },
});
