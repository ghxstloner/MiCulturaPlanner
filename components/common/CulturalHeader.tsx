import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface CulturalHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  onProfilePress?: () => void;
  onLogoutPress?: () => void;
}

// Componente de la bandera de Panamá
const PanamaFlagIcon = () => (
  <View style={styles.flagContainer}>
    {/* Cuadrante blanco superior izquierdo */}
    <View style={[styles.flagQuadrant, styles.topLeft, { backgroundColor: '#FFFFFF' }]} />
    {/* Cuadrante azul superior derecho */}
    <View style={[styles.flagQuadrant, styles.topRight, { backgroundColor: '#005293' }]} />
    {/* Cuadrante rojo inferior izquierdo */}
    <View style={[styles.flagQuadrant, styles.bottomLeft, { backgroundColor: '#d21033' }]} />
    {/* Cuadrante blanco inferior derecho */}
    <View style={[styles.flagQuadrant, styles.bottomRight, { backgroundColor: '#FFFFFF' }]} />
  </View>
);

export default function CulturalHeader({ 
  title = 'MiCultura',
  subtitle = 'Sistema de Asistencia',
  showLogo = true,
  onProfilePress,
  onLogoutPress
}: CulturalHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Animación simple y suave
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[
      styles.container, 
      { backgroundColor: colors.surface, opacity: fadeAnim }
    ]}>
      <View style={styles.contentContainer}>
        {/* Logo de bandera panameña */}
        {showLogo && (
          <View style={styles.logoContainer}>
            <PanamaFlagIcon />
          </View>
        )}

        {/* Contenido del texto */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.primary }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>

        {/* Acciones del header */}
        {(onProfilePress || onLogoutPress) && (
          <View style={styles.headerActions}>
            {onProfilePress && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.greyLight }]}
                onPress={onProfilePress}
                activeOpacity={0.7}
              >
                <Ionicons name="person-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            
            {onLogoutPress && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.greyLight }]}
                onPress={onLogoutPress}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={18} color={colors.primaryRed} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  flagContainer: {
    width: 32,
    height: 22,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flagQuadrant: {
    position: 'absolute',
    width: 16,
    height: 11,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});