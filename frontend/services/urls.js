import { Platform } from 'react-native';

const PORT = 8080;

// Host según la plataforma
const HOST = Platform.select({
    web: 'localhost',
    android: '10.0.2.2',
    ios: 'localhost',
    default: 'localhost',
});


export const HTTP_BASE_URL = `http://${HOST}:${PORT}`;
export const WS_URL = `ws://${HOST}:${PORT}/chats`;

