import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Get callback key from params
  const { onPhotoTakenCallbackKey } = useLocalSearchParams<{ 
    onPhotoTakenCallbackKey?: string;
  }>();
  
  // Get callback function from global registry
  const onPhotoTaken = onPhotoTakenCallbackKey 
    ? (global as any).onPhotoTakenCallback?.[onPhotoTakenCallbackKey] 
    : null;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Clean up callback when component unmounts
  useEffect(() => {
    return () => {
      if (onPhotoTakenCallbackKey && (global as any).onPhotoTakenCallback) {
        delete (global as any).onPhotoTakenCallback[onPhotoTakenCallbackKey];
      }
    };
  }, [onPhotoTakenCallbackKey]);

  // Pulse animation for capture button
  useEffect(() => {
    if (!isCapturing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isCapturing, pulseAnim]);

  const toggleCameraFacing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  const takePicture = useCallback(async () => {
    if (isCapturing) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsCapturing(true);
    
    if (cameraRef.current) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        // Process image
        const processedPhoto = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        if (onPhotoTaken) {
          onPhotoTaken(processedPhoto);
          router.back();
        } else {
          console.warn("Callback 'onPhotoTaken' no encontrado");
          Alert.alert("Error", "No se pudo procesar la foto.");
          router.back();
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "No se pudo capturar la foto.");
        setIsCapturing(false);
      }
    }
  }, [isCapturing, onPhotoTaken]);

  const handleGoBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, []);

  // Camera permission not granted yet
  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.permissionText, { color: colors.text }]}>
          Cargando cámara...
        </Text>
      </View>
    );
  }

  // Show permission request UI
  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#4A90D9', '#1B4D8C']}
          style={styles.permissionGradient}
        />
        
        <Ionicons name="camera-outline" size={80} color={colors.primary} />
        <Text style={[styles.permissionTitle, { color: colors.text }]}>
          Acceso a la Cámara
        </Text>
        <Text style={[styles.permissionText, { color: colors.greyMedium }]}>
          Necesitamos acceso a la cámara para el reconocimiento facial en eventos del Ministerio de Cultura
        </Text>
        <TouchableOpacity 
          style={[styles.permissionButton, { backgroundColor: colors.primary }]} 
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.permissionButton, styles.cancelButton, { backgroundColor: colors.error }]} 
          onPress={handleGoBack}
        >
          <Text style={styles.permissionButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <CameraView 
        style={styles.camera} 
        facing={facing} 
        ref={cameraRef} 
        mode="picture"
      />

      {/* Overlay with instructions */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']}
        style={styles.overlay}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top || 20 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.topBarTitle}>Reconocimiento Facial</Text>
        
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Face guide overlay */}
      <View style={styles.faceGuideContainer}>
        <View style={styles.faceGuide}>
          <View style={styles.faceGuideCorner} />
          <View style={[styles.faceGuideCorner, styles.topRight]} />
          <View style={[styles.faceGuideCorner, styles.bottomLeft]} />
          <View style={[styles.faceGuideCorner, styles.bottomRight]} />
        </View>
        <Text style={styles.instructionText}>
          Coloca tu rostro dentro del marco
        </Text>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 20 }]}>
        <View style={styles.bottomContent}>
          <View style={{ width: 60 }} />
          
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity 
              style={[
                styles.captureButton,
                isCapturing && styles.captureButtonDisabled
              ]} 
              onPress={takePicture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <Ionicons name="camera" size={40} color="white" />
              )}
            </TouchableOpacity>
          </Animated.View>
          
          <View style={{ width: 60 }} />
        </View>
        
        <Text style={styles.bottomInstructions}>
          Presiona el botón para capturar tu foto
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
  },
  topBarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  button: {
    padding: 8,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  faceGuideContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
    alignItems: 'center',
    zIndex: 5,
  },
  faceGuide: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  faceGuideCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#005293',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    top: 'auto',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    zIndex: 10,
  },
  bottomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(27, 77, 140, 0.9)',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.7)',
  },
  bottomInstructions: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 24,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#DC3545',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});