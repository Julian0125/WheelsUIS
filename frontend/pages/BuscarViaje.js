import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BuscarViaje({ navigation }) {
    const [origen, setOrigen] = useState(null);
    const [destino, setDestino] = useState(null);

    const rutas = [
        { id: 1, origen: "Cañaveral", destino: "UIS", hora: "7:00 AM", precio: "$4,000", icono: "bicycle-outline" },
        { id: 2, origen: "Cañaveral CC", destino: "UIS", hora: "8:20 AM", precio: "$2,500", icono: "car-sport-outline" },
        { id: 3, origen: "Florida", destino: "UIS", hora: "9:00 AM", precio: "$3,000", icono: "bus-outline" }
    ];

    return (
        <View style={styles.container}>

            {/* 🔥 FRANJA VERDE SUPERIOR */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.botonAtras}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Buscar Viaje</Text>

                {/* 👉 Este View vacío mantiene el título centrado */}
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>

                <Text style={styles.label}>Vas desde</Text>
                <TouchableOpacity style={styles.selector}>
                    <Text style={styles.selectorText}>{origen || "Selecciona origen"}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Hasta</Text>
                <TouchableOpacity style={styles.selector}>
                    <Text style={styles.selectorText}>{destino || "Selecciona destino"}</Text>
                </TouchableOpacity>

                <Text style={styles.titleLista}>HORARIOS DISPONIBLES</Text>

                {rutas.map((r) => (
                    <View key={r.id} style={styles.card}>
                        <View style={styles.row}>
                            <Ionicons name={r.icono} size={26} color="#207636" />
                            <View style={{ marginLeft: 15 }}>
                                <Text style={styles.hora}>{r.hora}</Text>
                                <Text style={styles.lugar}>{r.origen} → {r.destino}</Text>
                            </View>
                        </View>

                        <Text style={styles.precio}>{r.precio}</Text>
                    </View>
                ))}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    // 🔥 NUEVA FRANJA VERDE
    header: {
        backgroundColor: '#207636',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
    },
    botonAtras: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: "center",
    },

    label: {
        marginTop: 25,
        marginLeft: 20,
        fontSize: 14,
        color: "#444",
        fontWeight: "600",
    },

    selector: {
        marginHorizontal: 20,
        marginTop: 8,
        padding: 15,
        backgroundColor: "#f1f1f1",
        borderRadius: 12,
    },

    selectorText: {
        fontSize: 16,
        color: "#333",
    },

    titleLista: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 25,
        marginLeft: 20,
        color: "#062f13ff",
    },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 20,
        padding: 18,
        borderRadius: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
    },

    hora: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#222",
    },

    lugar: {
        fontSize: 13,
        color: "#777",
        marginTop: 3,
    },

    precio: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#207636",
    },
});
