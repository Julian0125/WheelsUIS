import React, { useState } from 'react'
import { Text, StyleSheet, View, TextInput, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import UsuarioService from '../services/api'

export default function Login({navigation}){
    const [correo, setCorreo] = useState('')
    const [contraseña, setContraseña] = useState('')
    const [loading, setLoading] = useState(false)

    const handleGoRegister = () => {
        console.log('Pressed: go to RegistroUsuario')
        navigation.navigate('RegistroUsuario')
    }

    const handleLogin = async () => {
        if (!correo || !contraseña) {
            Alert.alert('Error', 'Por favor ingresa correo y contraseña')
            return
        }
        
        setLoading(true)
        try {
            const result = await UsuarioService.login(correo, contraseña)
            setLoading(false)
            
            if (result.success) {
                console.log('Login exitoso:', result.data)
                navigation.navigate('Home')
            } else {
                Alert.alert('Error', result.error || 'Error al iniciar sesión')
            }
        } catch (error) {
            setLoading(false)
            Alert.alert('Error', 'Error al conectar con el servidor')
            console.error(error)
        }
    };

        return (
        <View style={styles.padre}>
            <View>
                <Image source={require('../assets/wheelsuis.png')} style={styles.profile} />
            </View>
            <View style ={styles.tarjeta}>
                <View style={styles.cajaTexto}>
                    <TextInput 
                        placeholder="correo@uis.edu.co" 
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
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.PadreBoton}>
                    <TouchableOpacity 
                        style={[styles.cajaBoton, loading && styles.botonDeshabilitado]} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.TextBoton}>Iniciar Sesión</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.registroContainer}>
                    <Text style={styles.textoRegistro}>¿No tienes una cuenta?</Text>
                    <TouchableOpacity onPress={handleGoRegister} activeOpacity={0.7}>
                        <Text style={styles.linkRegistro}> Regístrate aquí</Text>
                    </TouchableOpacity>
                </View>

            </View >
        </View>
    )

   }

const styles = StyleSheet.create({
    botonDeshabilitado: {
        opacity: 0.7,
    },
    padre:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
    },
    profile:{
        width:150,
        height:150,
        borderRadius:70,
        borderColor:'white'
    },
    tarjeta:{
        margin:29,
        backgroundColor:'#f0f0f0',
        borderRadius:20,
        width:350,
        padding:16,
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
        paddingVertical:8,
        paddingHorizontal:16,
        backgroundColor:'#cccccc40',
        borderRadius:30,
        marginVertical:6,
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
        paddingVertical: 6,
        borderWidth: 0,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        height: 36,
        color: '#000'
    },
    registroContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        alignItems: 'center'
    },
    textoRegistro: {
        color: '#666',
        fontSize: 14
    },
    linkRegistro: {
        color: '#207636ff',
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline'
    }                                    
})