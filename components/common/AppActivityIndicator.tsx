import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface AppActivityIndicatorProps {
  mensaje?: string;
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export default function AppActivityIndicator({ 
  mensaje = 'Cargando...', 
  size = 'large', 
  color,
  fullScreen = true
}: AppActivityIndicatorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Pulsating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Rotating animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [fadeAnim, pulseAnim, rotateAnim]);

  const indicatorColor = color || colors.primary;
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <View style={[
      styles.container, 
      fullScreen ? styles.fullScreen : null,
      { backgroundColor: colors.background }
    ]}>
      <LinearGradient
        colors={['rgba(27, 77, 140, 0.1)', 'rgba(74, 144, 217, 0.1)']}
        style={styles.gradientBackground}
      />
      
      <Animated.View style={[
        styles.content,
        { 
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }]
        }
      ]}>
        <Animated.View style={[
          styles.spinnerContainer,
          { transform: [{ rotate }] }
        ]}>
          <ActivityIndicator 
            size={size} 
            color={indicatorColor} 
            style={styles.spinner}
          />
        </Animated.View>
        
        {mensaje ? (
          <Text style={[styles.message, { color: colors.text }]}>
            {mensaje}
          </Text>
        ) : null}
        
        <View style={styles.brandingContainer}>
          <Text style={[styles.branding, { color: colors.primary }]}>
            Ministerio de Cultura
          </Text>
          <Text style={[styles.brandingSubtitle, { color: colors.greyMedium }]}>
            República de Panamá
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    marginBottom: 20,
  },
  spinner: {
    transform: [{ scale: 1.5 }],
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 30,
    fontWeight: '500',
  },
  brandingContainer: {
    alignItems: 'center',
  },
  branding: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  brandingSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});