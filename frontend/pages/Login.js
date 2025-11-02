import React, { useState} from 'react'
import { Text, StyleSheet, View, TextInput, Image, TouchableOpacity } from 'react-native'

export default function Login(){
  
    return (
        <View style={styles.padre}>
            <View>
                <Image source={require('../assets/wheelsuis.png')} style={styles.profile} />
            </View>
            <View style ={styles.tarjeta}>
                <View style={styles.cajaTexto}>
                    <TextInput placeholder="correo@uis.edu.co" style={styles.input} />
                </View>

                <View style={styles.cajaTexto}>
                    <TextInput placeholder="Contraseña" style={styles.input}  secureTextEntry={true}/>
                </View>

                <View style={styles.PadreBoton}>
                    <TouchableOpacity style ={styles.cajaBoton}> 
                        <Text style={styles.TextBoton}>Iniciar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </View >
        </View>
    )

   }

const styles = StyleSheet.create({
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
        paddingVertical:20,
        backgroundColor:'#cccccc40',
        borderRadius:30,
        marginVertical:10,
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
        paddingHorizontal: 15
    }                     
})