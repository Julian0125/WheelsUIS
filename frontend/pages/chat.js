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
  Alert
} from 'react-native';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../context/AuthContext';
import { WS_URL } from '../services/urls';



export default function ChatScreen({ route, navigation }) {
  // El viaje completo viene desde la navegación
  const { viaje } = route.params;
  
  // Usuario actual desde el Context
  const { usuario } = useAuth();
 

  const [serverState, setServerState] = useState('Conectando...');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  
  const stompClient = useRef(null);
  const scrollViewRef = useRef(null);

  // Determinar estado del viaje
  const viajeActivo = viaje.estadoViaje !== 'FINALIZADO' && viaje.estadoViaje !== 'CANCELADO';
  const chatHabilitado = viajeActivo && viaje.chat?.id;

  // Determinar si el usuario es el conductor
  const esConductor = usuario.id === viaje.conductor?.id;
  
  // Lista de pasajeros para mostrar info
  const pasajeros = viaje.pasajeros || [];

  useEffect(() => {
    if (!usuario || !chatHabilitado) {
      if (!chatHabilitado && viajeActivo) {
        setServerState('Chat no disponible');
      }
      return;
    }

    conectarWebSocket();

    return () => {
      if (stompClient.current) {
        console.log('🔌 Desconectando WebSocket...');
        stompClient.current.deactivate();
      }
    };
  }, [usuario, viaje.id, chatHabilitado]);

  const conectarWebSocket = () => {
    console.log(`🔗 Conectando al chat del viaje ${viaje.id}...`);
    
    stompClient.current = new Client({
      ...(Platform.OS === 'web'
      ? { brokerURL: WS_URL } 
      : { webSocketFactory: () => new WebSocket(WS_URL) }), 
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('✅ Conectado al servidor WebSocket');
        setServerState('Conectado');
        setConnected(true);

        // Suscribirse al topic del viaje
        const topic = `/topic/viaje/${viaje.id}`;
        console.log(`📡 Suscrito a: ${topic}`);
        
        stompClient.current.subscribe(topic, (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);
            console.log('📨 Mensaje recibido:', receivedMessage);
            
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: receivedMessage.id,
                contenido: receivedMessage.contenido,
                autor: receivedMessage.autor?.nombre || 'Desconocido',
                autorId: receivedMessage.autor?.id,
                fechaEnvio: receivedMessage.fechaEnvio
              }
            ]);
          } catch (error) {
            console.error('❌ Error al parsear mensaje:', error);
          }
        });
      },

      onDisconnect: () => {
        console.log('🔌 Desconectado del servidor');
        setServerState('Desconectado');
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error('❌ Error STOMP:', frame.headers.message);
        setServerState('Error: ' + frame.headers.message);
        setConnected(false);
      },

      onWebSocketError: (error) => {
        console.error('❌ Error WebSocket:', error);
        setServerState('Error de conexión. Verifica tu red y la IP del servidor.');
        setConnected(false);
      }
    });

    stompClient.current.activate();
  };

  const sendMessage = () => {
    if (!messageText.trim() || !connected || !usuario) return;

    // Validar que el viaje siga activo
    if (!viajeActivo) {
      Alert.alert(
        'Chat cerrado',
        'Este viaje ha finalizado y el chat ya no está disponible.'
      );
      return;
    }

    const mensaje = {
      contenido: messageText.trim(),
      autor: {
        id: usuario.id,
        nombre: usuario.nombre
      },
      chat: {
        id: viaje.chat.id,
        viaje: {
          id: viaje.id
        }
      }
    };

    try {
      console.log('📤 Enviando mensaje:', mensaje);
      
      stompClient.current.publish({
        destination: '/app/chat.enviar',
        body: JSON.stringify(mensaje)
      });

      setMessageText('');
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  if (!usuario) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Error: No hay usuario en sesión
        </Text>
      </View>
    );
  }

  if (!chatHabilitado && viaje.estadoViaje === 'CANCELADO') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoIcon}>❌</Text>
        <Text style={styles.infoTitle}>Viaje cancelado</Text>
        <Text style={styles.infoText}>
          Este viaje fue cancelado.
        </Text>
        <Button 
          title="Volver" 
          onPress={() => navigation.goBack()}
          color="#207636"
        />
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
        <Button 
          title="Volver" 
          onPress={() => navigation.goBack()}
          color="#207636"
        />
      </View>
    );
  }

  if (!chatHabilitado) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoIcon}>⚠️</Text>
        <Text style={styles.infoTitle}>Chat no disponible</Text>
        <Text style={styles.infoText}>
          El chat de este viaje no está disponible.
        </Text>
        <Button 
          title="Volver" 
          onPress={() => navigation.goBack()}
          color="#207636"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header con info del viaje */}
      <View style={styles.header}>
        <View style={[
          styles.statusBar, 
          { backgroundColor: connected ? '#4CAF50' : '#FF5252' }
        ]}>
          <Text style={styles.statusText}>
            {serverState}
          </Text>
        </View>
        
        <View style={styles.viajeInfo}>
          {/* Info del conductor */}
          <Text style={styles.viajeTexto}>
            🚗 <Text style={styles.nombreUsuario}>
              {viaje.conductor?.nombre || 'Conductor'}
            </Text>
          </Text>
          
          {/* Ruta del viaje */}
          <Text style={styles.rutaDestino}>
            📍 {viaje.origen} → {viaje.destino}
          </Text>
          
          {/* Hora de salida */}
          <Text style={styles.rutaHora}>
            🕐 {new Date(viaje.horaSalida).toLocaleString('es-CO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          
          {/* Pasajeros y cupos */}
          <Text style={styles.cuposInfo}>
            👥 {pasajeros.length}/{viaje.cuposMaximos} pasajeros
          </Text>
          
          {/* Estado del viaje */}
          <Text style={styles.rutaEstado}>
            {viaje.estadoViaje === 'ENCURSO' ? '🚗 En curso' : '⏳ Próximo'}
          </Text>
        </View>
      </View>

      {/* Lista de mensajes */}
      <ScrollView 
        style={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>
              {esConductor 
                ? 'Inicia la conversación con tus pasajeros'
                : 'Inicia la conversación con el conductor'
              }
            </Text>
            <Text style={styles.emptySubtext}>
              Usa este chat para coordinar el punto de encuentro o cualquier novedad del viaje
            </Text>
          </View>
        ) : (
          messages.map((msg, index) => {
            const esMio = msg.autorId === usuario.id;
            
            return (
              <View 
                key={index} 
                style={[
                  styles.messageItem,
                  esMio ? styles.myMessage : styles.otherMessage
                ]}
              >
                {!esMio && (
                  <Text style={styles.messageAuthor}>{msg.autor}</Text>
                )}
                <Text style={[
                  styles.messageContent,
                  esMio && styles.myMessageText
                ]}>
                  {msg.contenido}
                </Text>
                <Text style={[
                  styles.messageTime,
                  esMio && styles.myMessageTime
                ]}>
                  {new Date(msg.fechaEnvio).toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input para nuevo mensaje */}
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
});