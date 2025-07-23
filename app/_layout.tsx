import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Slot, SplashScreen } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppActivityIndicator from '../components/common/AppActivityIndicator';
import Colors from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { useAuthStore } from '../store/authStore';
import { useEventsStore } from '../store/eventsStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const initAuth = useAuthStore(state => state.initAuth);
  const loadEvents = useEventsStore(state => state.loadEvents);
  const colorScheme = useColorScheme();
  
  // Animaciones para la pantalla de splash personalizada
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Configuración del tema para React Native Paper
  const paperTheme = colorScheme === 'dark' 
    ? { 
        ...MD3DarkTheme, 
        colors: { 
          ...MD3DarkTheme.colors, 
          primary: Colors[colorScheme].primary,
          secondary: Colors[colorScheme].secondary,
          surface: Colors[colorScheme].surface,
          background: Colors[colorScheme].background,
        } 
      }
    : { 
        ...MD3LightTheme, 
        colors: { 
          ...MD3LightTheme.colors, 
          primary: Colors[colorScheme].primary,
          secondary: Colors[colorScheme].secondary,
          surface: Colors[colorScheme].surface,
          background: Colors[colorScheme].background,
        } 
      };

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Animación del logo al inicio
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();

        // Inicializar configuraciones
        await Promise.all([
          initAuth(),
          loadEvents()
        ]);
        
        // Tiempo mínimo de splash screen
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
        
        // Animar la salida de la pantalla de splash
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          })
        ]).start(() => {
          setShowSplash(false);
          SplashScreen.hideAsync();
        });
      }
    };

    if (loaded) {
      initialize();
    }
  }, [loaded, initAuth, loadEvents, fadeAnim, scaleAnim, logoAnim]);

  if (!loaded || isLoading) {
    return (
      <View style={[
        styles.loadingContainer, 
        { backgroundColor: colorScheme === 'dark' ? '#0F1419' : '#1B4D8C' }
      ]}>
        <LinearGradient
          colors={['#1B4D8C', '#4A90D9', '#2E5BA8']}
          style={styles.gradientBackground}
        />
        
        <Animated.View style={[
          styles.logoContainer,
          {
            opacity: logoAnim,
            transform: [
              { scale: logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1]
              })},
              { rotate: logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })}
            ]
          }
        ]}>
          <View style={styles.logoBackground}>
            <FontAwesome name="institution" size={50} color="#FFF" />
          </View>
        </Animated.View>
        
        <Text style={styles.loadingTitle}>MinCultura Check</Text>
        <Text style={styles.loadingSubtitle}>Ministerio de Cultura - República de Panamá</Text>
        
        <AppActivityIndicator 
          mensaje="Iniciando aplicación..." 
          fullScreen={false}
          color="#D4AF37"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        {showSplash ? (
          <Animated.View 
            style={[
              styles.splashContainer,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['#1B4D8C', '#4A90D9', '#2E5BA8']}
              style={styles.gradientBackground}
            />
            
            <View style={styles.splashContent}>
              <View style={styles.logoBackground}>
                <FontAwesome name="institution" size={60} color="#FFF" />
              </View>
              <Text style={styles.splashTitle}>MinCultura Check</Text>
              <Text style={styles.splashSubtitle}>Asistencia a Eventos Culturales</Text>
              <Text style={styles.splashBranding}>Ministerio de Cultura</Text>
              <Text style={styles.splashBrandingSubtitle}>República de Panamá</Text>
            </View>
          </Animated.View>
        ) : (
          <Slot />
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  splashContent: {
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  splashSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 30,
    textAlign: 'center',
  },
  splashBranding: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  splashBrandingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
});