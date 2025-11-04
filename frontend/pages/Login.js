import React, { useState } from 'react';
import { Text, StyleSheet, View, TextInput, Image, TouchableOpacity, Alert } from 'react-native';

export default function Login() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const handleLogin = async (e) => {
  e.preventDefault();
  
  const response = await fetch('http://localhost:8080/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json(); // ← Línea 28 donde falla
  // ...resto del código
};

return ( <View style={styles.padre}>
<Image source={require('../assets/wheelsuis.png')} style={styles.profile} /> <View style={styles.tarjeta}> <View style={styles.cajaTexto}> <TextInput
         placeholder="correo@uis.edu.co"
         style={styles.input}
         value={email}
         onChangeText={setEmail}
       /> </View>


    <View style={styles.cajaTexto}>
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
    </View>

    <View style={styles.PadreBoton}>
      <TouchableOpacity style={styles.cajaBoton} onPress={handleLogin}>
        <Text style={styles.TextBoton}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  </View>
</View>


);
}

const styles = StyleSheet.create({
padre: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: 'white'
},
profile: {
width: 150,
height: 150,
borderRadius: 70,
borderColor: 'white'
},
tarjeta: {
margin: 29,
backgroundColor: '#f0f0f0',
borderRadius: 20,
width: 350,
padding: 20,
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.25,
shadowRadius: 4,
elevation: 5
},
cajaTexto: {
paddingVertical: 20,
backgroundColor: '#cccccc40',
borderRadius: 30,
marginVertical: 10
},
PadreBoton: {
alignItems: 'center'
},
cajaBoton: {
backgroundColor: '#207636ff',
paddingVertical: 20,
borderRadius: 30,
width: 150,
marginTop: 20
},
TextBoton: {
color: 'white',
textAlign: 'center'
},
input: {
paddingHorizontal: 15
}
});
