import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

export default function CrearViaje({ navigation }) {
    const [origen, setOrigen] = useState('');
    const [destino, setDestino] = useState('');
    const [horaSalida, setHoraSalida] = useState('');
    const [cupos, setCupos] = useState('');
    const [precio, setPrecio] = useState('');

    const publicarViaje = () => {
        if (!origen || !destino || !horaSalida || !cupos || !precio) {
            Alert.alert('Campos incompletos', 'Por favor, complete todos los campos antes de publicar el viaje.');
            return;
        }

        // Aquí luego se conectará al backend
        Alert.alert('✅ Viaje publicado', 'Su viaje ha sido publicado exitosamente.');
        navigation.goBack(); // vuelve al Home
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Crear un nuevo viaje</Text>
            <Text style={styles.subtitle}>Complete los siguientes datos</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Origen</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: UIS, Bucaramanga"
                    value={origen}
                    onChangeText={setOrigen}
                />

                <Text style={styles.label}>Destino</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: Cañaveral, Floridablanca"
                    value={destino}
                    onChangeText={setDestino}
                />

                <Text style={styles.label}>Hora de salida</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 7:30 AM"
                    value={horaSalida}
                    onChangeText={setHoraSalida}
                />

                <Text style={styles.label}>Cupos disponibles</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 3"
                    keyboardType="numeric"
                    value={cupos}
                    onChangeText={setCupos}
                />

                <Text style={styles.label}>Precio (COP)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 5000"
                    keyboardType="numeric"
                    value={precio}
                    onChangeText={setPrecio}
                />

                <TouchableOpacity style={styles.publishButton} onPress={publicarViaje}>
                    <Text style={styles.publishText}>PUBLICAR VIAJE</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        padding: 20,
        flexGrow: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 30,
    },
    subtitle: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    form: {
        marginTop: 10,
    },
    label: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
    },
    publishButton: {
        backgroundColor: '#7DE2D1',
        paddingVertical: 15,
        borderRadius: 15,
        marginTop: 30,
        alignItems: 'center',
    },
    publishText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
