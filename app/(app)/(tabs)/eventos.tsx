import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Href, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import AttendanceModal from '@/components/attendance/AttendanceModal';
import CulturalHeader from '@/components/common/CulturalHeader';
import EventCard from '@/components/events/EventCard';
import EventFilters from '@/components/events/EventFilters';
import UserProfileCard from '@/components/user/UserProfileCard';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { eventsService } from '@/services/eventsService';
import { useAuthStore } from '@/store/authStore';
import { useEventsStore } from '@/store/eventsStore';
import { Event } from '@/types/api';

// Global callback registry for camera interactions
if (typeof (global as any).onPhotoTakenCallback === 'undefined') {
  (global as any).onPhotoTakenCallback = {};
}
let callbackCounter = 0;

export default function EventosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  // Refs for animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Store hooks
  const { user, logout } = useAuthStore();
    const {
    events, 
    loading: eventsLoading, 
    error: eventsError,
    hasMoreEvents,
    loadEvents,
    loadMoreEvents,
    markAttendance,
    clearError,
    setFilter
  } = useEventsStore();

  // Local state
  const [loading, setLoading] = useState(false);
  const [processingEventId, setProcessingEventId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [refreshing, setRefreshing] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'presente' | 'futuro' | 'pasado'>('todos');
  const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0);
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  // Permissions hooks
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

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

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Update stats when events change or filter changes
  useEffect(() => {
    setStatsUpdateTrigger(prev => prev + 1);
  }, [events, selectedFilter]);

  // Cargar todos los eventos para las estadísticas
  useEffect(() => {
    const loadAllEventsForStats = async () => {
      try {
        // Cargar todos los eventos sin filtro para las estadísticas usando el servicio
        const response = await eventsService.getEvents(false, undefined, 0, 100);
        if (response.success && response.data) {
          const eventsMapped = response.data.map((evento: any) => {
            const fechaEvento = evento.fecha_evento || new Date().toISOString().split('T')[0];
            const horaInicio = evento.hora_inicio || '08:00:00';
            const horaFin = evento.hora_fin || '17:00:00';
            const estatus = evento.estatus ?? 0;
            const estado = estatus === 1 ? 'activo' : 'inactivo';
            
            return {
              id: evento.id_evento,
              nombre: evento.descripcion_evento || `Evento ${evento.id_evento}`,
              descripcion: evento.descripcion_evento || undefined,
              fecha_inicio: `${fechaEvento}T${horaInicio}`,
              fecha_fin: `${fechaEvento}T${horaFin}`,
              ubicacion: evento.descripcion_lugar || 'Ubicación no especificada',
              organizador: evento.descripcion_departamento || undefined,
              pais: evento.pais_nombre || undefined,
              estado: estado as 'activo' | 'inactivo',
              estatus: estatus,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          });
          setAllEvents(eventsMapped);
        }
      } catch (error) {
        console.error('Error loading all events for stats:', error);
      }
    };
    
    loadAllEventsForStats();
  }, []);

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
    }, type === 'error' ? 4000 : 2500);
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
            try {
              await logout();
              router.replace('/(auth)/login' as Href);
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }, 
          style: "destructive" 
        }
      ]
    );
  }, [logout]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const filterParam = selectedFilter === 'todos' ? undefined : selectedFilter;
      await loadEvents(filterParam, true);
      setStatsUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadEvents, selectedFilter]);

  const handleMarkAttendance = async (eventId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Check permissions first
    if (!await checkRequiredPermissions()) return;

    // Set processing state for this specific event
    setProcessingEventId(eventId);

    // Register callback for camera
    const callbackKey = `photoCallback_${callbackCounter++}`;
    (global as any).onPhotoTakenCallback[callbackKey] = (photo: { uri: string }) => 
      onPhotoTaken(photo, eventId);

    // Navigate to camera screen
    router.push(`/(app)/camera?eventId=${eventId}&onPhotoTakenCallbackKey=${callbackKey}` as Href);
  };

  const handleViewDetails = async (eventId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate immediately - let the details page handle loading with animations
    router.push(`/(app)/event-details?eventId=${eventId}` as Href);
  };

  const onPhotoTaken = async (photo: { uri: string }, eventId: number) => {
    setLoading(true);
    
    try {
      // Mark attendance using real API
      const result = await markAttendance(eventId, photo.uri);
      
      if (result.success) {
        let successMessage = '';
        
        // Mensajes específicos según el caso
        if (result.tripulante_info) {
          const { nombres, crew_id } = result.tripulante_info;
          const nombreCompleto = `${nombres}`;
          
          // Si es primera marcación (inicio)
          if (result.marcacion_info?.tipo_marcacion === 'Entrada') {
            const horaInicio = result.marcacion_info.hora || 'hora no especificada';
            successMessage = `Marcación a la hora de inicio del evento ${horaInicio}.\n\n${nombreCompleto} (${crew_id})`;
          } 
          // Si es segunda marcación (finalización)
          else if (result.marcacion_info?.tipo_marcacion === 'Salida') {
            successMessage = `Marcación de salida del evento.\n\n${nombreCompleto} (${crew_id})`;
          }
          // Marcación general exitosa
          else {
            successMessage = `¡Asistencia registrada exitosamente!\n\n${nombreCompleto} (${crew_id})`;
          }
          
          // Agregar confianza si está disponible
          if (result.matches_found && result.matches_found.length > 0) {
            const bestMatch = result.matches_found[0];
            successMessage += `\nConfianza: ${(bestMatch.confidence * 100).toFixed(1)}%`;
          }
        } else {
          successMessage = result.message || '¡Asistencia registrada exitosamente!';
        }
        
        showModal(successMessage, 'success');
        
        // Refresh events to get updated data and force stats update
        setTimeout(() => {
          loadEvents();
          setStatsUpdateTrigger(prev => prev + 1);
        }, 1000);
        
      } else {
        // Manejo de errores específicos
        let errorMessage = result.message || 'Error al registrar asistencia';
        
        // Mensajes específicos de error
        if (errorMessage.includes('Rostro no reconocido') || errorMessage.includes('No se detectó') || errorMessage.includes('reconocimiento insuficiente')) {
          errorMessage = 'Mejora la luz para acertar el reconocimiento facial.';
        } else if (errorMessage.includes('no está planificado') || errorMessage.includes('No Planificado')) {
          // Si tenemos info del tripulante pero no está planificado
          if (result.tripulante_info) {
            const { nombres, apellidos, crew_id } = result.tripulante_info;
            errorMessage = `El colaborador ${nombres} ${apellidos} con la posición ${crew_id} no está planificado para este evento.`;
          } else {
            errorMessage = 'El colaborador reconocido no está planificado para este evento.';
          }
        }
        
        showModal(errorMessage, 'error');
      }

    } catch (error: any) {
      console.error("Error processing attendance:", error);
      
      let errorMessage = "Ocurrió un error al procesar la asistencia.";
      
      // Errores específicos de red/servidor
      if (error.message.includes('HTTP 422')) {
        errorMessage = "Datos inválidos. Verifique la información del evento.";
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = "Error del servidor. Intente nuevamente en unos momentos.";
      } else if (error.message.includes('HTTP 401')) {
        errorMessage = "Sesión expirada. Por favor, inicie sesión nuevamente.";
      } else if (error.message.includes('HTTP 404')) {
        errorMessage = "Mejora la luz para acertar el reconocimiento facial.";
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = "Error de conexión. Verifique su conexión a internet.";
      }
      
      showModal(errorMessage, 'error');
    } finally {
      setLoading(false);
      setProcessingEventId(null);
    }
  };

  const checkRequiredPermissions = async (): Promise<boolean> => {
    // Check camera permissions
    let camPermission = cameraPermission;
    if (!camPermission?.granted) {
      camPermission = await requestCameraPermission();
    }
    if (!camPermission?.granted) {
      Alert.alert(
        "Permiso Requerido", 
        "Se necesita acceso a la cámara para el reconocimiento facial.",
        [
          { text: "Entendido", style: "default" }
        ]
      );
      return false;
    }

    return true;
  };

  const toggleUserCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowUserCard(!showUserCard);
  };

  const handleFilterChange = (filter: typeof selectedFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filter);
    const filterParam = filter === 'todos' ? null : filter;
    setFilter(filterParam);
  };

  const handleLoadMore = useCallback(() => {
    if (hasMoreEvents && !eventsLoading) {
      loadMoreEvents();
    }
  }, [hasMoreEvents, eventsLoading, loadMoreEvents]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    
    if (isCloseToBottom) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Función para calcular eventos de hoy de manera más robusta
  const getTodayEventsCount = useCallback(() => {
    const today = getLocalDateString();
    const eventsForStats = allEvents.length > 0 ? allEvents : events;
    const todayEvents = eventsForStats.filter(event => {
      const eventDate = event.fecha_inicio.split('T')[0];
      return eventDate === today && event.estado === 'activo';
    });
    
    return todayEvents.length;
  }, [allEvents, events]);

  // Función para calcular eventos activos
  const getActiveEventsCount = useCallback(() => {
    const eventsForStats = allEvents.length > 0 ? allEvents : events;
    const activeEvents = eventsForStats.filter(event => event.estado === 'activo');
    return activeEvents.length;
  }, [allEvents, events]);

  // Show loading overlay when processing photo
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        
        <View style={styles.loadingOverlay}>
          <Ionicons name="camera" size={64} color={colors.primary} />
          <Text style={[styles.loadingTitle, { color: colors.text }]}>
            Procesando Asistencia
          </Text>
          <Text style={[styles.loadingText, { color: colors.greyMedium }]}>
            Analizando reconocimiento facial...
          </Text>
          <Text style={[styles.loadingSubtext, { color: colors.greyMedium }]}>
            Por favor espere
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if there's a persistent error
  if (eventsError && !eventsLoading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Error de Conexión
          </Text>
          <Text style={[styles.errorText, { color: colors.greyMedium }]}>
            {eventsError}
          </Text>
          <View style={styles.errorActions}>
            <Text style={[styles.errorHelp, { color: colors.greyMedium }]}>
              • Verifique su conexión a internet{'\n'}
              • Asegúrese de que el servidor esté funcionando{'\n'}
              • Intente nuevamente en unos momentos
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <Animated.View style={[
        styles.headerContainer,
        { opacity: fadeAnim }
      ]}>
        <CulturalHeader 
          title="MiCultura Planner"
          subtitle="Sistema de Asistencia a Eventos"
          onProfilePress={toggleUserCard}
          onLogoutPress={handleLogout}
        />
      </Animated.View>

      {/* User Profile Card Overlay */}
      {showUserCard && (
        <Animated.View style={[
          styles.userCardOverlay,
          { backgroundColor: 'rgba(255, 255, 255, 0.95)' }
        ]}>
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />
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
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              title="Actualizando eventos..."
              titleColor={colors.greyMedium}
            />
          }
        >
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>{events.length}</Text>
              <Text style={[styles.statLabel, { color: colors.greyMedium }]}>Total Eventos</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {getActiveEventsCount()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.greyMedium }]}>Activos</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/(app)/marcaciones' as Href)}
            >
              <Ionicons name="today" size={24} color={colors.warning} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {getTodayEventsCount()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.greyMedium }]}>Hoy</Text>
            </TouchableOpacity>
          </View>

          {/* Events Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Eventos Disponibles
            </Text>
            
            {/* Event Filters */}
            <EventFilters
              selectedFilter={selectedFilter}
              onFilterChange={handleFilterChange}
              events={events}
              animationValue={fadeAnim}
            />
            
            {eventsLoading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="sync" size={32} color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.greyMedium }]}>
                  Cargando eventos desde el servidor...
                </Text>
              </View>
            ) : events.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={colors.greyMedium} />
                <Text style={[styles.emptyText, { color: colors.greyMedium }]}>
                  No hay eventos disponibles
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.greyMedium }]}>
                  Desliza hacia abajo para actualizar
                </Text>
              </View>
            ) : (
              <>
                {events.map((event: Event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onMarkAttendance={handleMarkAttendance}
                    onViewDetails={handleViewDetails}
                    loading={processingEventId === event.id}
                  />
                ))}
                
                {/* Load More Indicator */}
                {hasMoreEvents && (
                  <View style={styles.loadMoreContainer}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.greyMedium} />
                    <Text style={[styles.loadMoreText, { color: colors.greyMedium }]}>
                      Desliza para cargar más eventos
                    </Text>
                  </View>
                )}
                
                {eventsLoading && events.length > 0 && (
                  <View style={styles.loadMoreContainer}>
                    <Ionicons name="sync" size={24} color={colors.primary} />
                    <Text style={[styles.loadMoreText, { color: colors.greyMedium }]}>
                      Cargando más eventos...
                    </Text>
                  </View>
                )}
              </>
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
    gap: 12,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorActions: {
    width: '100%',
    maxWidth: 300,
  },
  errorHelp: {
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
  },
  loadMoreContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});