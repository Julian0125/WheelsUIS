import React, { useState } from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Alert, ActivityIndicator , Platform} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { ScrollView } from 'react-native';
import UsuarioService from '../services/api';

export default function RegistroUsuario({ navigation }){
    const [nombre, setNombre] = useState('');
    const [codigo, setCodigo] = useState('');
    const [celular, setCelular] = useState('');
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState("");
    const [loading, setLoading] = useState(false);

    const validarCorreo = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@correo\.uis\.edu\.co$/;
        return regex.test(email);
    };

    const handleRegistro = async () => {
        // Validaciones
        if (!nombre || !codigo || !celular || !correo || !contraseña || !tipoUsuario) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        if (!validarCorreo(correo)) {
            Alert.alert('Error', 'El correo debe ser un correo UIS válido (@correo.uis.edu.co)');
            return;
        }

        if (contraseña.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const usuario = {
                nombre,
                codigo,
                celular,
                correo,
                contraseña,
                tipoUsuario
            };

            const result = await UsuarioService.registrar(usuario);
            setLoading(false);

            if (result.success) {
                if (Platform.OS === 'web') {
            
            window.alert('Usuario registrado correctamente. Por favor verifica tu correo para activar tu cuenta.');
            navigation.replace('Login');
            } else {
            Alert.alert(
                'Éxito',
                'Usuario registrado correctamente. Por favor verifica tu correo para activar tu cuenta.',
                [{ text: 'OK', onPress: () => navigation.replace('Login') }]
            );
            }
        } else {
            Alert.alert('Error', result.error || 'Error al registrar usuario');
        }
        } catch (error) {
        Alert.alert('Error', 'Error al conectar con el servidor');
        console.error(error);
        } finally {
        setLoading(false);
        }
    };

    return(
        <ScrollView contentContainerStyle={styles.padre}>
            <View style ={styles.tarjeta}>
                <View style={styles.cajaTexto}>
                    <TextInput placeholder="Nombre" style={styles.input} value={nombre} onChangeText={setNombre} 
                    />
                </View>
            
                <View style={styles.cajaTexto}>
                     <TextInput 
                        placeholder="Código" 
                        style={styles.input}
                        value={codigo}
                        onChangeText={setCodigo}
                        keyboardType="numeric"
                     />
                </View>

                <View style={styles.cajaTexto}>
                     <TextInput 
                        placeholder="Celular" 
                        style={styles.input}
                        value={celular}
                        onChangeText={setCelular}
                        keyboardType="numeric" 
                     />
                </View>

                <View style={styles.cajaTexto}>
                     <TextInput 
                        placeholder="@correo.uis.edu.co" 
                        style={styles.input}
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address" 
                        autoCapitalize="none" 
                     />
                </View>

                <View style={styles.cajaTexto}>
                     <TextInput 
                        placeholder="Contraseña" 
                        style={styles.input}
                        value={contraseña}
                        onChangeText={setContraseña}
                        secureTextEntry
                     />
                </View>

<View style={styles.cajaTexto}>
    <Text style={{ color: '#666', marginBottom: 10 }}>Tipo de usuario:</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <TouchableOpacity 
            style={[styles.tipoButton, tipoUsuario === 'CONDUCTOR' && styles.tipoButtonActive]}
            onPress={() => setTipoUsuario('CONDUCTOR')}
        >
            <Text style={styles.tipoButtonText}>Conductor</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={[styles.tipoButton, tipoUsuario === 'PASAJERO' && styles.tipoButtonActive]}
            onPress={() => setTipoUsuario('PASAJERO')}
        >
            <Text style={styles.tipoButtonText}>Pasajero</Text>
        </TouchableOpacity>
    </View>
</View>


                <View style={styles.PadreBoton}>
                    <TouchableOpacity 
                        style={[styles.cajaBoton, loading && styles.botonDeshabilitado]}
                        onPress={handleRegistro}
                        disabled={loading}
                    > 
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.TextBoton}>Registrar Usuario</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.loginContainer}>
                    <Text style={styles.textoLogin}>¿Ya tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkLogin}>Inicia sesión aquí</Text>
                    </TouchableOpacity>
                </View>
            </View >
        </ScrollView>
    )


}

const styles = StyleSheet.create({
    padre:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
    },
     titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#207636ff',
        textAlign: 'center',
        marginBottom: 20
    },
     tarjeta:{
        margin:29,
        backgroundColor:'#f0f0f0',
        borderRadius:20,
        width:350,
        padding:20,
        shadowColor:'#000',
        shadowOffset:{
            width:0,
            height:2
        },
        shadowOpacity:0.25,
        shadowRadius:4,
        elevation:5
    },
    cajaTexto:{
        paddingVertical:12,
        paddingHorizontal:16,
        backgroundColor:'#cccccc40',
        borderRadius:30,
        marginVertical:10,
        overflow:'hidden',
    } ,
    PadreBoton:{
        alignItems:'center',
    },
    cajaBoton:{
        backgroundColor:'#207636ff',
        paddingVertical:20,
        borderRadius:30,
        width:150,
        marginTop:20,
    },
    TextBoton:{
        color:'white',
        textAlign:'center',
    },
    input: {
        width: '100%',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        height: 40,
        color: '#000'
    },
     textoLogin: {
        color: '#666',
        fontSize: 14
    },
     loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        alignItems: 'center'
    },
    linkLogin: {
        color: '#207636ff',
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline'
    },
    tipoButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    minWidth: 120,
    alignItems: 'center'
    },
    tipoButtonActive: {
    backgroundColor: '#207636ff',
    },
    tipoButtonText: {
    color: '#000',
    fontWeight: '500'
    }               
})