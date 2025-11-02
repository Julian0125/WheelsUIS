import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  ios: 'http://localhost:8080',
  android: 'http://10.0.2.2:8080',
  default: 'http://192.168.1.7:8080', 
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, 
});

http.interceptors.respone.use(
   (res) => res,
   (err) => {
     console.error('API Error:', err?.response?. data || err.message);
     return Promise.reject(err);
   }

);

export const login = 
  

   