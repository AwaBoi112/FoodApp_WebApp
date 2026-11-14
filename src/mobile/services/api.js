import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDefaultHost = () => {
  if (Platform.OS === 'web') return window.location.hostname;

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(':')[0];

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || `http://${getDefaultHost()}:3000/api`
).replace(/\/+$/, '');

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('userToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  let data = null;
  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    throw new Error('A szerver érvénytelen választ küldött.');
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Hiba történt a kérés során.');
  }
  return data;
};