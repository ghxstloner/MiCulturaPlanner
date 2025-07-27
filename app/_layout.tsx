import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ModernSplashScreen from '../components/common/ModernSplashScreen';
import Colors from '../constants/Colors';
import { AppProvider } from '../contexts';
import { useColorScheme } from '../hooks/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const colorScheme = useColorScheme();
  
  // Animaciones para la pantalla de splash personalizada
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Configuración del tema para React Native Paper con diseño panameño
  const paperTheme = { 
    ...MD3LightTheme, 
    colors: { 
      ...MD3LightTheme.colors, 
      primary: Colors[colorScheme].primary,
      secondary: Colors[colorScheme].secondary,
      surface: Colors[colorScheme].surface,
      background: Colors[colorScheme].background,
      onSurface: Colors[colorScheme].text,
      onBackground: Colors[colorScheme].text,
      onPrimary: '#FFFFFF',
      onSecondary: '#FFFFFF',
      outline: Colors[colorScheme].border,
      surfaceVariant: Colors[colorScheme].greyLight,
    },
    fonts: {
      ...MD3LightTheme.fonts,
      default: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      displayLarge: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 32,
        fontWeight: '600' as any,
        lineHeight: 40,
      },
      headlineMedium: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 24,
        fontWeight: '600' as any,
        lineHeight: 32,
      },
      titleLarge: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 18,
        fontWeight: '600' as any,
        lineHeight: 24,
      },
      bodyLarge: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 16,
        fontWeight: '400' as any,
        lineHeight: 24,
      },
      bodyMedium: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 14,
        fontWeight: '400' as any,
        lineHeight: 20,
      },
      labelLarge: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 14,
        fontWeight: '500' as any,
        lineHeight: 20,
      },
    }
  };

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Tiempo mínimo de splash screen
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
        
        // Animar la salida de la pantalla de splash
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 1000,
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
  }, [loaded, fadeAnim, scaleAnim]);

  if (!loaded || isLoading) {
    return (
      <ModernSplashScreen 
        isLoading={true}
        onAnimationComplete={() => {
          // La animación se completó, pero mantenemos el splash hasta que termine la carga
        }}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <PaperProvider theme={paperTheme}>
          {showSplash ? (
            <Animated.View 
              style={[
                styles.modernSplashContainer,
                { 
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <ModernSplashScreen 
                isLoading={false}
                onAnimationComplete={() => {
                  // La animación se completó
                }}
              />
            </Animated.View>
          ) : (
            <Slot />
          )}
        </PaperProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  modernSplashContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});