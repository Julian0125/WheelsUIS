import React, { useState} from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { ScrollView } from 'react-native';


export default function RegistroUsuario({ navigation }){
    const [nombre, setNombre] = useState('');
    const [codigo, setCodigo] = useState('');
    const [celular, setCelular] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    // use null so native picker doesn't receive an empty-string value which can cause a type error
    const [tipoUsuario, setTipoUsuario] = useState("");

    const handleRegistro = () => {
        if (!nombre || !codigo || !celular || !correo || !password || !tipoUsuario === "") {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }
        // aca va la logica para registrar el usuario cuando se haga la conexion con el backend
        Alert.alert('Éxito', 'Usuario registrado correctamente', [
            {
                text: 'OK',
                onPress: () => navigation.navigate('Login')
            }
        ]);
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
                        value={password}
                        onChangeText={setPassword}
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
                        style={styles.cajaBoton}
                        onPress={handleRegistro}
                    > 
                        <Text style={styles.TextBoton}>Registrar Usuario</Text>
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