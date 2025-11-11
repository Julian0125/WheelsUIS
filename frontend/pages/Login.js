import React, { useState } from 'react'
import { Text, StyleSheet, View, TextInput, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import UsuarioService from '../services/api'
import { useAuth } from '../context/AuthContext'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Login({ navigation }) {
    const { login } = useAuth()

    const [correo, setCorreo] = useState('')
    const [contraseña, setContraseña] = useState('')
    const [loading, setLoading] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [colorMensaje, setColorMensaje] = useState('red')

    const handleGoRegister = () => {
        navigation.navigate('RegistroUsuario')
    }

    const handleLogin = async () => {
        if (!correo || !contraseña) {
            setMensaje('Por favor ingresa correo y contraseña')
            setColorMensaje('red')
            return
        }

        setLoading(true)
        setMensaje('')
        try {
            const result = await UsuarioService.login(correo, contraseña)
            setLoading(false)

            if (result.success) {
                console.log('✅ Login exitoso:', result.data)
                await login(result.usuario)
                setColorMensaje('green')
                setMensaje('Inicio de sesión exitoso')
                setTimeout(() => {
                    setMensaje('')
                    navigation.navigate('Home')
                }, 1200)
            } else {
                if (result.error.includes("Contraseña incorrecta")) {
                    setColorMensaje('red')
                    setMensaje('La contraseña ingresada es incorrecta.')
                } else if (result.error.includes("correo no está registrado")) {
                    setColorMensaje('red')
                    setMensaje('El correo ingresado no existe.')
                } else if (result.error.includes("en revisión")) {
                    setColorMensaje('#ffcc00')
                    setMensaje('Tu cuenta está en revisión. Espera la aprobación del administrador.')
                } else if (result.error.includes("rechazado")) {
                    setColorMensaje('red')
                    setMensaje('Tu cuenta fue rechazada. No puedes iniciar sesión.')
                } else {
                    setColorMensaje('red')
                    setMensaje(result.error || 'Error al iniciar sesión.')
                }
            }
        } catch (error) {
            setLoading(false)
            setColorMensaje('red')
            setMensaje('No se pudo conectar con el servidor.')
            console.error(error)
        }
    }

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContainer}
            enableOnAndroid={true}
            extraScrollHeight={20}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.padre}>
                <View>
                    <Image source={require('../assets/wheelsuis.png')} style={styles.profile} />
                </View>

                <View style={styles.tarjeta}>
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

                    {mensaje !== '' && (
                        <View
                            style={[
                                styles.mensajeBox,
                                {
                                    backgroundColor: colorMensaje === '#ffcc00' ? '#fff8e1' : '#ffe6e6',
                                    borderColor: colorMensaje,
                                },
                            ]}
                        >
                            <Text style={[styles.mensajeTexto, { color: colorMensaje }]}>{mensaje}</Text>
                        </View>
                    )}

                    <View style={styles.registroContainer}>
                        <Text style={styles.textoRegistro}>¿No tienes una cuenta?</Text>
                        <TouchableOpacity onPress={handleGoRegister} activeOpacity={0.7}>
                            <Text style={styles.linkRegistro}> Regístrate aquí</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 40,
    },
    botonDeshabilitado: {
        opacity: 0.7,
    },
    padre: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    profile: {
        width: 150,
        height: 150,
        borderRadius: 70,
    },
    tarjeta: {
        margin: 29,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        width: 350,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    cajaTexto: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#cccccc40',
        borderRadius: 30,
        marginVertical: 6,
    },
    PadreBoton: {
        alignItems: 'center',
    },
    cajaBoton: {
        backgroundColor: '#207636ff',
        paddingVertical: 20,
        borderRadius: 30,
        width: 150,
        marginTop: 20,
    },
    TextBoton: {
        color: 'white',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderWidth: 0,
        height: 36,
        color: '#000',
    },
    registroContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        alignItems: 'center',
    },
    textoRegistro: {
        color: '#666',
        fontSize: 14,
    },
    linkRegistro: {
        color: '#207636ff',
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    mensajeBox: {
        marginTop: 15,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    mensajeTexto: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
})
