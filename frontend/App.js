import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Home from './pages/Home';
import RegistroUsuario from './pages/RegistroUsuario';
import ChatScreen from './pages/chat';

const linking = {
  prefixes: ['http://localhost:8081', 'https://localhost:8081'],
  config: {
    screens: {
      Login: '',
      RegistroUsuario: 'RegistroUsuario',
      Home: 'Home',
    },
  },
};

export default function App() {

  const Stack = createNativeStackNavigator();

    function MyStack() {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="RegistroUsuario" component={RegistroUsuario} />
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
            </Stack.Navigator>
        );
    }
  return (
    
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <MyStack/>
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
