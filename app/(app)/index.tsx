import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Href, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useEventsStore } from '@/store/eventsStore';
import AttendanceModal from '../../components/attendance/AttendanceModal';
import CulturalHeader from '../../components/common/CulturalHeader';
import EventCard from '../../components/events/EventCard';
import UserProfileCard from '../../components/user/UserProfileCard';
import Colors from '../../constants/Colors';

// Global callback registry for camera interactions
if (typeof (global as any).onPhotoTakenCallback === 'undefined') {
  (global as any).onPhotoTakenCallback = {};
}
let callbackCounter = 0;

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  // Refs for animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Store hooks
  const { user, logout } = useAuthStore();
  const { 
    events, 
    currentEvent, 
    loading: eventsLoading, 
    loadEvents, 
    setCurrentEvent,
    validateLocation,
    simulateFacialRecognition,
    recordAttendance
  } = useEventsStore();

  // State
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [refreshing, setRefreshing] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);

  // Permissions hooks
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();

  // Start animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const showModal = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
     
    // Haptic feedback
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
     
    // Auto-hide modal after delay
    setTimeout(() => {
      setModalVisible(false);
    }, type === 'error' ? 3500 : 2000);
  }, []);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      "Cerrar Sesión", 
      "¿Está seguro que desea cerrar la sesión?", 
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí", 
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
            router.replace('/(auth)/login' as Href);
          }, 
          style: "destructive" 
        }
      ]
    );
  }, [logout]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const handleMarkAttendance = async (eventId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Check permissions first
    if (!await checkRequiredPermissions()) return;

    // Set current event
    setCurrentEvent(eventId);

    // Register callback for camera
    const callbackKey = `photoCallback_${callbackCounter++}`;
    (global as any).onPhotoTakenCallback[callbackKey] = onPhotoTaken;

    // Navigate to camera screen
    router.push(`/(app)/camera?eventId=${eventId}&onPhotoTakenCallbackKey=${callbackKey}` as Href);
  };

  const onPhotoTaken = async (photo: { uri: string }) => {
    console.log("Foto recibida:", photo.uri);
    setLoading(true);
    
    try {
      if (!currentEvent) {
        throw new Error("No hay evento seleccionado");
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Validate location
      const locationValidation = await validateLocation(currentEvent.id, location);
      
      if (!locationValidation.isValid) {
        showModal(locationValidation.message, 'error');
        setLoading(false);
        return;
      }

      // Simulate facial recognition
      const faceResult = await simulateFacialRecognition(photo.uri);
      
      if (!faceResult.success) {
        showModal(faceResult.message, 'error');
        setLoading(false);
        return;
      }

      // Record attendance
      const success = await recordAttendance(currentEvent.id, photo.uri, location);
      
      if (success) {
        showModal(`¡Asistencia registrada exitosamente!\n${locationValidation.message}`, 'success');
      } else {
        throw new Error("No se pudo registrar la asistencia");
      }

    } catch (error: any) {
      console.error("Error processing attendance:", error);
      showModal(error.message || "Ocurrió un error al procesar la asistencia.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkRequiredPermissions = async (): Promise<boolean> => {
    // Check camera permissions
    let camPermission = cameraPermission;
    if (!camPermission?.granted) {
      camPermission = await requestCameraPermission();
    }
    if (!camPermission?.granted) {
      Alert.alert("Permiso Requerido", "Se necesita acceso a la cámara para el reconocimiento facial.");
      return false;
    }

    // Check location permissions
    let locPermission = locationPermission;
    if (!locPermission?.granted) {
      locPermission = await requestLocationPermission();
    }
    if (!locPermission?.granted) {
      Alert.alert("Permiso Requerido", "Se necesita acceso a la ubicación para validar la asistencia.");
      return false;
    }

    return true;
  };

  const toggleUserCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowUserCard(!showUserCard);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <Animated.View style={[
        styles.headerContainer,
        { opacity: fadeAnim }
      ]}>
        <CulturalHeader 
          title="MinCultura Check"
          subtitle="Asistencia a Eventos Culturales"
          onProfilePress={toggleUserCard}
          onLogoutPress={handleLogout}
        />
      </Animated.View>

      {/* User Profile Card Overlay */}
      {showUserCard && (
        <Animated.View style={[
          styles.userCardOverlay,
          { backgroundColor: colorScheme === 'dark' ? 'rgba(15, 20, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)' }
        ]}>
          <BlurView intensity={20} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
          <SafeAreaView style={styles.userCardSafeArea} edges={['top', 'bottom']}>
            <ScrollView 
              contentContainerStyle={styles.userCardScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <UserProfileCard user={user} onClose={() => setShowUserCard(false)} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      )}
      
      {/* Main Content */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>{events.length}</Text>
              <Text style={[styles.statLabel, { color: colors.greyMedium }]}>Eventos Activos</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.greyMedium }]}>Asistencias</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="location" size={24} color={colors.secondary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>GPS</Text>
              <Text style={[styles.statLabel, { color: colors.greyMedium }]}>Ubicación</Text>
            </View>
          </View>

          {/* Events Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Eventos Disponibles
            </Text>
            
            {eventsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.greyMedium }]}>
                  Cargando eventos...
                </Text>
              </View>
            ) : events.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={colors.greyMedium} />
                <Text style={[styles.emptyText, { color: colors.greyMedium }]}>
                  No hay eventos programados
                </Text>
              </View>
            ) : (
              events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onMarkAttendance={handleMarkAttendance}
                  loading={loading && currentEvent?.id === event.id}
                />
              ))
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Status Modal */}
      <Portal>
        <AttendanceModal 
          visible={modalVisible}
          message={modalMessage}
          type={modalType}
          onDismiss={() => setModalVisible(false)}
        />
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
  },
  userCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  userCardSafeArea: {
    flex: 1,
    padding: 20,
  },
  userCardScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});