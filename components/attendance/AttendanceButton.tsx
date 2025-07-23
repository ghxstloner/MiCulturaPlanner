import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


interface AttendanceButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
}

export default function AttendanceButton({ 
  onPress, 
  loading = false, 
  disabled = false,
  title = "Marcar Asistencia",
  subtitle = "Reconocimiento Facial"
}: AttendanceButtonProps) {
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading && !disabled) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading, disabled, pulseAnim, glowAnim]);

  const handlePress = () => {
    if (!loading && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const buttonOpacity = disabled ? 0.5 : 1;

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          transform: [{ scale: pulseAnim }],
          opacity: buttonOpacity
        }
      ]}
    >
      {/* Glow effect */}
      <Animated.View 
        style={[
          styles.glowContainer,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          }
        ]}
      >
        <LinearGradient
          colors={['#1B4D8C', '#4A90D9', '#D4AF37']}
          style={styles.glow}
        />
      </Animated.View>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={loading || disabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={loading 
            ? ['#6C757D', '#495057'] 
            : disabled
            ? ['#ADB5BD', '#6C757D']
            : ['#1B4D8C', '#4A90D9']
          }
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {loading ? (
              <Animated.View style={[
                styles.loadingIcon,
                {
                  transform: [{
                    rotate: pulseAnim.interpolate({
                      inputRange: [1, 1.05],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }
              ]}>
                <Ionicons name="sync" size={32} color="white" />
              </Animated.View>
            ) : (
              <Ionicons 
                name={disabled ? "camera-outline" : "camera"}
                size={32} 
                color="white" 
              />
            )}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {loading ? "Procesando..." : title}
            </Text>
            <Text style={styles.subtitle}>
              {loading ? "Por favor espera" : subtitle}
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </View>

        {/* Ripple effect */}
        {!loading && !disabled && (
          <View style={styles.rippleContainer}>
            <Animated.View 
              style={[
                styles.ripple,
                {
                  transform: [{
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    })
                  }],
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0],
                  }),
                }
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  glowContainer: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 25,
  },
  glow: {
    flex: 1,
    borderRadius: 25,
  },
  button: {
    height: 80,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  loadingIcon: {
    // Animation will be applied via transform
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});