import React, { useState, useEffect, useRef } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  Button, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WS_URL = 'wss://wheelsuis.onrender.com/chats';

//prueba 
console.log('🔗 WS_URL:', WS_URL);

export default function ChatScreen({ route, navigation }) {
  const { viaje } = route.params || {};
  const { usuario } = useAuth();

  //pruebas
  console.log('🧭 route.params en Chat:', route.params);
  console.log('🧭 viaje en Chat:', viaje);
  console.log('🧭 usuario en Chat:', usuario);

  const [serverState, setServerState] = useState('Conectando...');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [cargandoMensajes, setCargandoMensajes] = useState(true);

  const stompClient = useRef(null);
  const scrollViewRef = useRef(null);

  const viajeActivo = viaje?.estadoViaje !== 'FINALIZADO' && viaje?.estadoViaje !== 'CANCELADO';
  const chatHabilitado = viajeActivo && viaje?.chat?.id;

  const chatKey = viaje?.chat?.id ? `chat_${viaje.chat.id}` : null;

  const tipoUsuario = (usuario?.tipoUsuario || usuario?.tipo || '').toUpperCase();
  const esConductor = tipoUsuario === 'CONDUCTOR';
  const esPasajero  = tipoUsuario === 'PASAJERO';

  const pasajeros = viaje?.pasajeros || [];

  // prueba consola 
  console.log('🧭 viajeActivo:', viajeActivo);
  console.log('🧭 viaje.chat:', viaje?.chat);
  console.log('🧭 chatHabilitado:', chatHabilitado);
  console.log('🧭 chatKey:', chatKey);
  console.log('🧭 esConductor:', esConductor, 'esPasajero:', esPasajero);

  
  useEffect(() => {
    if (chatKey) {
      cargarMensajes();
    }
  }, [chatKey]);

  const cargarMensajes = async () => {
    try {
      setCargandoMensajes(true);

      let mensajesAcumulados = [];

      
      if (chatKey) {
        const mensajesGuardados = await AsyncStorage.getItem(chatKey);
        if (mensajesGuardados) {
          mensajesAcumulados = JSON.parse(mensajesGuardados);
          console.log('💾 Mensajes cargados desde caché:', mensajesAcumulados.length);
        }
      }

      
      if (viaje?.chat?.mensajes?.length) {
        const mensajesServidor = viaje.chat.mensajes.map(msg => ({
          id: msg.id,
          contenido: msg.contenido,
          autor: msg.autor?.nombre || 'Desconocido',
          autorId: msg.autor?.id,
          fechaEnvio: msg.fechaEnvio
        }));

        console.log('🌐 Mensajes del servidor:', mensajesServidor.length);

        const mapaPorId = new Map();

        mensajesAcumulados.forEach(m => {
          if (m.id != null) mapaPorId.set(m.id, m);
        });

        mensajesServidor.forEach(m => {
          if (m.id != null) mapaPorId.set(m.id, m);
        });

        mensajesAcumulados = Array.from(mapaPorId.values())
          .sort((a, b) => new Date(a.fechaEnvio) - new Date(b.fechaEnvio));

        setMessages(mensajesAcumulados);

        if (chatKey) {
          await AsyncStorage.setItem(chatKey, JSON.stringify(mensajesAcumulados));
        }
      } else {
       
        setMessages(mensajesAcumulados);
      }

    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setCargandoMensajes(false);
    }
  };

  // ================================
  // GUARDAR MENSAJES
  // ================================
  useEffect(() => {
    if (messages.length > 0 && chatKey) {
      guardarMensajes();
    }
  }, [messages, chatKey]);

  const guardarMensajes = async () => {
    if (!chatKey) return;
    try {
      await AsyncStorage.setItem(chatKey, JSON.stringify(messages));
      console.log('💾 Mensajes guardados:', messages.length);
    } catch (error) {
      console.error('❌ Error al guardar mensajes:', error);
    }
  };

  // ================================
  // CONECTAR WEBSOCKET
  // ================================
  useEffect(() => {
    if (!usuario || !chatHabilitado) {
      if (!chatHabilitado && viajeActivo) setServerState('Chat no disponible');
      return;
    }
    
    conectarWebSocket();
    
    return () => {
      if (stompClient.current) {
        console.log('🔌 Desconectando WebSocket...');
        stompClient.current.deactivate();
      }
    };
  }, [usuario, viaje?.id, chatHabilitado]);

  const conectarWebSocket = () => {
    console.log('🔌 Conectando WebSocket a:', WS_URL);
    
    stompClient.current = new Client({
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // DEBUG de STOMP
      debug: (msg) => {
        console.log('🐛 STOMP DEBUG:', msg);
      },

      onConnect: () => {
        console.log('✅ WebSocket conectado');
        setServerState('Conectado');
        setConnected(true);
        
        const topic = `/topic/viaje/${viaje.id}`;
        console.log('Suscrito a:', topic);
        
        stompClient.current.subscribe(topic, (message) => {
          console.log('RAW recibido:', message.body);
          try {
            const receivedMessage = JSON.parse(message.body);
            console.log('Mensaje recibido:', receivedMessage);
            
            const nuevoMensaje = {
              id: receivedMessage.id,
              contenido: receivedMessage.contenido,
              autor: receivedMessage.autor?.nombre || 'Desconocido',
              autorId: receivedMessage.autor?.id,
              fechaEnvio: receivedMessage.fechaEnvio || new Date().toISOString()
            };

           
            setMessages(prevMessages => {
             
              const indexPorId = prevMessages.findIndex(m => m.id === nuevoMensaje.id);
              if (indexPorId !== -1) {
                const copia = [...prevMessages];
                copia[indexPorId] = { ...copia[indexPorId], ...nuevoMensaje };
                console.log('♻️ Actualizando mensaje existente por id');
                return copia;
              }

             
              const indexTemp = prevMessages.findIndex(m =>
                String(m.autorId) === String(nuevoMensaje.autorId) &&
                m.contenido === nuevoMensaje.contenido &&
                String(m.id).startsWith('temp-')
              );

              if (indexTemp !== -1) {
                const copia = [...prevMessages];
                copia[indexTemp] = { ...copia[indexTemp], ...nuevoMensaje };
                console.log('🔄 Reemplazando mensaje temp por definitivo');
                return copia;
              }

             
              console.log('Nuevo mensaje agregado');
              return [...prevMessages, nuevoMensaje];
            });

          } catch (error) {
            console.error('Error al parsear mensaje:', error);
          }
        });
      },

      onDisconnect: () => {
        console.log('WebSocket desconectado');
        setServerState('Desconectado');
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error('Error STOMP:', frame.headers.message, frame.body);
        setServerState('Error: ' + frame.headers.message);
        setConnected(false);
      },

      onWebSocketError: (error) => {
        console.error('Error WebSocket RAW:', error);
        try {
          console.error('Error WebSocket JSON:', JSON.stringify(error));
        } catch (_) {}
        setServerState('Error de conexión');
        setConnected(false);
      }
    });

    stompClient.current.activate();
  };

 
  const sendMessage = () => {
    if (!messageText.trim() || !connected || !usuario || !viajeActivo) {
      console.log('No se puede enviar mensaje');
      return;
    }

    const contenidoMensaje = messageText.trim();
    const tempId = `temp-${Date.now()}`;
    
    const mensajeOptimista = {
      id: tempId,
      contenido: contenidoMensaje,
      autor: usuario.nombre,
      autorId: usuario.id,
      fechaEnvio: new Date().toISOString()
    };

    console.log('Mensaje optimista:', mensajeOptimista);
    setMessages(prevMessages => [...prevMessages, mensajeOptimista]);
    setMessageText('');

    const mensaje = {
      contenido: contenidoMensaje,
      autor: { id: usuario.id, nombre: usuario.nombre },
      chat: { id: viaje.chat.id, viaje: { id: viaje.id } }
    };

    try {
      console.log('Enviando al servidor...', mensaje);
      
      stompClient.current.publish({
        destination: '/app/chat.enviar',
        body: JSON.stringify(mensaje)
      });

      console.log('Mensaje enviado');

    } catch (error) {
      console.error('Error al enviar:', error);
      setMessages(prevMessages => 
        prevMessages.filter(m => m.id !== tempId)
      );
      Alert.alert('Error', 'No se pudo enviar el mensaje');
      setMessageText(contenidoMensaje);
    }
  };

 
  if (!usuario) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: No hay usuario en sesión</Text>
      </View>
    );
  }

  if (!viaje) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: No hay información del viaje</Text>
        <Button title="Volver" onPress={() => navigation.goBack()} color="#207636" />
      </View>
    );
  }

  if (!chatHabilitado && viaje?.estadoViaje === 'CANCELADO') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoIcon}>❌</Text>
        <Text style={styles.infoTitle}>Viaje cancelado</Text>
        <Text style={styles.infoText}>Este viaje fue cancelado.</Text>
        <Button title="Volver" onPress={() => navigation.goBack()} color="#207636" />
      </View>
    );
  }

  if (!viajeActivo) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoIcon}>🏁</Text>
        <Text style={styles.infoTitle}>Viaje finalizado</Text>
        <Text style={styles.infoText}>
          Este viaje ha terminado y el chat ya no está disponible.
        </Text>
        <Button title="Volver" onPress={() => navigation.goBack()} color="#207636" />
      </View>
    );
  }

  if (!chatHabilitado) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoIcon}>⚠️</Text>
        <Text style={styles.infoTitle}>Chat no disponible</Text>
        <Text style={styles.infoText}>
          El chat de este viaje no está disponible aún.
        </Text>
        <Button title="Volver" onPress={() => navigation.goBack()} color="#207636" />
      </View>
    );
  }


  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[
          styles.statusBar, 
          { backgroundColor: connected ? '#4CAF50' : '#FF5252' }
        ]}>
          <Text style={styles.statusText}>
            {serverState}
            {connected && ' 🟢'}
            {!connected && ' 🔴'}
          </Text>
        </View>
        
        <View style={styles.viajeInfo}>
          <Text style={styles.viajeTexto}>
            🚗 <Text style={styles.nombreUsuario}>
              {viaje.conductor?.nombre || 'Conductor'}
            </Text>
            {esConductor && <Text style={styles.badgeTu}> (Tú)</Text>}
          </Text>
          <Text style={styles.rutaDestino}>
            📍 {viaje.origen} → {viaje.destino}
          </Text>
          <Text style={styles.rutaHora}>
            🕐 {new Date(viaje.horaSalida).toLocaleString('es-CO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          <Text style={styles.cuposInfo}>
            👥 {pasajeros.length}/{viaje.cuposMaximos} pasajeros
          </Text>
          <Text style={styles.rutaEstado}>
            {viaje.estadoViaje === 'ENCURSO' ? '🚗 En curso' : '⏳ Próximo'}
          </Text>
        </View>
      </View>

      
      <ScrollView
        style={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {cargandoMensajes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#207636" />
            <Text style={styles.loadingText}>Cargando mensajes...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>
              {esConductor 
                ? 'Inicia la conversación con tus pasajeros'
                : 'Inicia la conversación con el conductor'}
            </Text>
            <Text style={styles.emptySubtext}>
              Usa este chat para coordinar el punto de encuentro o cualquier novedad del viaje
            </Text>
          </View>
        ) : (
          messages.map((msg, index) => {
            const esMio = String(msg.autorId) === String(usuario.id);
            const esTemp = String(msg.id).startsWith('temp-');
            
            return (
              <View 
                key={`${msg.id}-${index}`}
                style={[
                  styles.messageItem,
                  esMio ? styles.myMessage : styles.otherMessage,
                  esTemp && styles.messageTemp
                ]}
              >
                {!esMio && <Text style={styles.messageAuthor}>{msg.autor}</Text>}
                <Text style={[styles.messageContent, esMio && styles.myMessageText]}>
                  {msg.contenido}
                </Text>
                <Text style={[styles.messageTime, esMio && styles.myMessageTime]}>
                  {new Date(msg.fechaEnvio).toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {esTemp && ' ⏳'}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

 
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          onChangeText={setMessageText}
          value={messageText}
          multiline
          maxLength={500}
          editable={connected}
        />
        <Button
          onPress={sendMessage}
          title="Enviar"
          disabled={!connected || !messageText.trim()}
          color="#207636"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  infoIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusBar: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  viajeInfo: {
    padding: 15,
  },
  viajeTexto: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  nombreUsuario: {
    fontWeight: 'bold',
    color: '#207636',
    fontSize: 17,
  },
  rutaDestino: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  rutaHora: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cuposInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  rutaEstado: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 3,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingHorizontal: 40,
    fontStyle: 'italic',
  },
  messageItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '75%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#207636',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageAuthor: {
    fontWeight: 'bold',
    color: '#207636',
    marginBottom: 4,
    fontSize: 13,
  },
  messageContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  myMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  messageTemp: {
    opacity: 0.7,
  },
});



