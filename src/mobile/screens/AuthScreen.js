import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../services/api';

export default function AuthScreen({ onNavigateToHome }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const showError = (text) => setMessage({ type: 'error', text });

  const switchMode = (login) => {
    setIsLogin(login);
    setMessage(null);
  };

  const handleSubmit = async () => {
    if (loading) return;

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      showError('Kérjük töltsd ki az e-mail és jelszó mezőket!');
      return;
    }

    if (!isLogin && !fullName.trim()) {
      showError('Kérjük add meg a teljes neved!');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          showError(data.message || 'Sikertelen bejelentkezés!');
        } else if (!data.token) {
          showError('A szerver válasza hiányos: nem érkezett token.');
        } else {
          await AsyncStorage.setItem('userToken', data.token);
          if (data.user) {
            await AsyncStorage.setItem('userData', JSON.stringify(data.user));
          }
          onNavigateToHome?.();
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName.trim(),
            email: cleanEmail,
            password,
            role,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          setIsLogin(true);
          setPassword('');
          setMessage({
            type: 'success',
            text: 'Fiókod elkészült. Most már bejelentkezhetsz!',
          });
        } else {
          showError(data.message || 'Sikertelen regisztráció!');
        }
      }
    } catch (error) {
      console.error('Auth hiba:', error);
      showError('Nem sikerült csatlakozni a szerverhez!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>FoodApp 🍕</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Jelentkezz be a folytatáshoz' : 'Hozz létre egy új fiókot'}
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.activeTab]}
              onPress={() => switchMode(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                Bejelentkezés
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.activeTab]}
              onPress={() => switchMode(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                Regisztráció
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teljes név</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Gipsz Jakab"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail cím</Text>
              <TextInput
                style={styles.input}
                placeholder="pelda@email.hu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Jelszó</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fiók típusa</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]}
                    onPress={() => setRole('customer')}
                  >
                    <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>
                      Vásárló
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'courier' && styles.roleBtnActive]}
                    onPress={() => setRole('courier')}
                  >
                    <Text style={[styles.roleText, role === 'courier' && styles.roleTextActive]}>
                      Futár
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {message ? (
              <Text
                style={[
                  styles.message,
                  message.type === 'success' ? styles.messageSuccess : styles.messageError,
                ]}
              >
                {message.text}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6c757d',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#212529',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212529',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  roleBtnActive: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  roleTextActive: {
    color: '#ffffff',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  messageError: {
    color: '#C62828',
  },
  messageSuccess: {
    color: '#2E7D32',
  },
  submitButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});