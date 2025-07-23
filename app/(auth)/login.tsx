import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import CulturalHeader from '../../components/common/CulturalHeader';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useAuthStore } from '../../store/authStore';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [cedula, setCedula] = useState('');
  const [pin, setPin] = useState('');
  const login = useAuthStore(state => state.login);
  const loading = useAuthStore(state => state.loading);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, slideAnim, formOpacity, formTranslate, buttonScale]);

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    animateButtonPress();
    
    if (!cedula.trim() || !pin.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    const success = await login(cedula, pin);
    
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)' as Href);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Cédula o PIN incorrecto');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mainContainer}
    >
      <LinearGradient
        colors={colorScheme === 'dark' 
          ? ['#0F1419', '#1A1F24', '#252A30']
          : ['#F8F9FA', '#FFFFFF', '#F0F0F0']
        }
        style={StyleSheet.absoluteFillObject}
      />
      
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Animated.View style={[
            styles.headerContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <CulturalHeader />
          </Animated.View>

          <Animated.View style={[
            styles.formContainer,
            { 
              opacity: formOpacity,
              transform: [{ translateY: formTranslate }]
            }
          ]}>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle" size={48} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.primary }]}>
                  Iniciar Sesión
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.greyMedium }]}>
                  Ingresa tus credenciales para acceder
                </Text>
              </View>
              
              <View style={styles.formFields}>
                <TextInput
                  label="Cédula"
                  value={cedula}
                  placeholder="Ej: 8-123-456"
                  onChangeText={setCedula}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="card-account-details" />}
                  theme={{ 
                    colors: { 
                      primary: colors.primary,
                      background: colors.surface 
                    } 
                  }}
                />

                <TextInput
                  label="PIN"
                  value={pin}
                  placeholder="Ingresa tu PIN"
                  secureTextEntry
                  keyboardType="numeric"
                  onChangeText={setPin}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="lock" />}
                  theme={{ 
                    colors: { 
                      primary: colors.primary,
                      background: colors.surface 
                    } 
                  }}
                />

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <Button
                    mode="contained"
                    loading={loading}
                    disabled={loading}
                    onPress={handleLogin}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    buttonColor={colors.primary}
                    textColor="#FFFFFF"
                    icon="login"
                  >
                    Ingresar
                  </Button>
                </Animated.View>
              </View>

              <View style={styles.helpSection}>
                <Text style={[styles.helpText, { color: colors.greyMedium }]}>
                  ¿Necesitas ayuda? Contacta al administrador del sistema
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={[styles.infoTitle, { color: colors.primary }]}>
                Usuarios de Prueba:
              </Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                • Cédula: 8-123-456 | PIN: 1234
              </Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                • Cédula: 8-765-432 | PIN: 1234
              </Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                • Cédula: 8-112-233 | PIN: 1234
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    minHeight: height,
  },
  headerContainer: {
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 20,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  formFields: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
  },
  buttonContent: {
    height: 50,
    justifyContent: 'center',
  },
  helpSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(27, 77, 140, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1B4D8C',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
  },
});