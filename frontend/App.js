import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';


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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Pantallas vacías temporales
function HistorialScreen() {
    return null;
}

function PerfilScreen() {
    return null;
}

// Barra inferior (Tabs)
function HomeTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#207636',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 0.5,
                    borderTopColor: '#ccc',
                    height: 60,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Historial') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={26} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Historial" component={HistorialScreen} />
            <Tab.Screen name="Perfil" component={PerfilScreen} />
        </Tab.Navigator>
    );
}

function MyStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="RegistroUsuario" component={RegistroUsuario} />
            <Stack.Screen name="HomeTabs" component={HomeTabs} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer linking={linking}>
                <MyStack />
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
