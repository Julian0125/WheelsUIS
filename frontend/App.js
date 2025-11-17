import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import HomePasajero from './pages/HomePasajero';
import HomeConductor from './pages/HomeConductor';
import RegistroUsuario from './pages/RegistroUsuario';
import ChatScreen from './pages/chat';
import CrearViaje from './pages/CrearViaje';
import Perfil from './pages/Perfil';
import RegistrarVehiculo from './pages/RegistrarVehiculo';
import MisVehiculos from './pages/MisVehiculos';
import HistorialViajes from './pages/HistorialViajes';
import ViajeActivo from './pages/ViajeActivo';
import BuscarViaje from './pages/BuscarViaje';


const linking = {
    prefixes: ['http://localhost:8081', 'https://localhost:8081'],
    config: {
        screens: {
            Login: '',
            RegistroUsuario: 'RegistroUsuario',
            HomeConductor: 'HomeConductor',
            HomePasajero: 'HomePasajero',
            Chat: 'chat',
            Perfil: 'Perfil',
            CrearViaje: 'CrearViaje',
            RegistrarVehiculo: 'RegistrarVehiculo',
            MisVehiculos: 'MisVehiculos',
            HistorialViajes: 'HistorialViajes',
            ViajeActivo: 'ViajeActivo',
        },
    },
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ConductorTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#239540',
                tabBarInactiveTintColor: 'gray',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 0.5,
                    borderTopColor: '#ccc',
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 5,
                },
                tabBarIcon: ({ focused, color }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Inicio':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Historial Viajes':
                            iconName = focused ? 'car' : 'car-outline';
                            break;
                        case 'Perfil':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={26} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Inicio"
                component={HomeConductor}
                options={{ tabBarLabel: 'Inicio' }}
            />
            <Tab.Screen
                name="Historial Viajes"
                component={HistorialViajes}
                options={{ tabBarLabel: 'Historial Viajes' }}
            />
            <Tab.Screen
                name="Perfil"
                component={Perfil}
                options={{ tabBarLabel: 'Perfil' }}
            />
        </Tab.Navigator>
    );
}

function PasajeroTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#1c3a1a',
                tabBarInactiveTintColor: 'gray',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 0.5,
                    borderTopColor: '#ccc',
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 5,
                },
                tabBarIcon: ({ focused, color }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Inicio':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Historial Viajes':
                            iconName = focused ? 'time' : 'time-outline';
                            break;
                        case 'Perfil':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={26} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Inicio"
                component={HomePasajero}
                options={{ tabBarLabel: 'Inicio' }}
            />
            <Tab.Screen
                name="Historial Viajes"
                component={HistorialViajes}
                options={{ tabBarLabel: 'Historial Viajes' }}
            />
            <Tab.Screen
                name="Perfil"
                component={Perfil}
                options={{ tabBarLabel: 'Perfil' }}
            />
        </Tab.Navigator>
    );
}

function AppNavigator() {
    const { usuario, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#207636" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!usuario ? (
                <>
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="RegistroUsuario" component={RegistroUsuario} />
                </>
            ) : (
                <>
                    {usuario.tipo === 'CONDUCTOR' || usuario.tipoUsuario === 'CONDUCTOR' ? (
                        <>
                            <Stack.Screen
                                name="HomeConductor"
                                component={ConductorTabs}
                                options={{ gestureEnabled: false }}
                            />

                            <Stack.Screen
                                name="CrearViaje"
                                component={CrearViaje}
                                options={{
                                    presentation: 'card',
                                    headerShown: true,
                                    headerTitle: 'Crear Viaje',
                                    headerBackTitle: 'Volver',
                                }}
                            />

                            {/* 🔥 AQUÍ ESTÁ LA PANTALLA QUE LE FALTABA */}
                            <Stack.Screen
                                name="ViajeActivo"
                                component={ViajeActivo}
                                options={{
                                    headerShown: false,
                                    gestureEnabled: false,
                                }}
                            />

                            <Stack.Screen
                                name="RegistrarVehiculo"
                                component={RegistrarVehiculo}
                                options={{
                                    presentation: 'card',
                                    headerShown: false,
                                }}
                            />

                            <Stack.Screen
                                name="MisVehiculos"
                                component={MisVehiculos}
                                options={{
                                    presentation: 'card',
                                    headerShown: true,
                                    headerTitle: 'Mis Vehículos',
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <Stack.Screen
                                name="HomePasajero"
                                component={PasajeroTabs}
                                options={{ gestureEnabled: false }}
                            />

                            <Stack.Screen
                                name="BuscarViaje"
                                component={BuscarViaje}
                                options={{
                                    presentation: 'card',
                                    headerShown: false,
                                }}
                            />

                        </>
                    )}
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer linking={linking}>
                <AppNavigator />
                <StatusBar style="auto" />
            </NavigationContainer>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
