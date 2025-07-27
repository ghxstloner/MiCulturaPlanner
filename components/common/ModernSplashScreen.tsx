import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';


interface ModernSplashScreenProps {
  onAnimationComplete?: () => void;
  isLoading?: boolean;
}

// Componente inspirado en la bandera de Panamá
const PanamaFlagAnimation = React.memo(() => {
  const redBlock = useRef(new Animated.Value(0)).current;
  const blueBlock = useRef(new Animated.Value(0)).current;
  const whiteBlocks = useRef(Array.from({ length: 2 }, () => new Animated.Value(0))).current;
  
  useEffect(() => {
    // Animación secuencial de los bloques de colores de la bandera
    Animated.sequence([
      // Aparecen los bloques blancos
      Animated.stagger(200, whiteBlocks.map(block => 
        Animated.timing(block, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      )),
      // Aparece el bloque azul
      Animated.timing(blueBlock, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Aparece el bloque rojo
      Animated.timing(redBlock, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [redBlock, blueBlock, whiteBlocks]);

  return (
    <View style={styles.flagContainer}>
      {/* Bloque blanco superior izquierdo */}
      <Animated.View
        style={[
          styles.flagBlock,
          styles.topLeft,
          {
            backgroundColor: '#FFFFFF',
            opacity: whiteBlocks[0],
            transform: [{
              scale: whiteBlocks[0].interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }]
          }
        ]}
      />
      
      {/* Bloque azul superior derecho */}
      <Animated.View
        style={[
          styles.flagBlock,
          styles.topRight,
          {
            backgroundColor: '#005293',
            opacity: blueBlock,
            transform: [{
              scale: blueBlock.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }]
          }
        ]}
      />
      
      {/* Bloque rojo inferior izquierdo */}
      <Animated.View
        style={[
          styles.flagBlock,
          styles.bottomLeft,
          {
            backgroundColor: '#d21033',
            opacity: redBlock,
            transform: [{
              scale: redBlock.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }]
          }
        ]}
      />
      
      {/* Bloque blanco inferior derecho */}
      <Animated.View
        style={[
          styles.flagBlock,
          styles.bottomRight,
          {
            backgroundColor: '#FFFFFF',
            opacity: whiteBlocks[1],
            transform: [{
              scale: whiteBlocks[1].interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }]
          }
        ]}
      />
    </View>
  );
});

PanamaFlagAnimation.displayName = 'PanamaFlagAnimation';

// Indicador de carga minimalista
const MinimalLoadingIndicator = React.memo(() => {
  const dots = useRef(Array.from({ length: 3 }, () => new Animated.Value(0))).current;
  
  useEffect(() => {
    const animate = () => {
      Animated.stagger(200, dots.map(dot => 
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      )).start(() => animate());
    };
    animate();
  }, [dots]);

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.dotsContainer}>
        {dots.map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: dot,
                transform: [{
                  scale: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  })
                }]
              }
            ]}
          />
        ))}
      </View>
      <Text style={styles.loadingText}>Iniciando MiCultura</Text>
    </View>
  );
});

MinimalLoadingIndicator.displayName = 'MinimalLoadingIndicator';

export default function ModernSplashScreen({ onAnimationComplete, isLoading = true }: ModernSplashScreenProps) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  
  const handleAnimationComplete = useCallback(() => {
    if (onAnimationComplete) {
      setTimeout(onAnimationComplete, 500);
    }
  }, [onAnimationComplete]);

  useEffect(() => {
    Animated.sequence([
      // Fade in inicial
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Título aparece
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Subtítulo aparece
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      handleAnimationComplete();
    });
  }, [fadeIn, titleAnim, subtitleAnim, handleAnimationComplete]);

  return (
    <View style={styles.container}>
      {/* Animación de la bandera de Panamá */}
      <Animated.View style={[styles.flagAnimationContainer, { opacity: fadeIn }]}>
        <PanamaFlagAnimation />
      </Animated.View>
      
      {/* Contenido central */}
      <View style={styles.contentContainer}>
        <Animated.Text 
          style={[
            styles.title,
            {
              opacity: titleAnim,
              transform: [{
                translateY: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              }]
            }
          ]}
        >
          MiCultura
        </Animated.Text>
        
        <Animated.View 
          style={[
            styles.subtitleContainer,
            {
              opacity: subtitleAnim,
              transform: [{
                translateY: subtitleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }
          ]}
        >
          <Text style={styles.subtitle}>Sistema de Asistencia</Text>
          <Text style={styles.brandText}>Ministerio de Cultura</Text>
          <Text style={styles.countryText}>República de Panamá</Text>
        </Animated.View>
        
        {isLoading && (
          <Animated.View style={[styles.loadingSection, { opacity: subtitleAnim }]}>
            <MinimalLoadingIndicator />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8', // background_light del design system
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagAnimationContainer: {
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
  },
  flagContainer: {
    width: 120,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  flagBlock: {
    position: 'absolute',
    width: 60,
    height: 40,
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
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#005293', // primary_blue
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 18,
    color: '#718096', // text_secondary_light
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 12,
  },
  brandText: {
    fontSize: 16,
    color: '#1A202C', // text_primary_light
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  countryText: {
    fontSize: 14,
    color: '#A0AEC0', // greyMedium
    textAlign: 'center',
    fontWeight: '400',
  },
  loadingSection: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#005293', // primary_blue
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#718096', // text_secondary_light
    fontWeight: '500',
  },
});