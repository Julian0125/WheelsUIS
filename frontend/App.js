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
import CrearViaje from './pages/CrearViaje';


const linking = {
    prefixes: ['http://localhost:8081', 'https://localhost:8081'],
    config: {
        screens: {
            Login: '',
            RegistroUsuario: 'RegistroUsuario',
            HomeConductor: 'HomeConductor',
            HomePasajero: 'HomePasajero',
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
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Inicio':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'MisViajes':
                            iconName = focused ? 'car' : 'car-outline';
                            break;
                        case 'Historial':
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
                component={Home}
                options={{ tabBarLabel: 'Inicio' }}
            />
            <Tab.Screen 
                name="MisViajes" 
                component={MisViajesScreen}
                options={{ tabBarLabel: 'Mis Viajes' }}
            />
            <Tab.Screen 
                name="Historial" 
                component={HistorialConductorScreen}
                options={{ tabBarLabel: 'Historial' }}
            />
            <Tab.Screen 
                name="Perfil" 
                component={PerfilConductorScreen}
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
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Inicio':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'MisReservas':
                            iconName = focused ? 'bookmark' : 'bookmark-outline';
                            break;
                        case 'Historial':
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
                component={Home}
                options={{ tabBarLabel: 'Inicio' }}
            />
            <Tab.Screen 
                name="MisReservas" 
                component={MisReservasScreen}
                options={{ tabBarLabel: 'Reservas' }}
            />
            <Tab.Screen 
                name="Historial" 
                component={HistorialPasajeroScreen}
                options={{ tabBarLabel: 'Historial' }}
            />
            <Tab.Screen 
                name="Perfil" 
                component={PerfilPasajeroScreen}
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
                // ========== RUTAS SIN AUTENTICACIÓN ==========
                <>
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="RegistroUsuario" component={RegistroUsuario} />
                </>
            ) : (
                // ========== RUTAS AUTENTICADAS SEGÚN ROL ==========
                <>
                    {usuario.tipoUsuario === 'CONDUCTOR' ? (
                        // ========== RUTAS PARA CONDUCTOR ==========
                        <>
                            {/* Tabs principales */}
                            <Stack.Screen 
                                name="HomeConductor" 
                                component={ConductorTabs}
                                options={{ gestureEnabled: false }}
                            />
                            
                            {/* Pantallas modales/completas accesibles desde botones */}
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
                            <Stack.Screen 
                                name="RegistrarVehiculo" 
                                component={RegistrarVehiculoScreen}
                                options={{
                                    presentation: 'card',
                                    headerShown: true,
                                    headerTitle: 'Registrar Vehículo',
                                }}
                            />
                            <Stack.Screen 
                                name="MisVehiculos" 
                                component={MisVehiculosScreen}
                                options={{
                                    presentation: 'card',
                                    headerShown: true,
                                    headerTitle: 'Mis Vehículos',
                                }}
                            />
                        </>
                    ) : (
                        // ========== RUTAS PARA PASAJERO ==========
                        <>
                            {/* Tabs principales */}
                            <Stack.Screen 
                                name="HomePasajero" 
                                component={PasajeroTabs}
                                options={{ gestureEnabled: false }}
                            />
                            
                            {/* Pantallas modales/completas accesibles desde botones */}
                            <Stack.Screen 
                                name="BuscarViajes" 
                                component={BuscarViajesScreen}
                                options={{
                                    presentation: 'card',
                                    headerShown: true,
                                    headerTitle: 'Buscar Viajes',
                                }}
                            />
                            <Stack.Screen 
                                name="ChatScreen" 
                                component={ChatScreen}
                                options={{
                                    headerShown: true,
                                    headerTitle: 'Chat',
                                }}
                            />
                        </>
                    )}
                </>
            )}
        </Stack.Navigator>
    );
}


function MyStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="RegistroUsuario" component={RegistroUsuario} />
            <Stack.Screen name="HomeTabs" component={HomeTabs} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="CrearViaje" component={CrearViaje} />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
