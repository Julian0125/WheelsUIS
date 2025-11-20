import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import ViajeService from "../services/ViajeService";
import AlertService from "../utils/AlertService";

export default function ViajeActivoPasajero({ navigation, route }) {
    const { usuario } = useAuth();
    const [viaje, setViaje] = useState(route.params?.viaje || null);

    useEffect(() => {
        const id = setInterval(() => cargar(), 4000);
        return () => clearInterval(id);
    }, []);

    const cargar = async () => {
        const v = await ViajeService.obtenerViajeDesdeStorage();
        if (!v) return;

        // si finalizó o canceló → volver al home
        if (v.estadoViaje === "FINALIZADO" || v.estadoViaje === "CANCELADO") {
            await ViajeService.limpiarViajeActual();
            navigation.replace("HomePasajero");
            return;
        }

        setViaje(v);
    };

    const cancelarViaje = () => {
        AlertService.confirm(
            "Cancelar viaje",
            "¿Seguro que deseas cancelar este viaje?",
            async () => {
                await ViajeService.cancelarViaje(viaje.id, usuario.id, "PASAJERO");
                await ViajeService.limpiarViajeActual();
                navigation.replace("HomePasajero");
            }
        );
    };

    if (!viaje) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Viaje en Curso</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>📍 Ruta</Text>
                <Text style={styles.row}>{viaje.origen} → {viaje.destino}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>🚗 Conductor</Text>
                <Text>{viaje.conductor?.nombre}</Text>
                <Text>{viaje.conductor?.celular}</Text>
            </View>

            <View style={styles.buttons}>
                <TouchableOpacity style={[styles.btn, styles.chat]} onPress={() => navigation.navigate("Chat", { viaje })}>
                    <Ionicons name="chatbubbles" size={22} color="#fff" />
                    <Text style={styles.btnText}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={cancelarViaje}>
                    <Ionicons name="close-circle" size={22} color="#fff" />
                    <Text style={styles.btnText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container:{ flex:1, backgroundColor:"#f5f5f5" },
    header:{ paddingTop:50, paddingBottom:20, backgroundColor:"#1a502a", alignItems:"center" },
    headerTitle:{ color:"#fff", fontSize:24, fontWeight:"bold" },
    card:{ backgroundColor:"#fff", margin:20, padding:16, borderRadius:12 },
    cardTitle:{ fontSize:18, fontWeight:"bold" },
    row:{ fontSize:16, marginTop:6 },
    buttons:{ padding:20 },
    btn:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"center",
        padding:15,
        borderRadius:12,
        marginBottom:15
    },
    chat:{ backgroundColor:"#2196F3" },
    cancel:{ backgroundColor:"#E53935" },
    btnText:{ color:"#fff", marginLeft:10, fontWeight:"bold" },
    loadingContainer:{ flex:1, justifyContent:"center", alignItems:"center" }
});
