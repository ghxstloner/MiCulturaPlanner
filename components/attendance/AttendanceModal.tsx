import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface AttendanceModalProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

export default function AttendanceModal({ visible, message, type, onDismiss }: AttendanceModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Icon animation with delay
      setTimeout(() => {
        Animated.spring(iconAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start();
      }, 200);

      // Haptic feedback
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      iconAnim.setValue(0);
    }
  }, [visible, type, scaleAnim, fadeAnim, iconAnim]);

  const getIconName = () => {
    return type === 'success' ? 'checkmark-circle' : 'close-circle';
  };

  const getIconColor = () => {
    return type === 'success' ? colors.success : colors.error;
  };

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    if (type === 'success') {
      return colorScheme === 'dark' 
        ? ['rgba(40, 167, 69, 0.9)', 'rgba(25, 135, 84, 0.9)'] as const
        : ['rgba(40, 167, 69, 0.95)', 'rgba(25, 135, 84, 0.95)'] as const;
    } else {
      return colorScheme === 'dark'
        ? ['rgba(220, 53, 69, 0.9)', 'rgba(176, 42, 55, 0.9)'] as const
        : ['rgba(220, 53, 69, 0.95)', 'rgba(176, 42, 55, 0.95)'] as const;
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Background gradient */}
          <LinearGradient
            colors={getGradientColors()}
            style={styles.backgroundGradient}
          />

          {/* Icon with animation */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { scale: iconAnim },
                  {
                    rotate: iconAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.iconBackground}>
              <Ionicons 
                name={getIconName() as any} 
                size={60} 
                color={getIconColor()} 
              />
            </View>
          </Animated.View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {type === 'success' ? '¡Éxito!' : 'Error'}
            </Text>
            
            <Text style={[styles.message, { color: colors.greyMedium }]}>
              {message}
            </Text>

            {/* Status indicator */}
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: getIconColor() }
              ]} />
              <Text style={[styles.statusText, { color: getIconColor() }]}>
                {type === 'success' ? 'Asistencia Confirmada' : 'Acción Requerida'}
              </Text>
            </View>
          </View>

          {/* Action button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getIconColor() }]}
            onPress={onDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>
              {type === 'success' ? 'Continuar' : 'Intentar de Nuevo'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>

          {/* Decorative elements */}
          <View style={styles.decorativeContainer}>
            <View style={[styles.decorativeCircle, styles.circle1]} />
            <View style={[styles.decorativeCircle, styles.circle2]} />
            <View style={[styles.decorativeCircle, styles.circle3]} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.greyMedium }]}>
              MinCultura • República de Panamá
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    opacity: 0.1,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 150,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 80,
    height: 80,
    top: -20,
    right: -20,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: 50,
    left: -10,
  },
  circle3: {
    width: 40,
    height: 40,
    top: 80,
    left: 20,
  },
  footer: {
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});