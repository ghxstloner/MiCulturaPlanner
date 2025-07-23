import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';

interface CulturalHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  onProfilePress?: () => void;
  onLogoutPress?: () => void;
}

export default function CulturalHeader({ 
  title = 'MinCultura Check',
  subtitle = 'Asistencia a Eventos Culturales',
  showLogo = true,
  onProfilePress,
  onLogoutPress
}: CulturalHeaderProps) {
  const colorScheme = useColorScheme();

  // Animaciones
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Secuencia de animaciones
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(textAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(iconAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoAnim, textAnim, subtitleAnim, iconAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colorScheme === 'dark' 
          ? ['#1B4D8C', '#4A90D9', '#1B4D8C']
          : ['#1B4D8C', '#2E5BA8', '#4A90D9']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      <View style={styles.contentContainer}>
        {showLogo && (
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: logoAnim,
                transform: [
                  { scale: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })},
                  { rotateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['45deg', '0deg']
                  })}
                ]
              }
            ]}
          >
            <View style={styles.logoBackground}>
              <Ionicons name="library" size={32} color="#FFF" />
            </View>
          </Animated.View>
        )}

        <View style={styles.textContainer}>
          <Animated.View style={styles.titleRow}>
            <Animated.Text 
              style={[
                styles.title, 
                {
                  opacity: textAnim,
                  transform: [
                    { translateX: textAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })}
                  ]
                }
              ]}
            >
              {title}
            </Animated.Text>
            
            <Animated.View style={[
              styles.iconContainer,
              {
                opacity: iconAnim,
                transform: [
                  { scale: iconAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1]
                  })}
                ]
              }
            ]}>
              <Ionicons name="shield-checkmark" size={20} color="#D4AF37" />
            </Animated.View>
          </Animated.View>
          
          <Animated.Text 
            style={[
              styles.subtitle, 
              {
                opacity: subtitleAnim,
                transform: [
                  { translateX: subtitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })}
                ]
              }
            ]}
          >
            {subtitle}
          </Animated.Text>
          
          <Animated.View style={[
            styles.brandingContainer,
            {
              opacity: subtitleAnim,
              transform: [
                { translateY: subtitleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0]
                })}
              ]
            }
          ]}>
            <Text style={styles.branding}>Ministerio de Cultura</Text>
            <Text style={styles.brandingSubtitle}>República de Panamá</Text>
          </Animated.View>
        </View>

        {/* Botones de acción */}
        {(onProfilePress || onLogoutPress) && (
          <Animated.View style={[
            styles.headerActions,
            {
              opacity: iconAnim,
              transform: [
                { scale: iconAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1]
                })}
              ]
            }
          ]}>
            {onProfilePress && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onProfilePress}
                activeOpacity={0.7}
              >
                <Ionicons name="person-circle" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
            
            {onLogoutPress && (
              <TouchableOpacity
                style={[styles.headerButton, styles.logoutButton]}
                onPress={onLogoutPress}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </View>
      
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: '100%',
    position: 'relative',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    marginRight: 16,
  },
  logoBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  iconContainer: {
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  brandingContainer: {
    marginTop: 4,
  },
  branding: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  brandingSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  divider: {
    height: 2,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 16,
    borderRadius: 1,
  },
});