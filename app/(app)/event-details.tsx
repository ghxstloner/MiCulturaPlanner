import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useEventsStore } from '../../store/eventsStore';

// Componente modal para mostrar imagen en grande
const ImageModal = ({ visible, imageSource, onClose }: { 
  visible: boolean; 
  imageSource: any; 
  onClose: () => void; 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { width, height } = Dimensions.get('window');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
        <TouchableOpacity 
          style={styles.modalCloseButton} 
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.modalContent}>
          <Image
            source={imageSource}
            style={[
              styles.modalImage,
              { 
                width: width * 0.9, 
                height: height * 0.7,
                maxWidth: 400,
                maxHeight: 600
              }
            ]}
            resizeMode="contain"
            onError={(error) => {
              console.warn('Error cargando imagen en modal:', error);
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

// Componente para mostrar cada colaborador como card
const ColaboradorCard = ({ colaborador }: { colaborador: any }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [imageModalVisible, setImageModalVisible] = useState(false);
  
  // ✅ MANEJO INTELIGENTE DE IMÁGENES
  const getImageSource = () => {
    if (colaborador.imagen && colaborador.imagen.trim() !== '') {
      // Imagen remota si existe
      return { 
        uri: `${process.env.EXPO_PUBLIC_IMAGE_URL}/${colaborador.crew_id}/${colaborador.imagen}` 
      };
    } else {
      // Imagen local por defecto
      return require('../../assets/images/default-avatar.png');
    }
  };

  // Verificar si tiene marcaciones registradas
  const tieneMarcaciones = colaborador.marcacion_entrada || colaborador.marcacion_salida;
  const tieneHorariosPlanificados = colaborador.hora_entrada || colaborador.hora_salida;

  return (
    <>
      <Card style={[styles.colaboradorCard, { backgroundColor: colors.surface }]}>
        <Card.Content style={styles.colaboradorContent}>
          <View style={styles.colaboradorHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => setImageModalVisible(true)}
              activeOpacity={0.7}
            >
              <Image
                source={getImageSource()}
                style={styles.avatar}
                // ✅ FALLBACK EN CASO DE ERROR
                onError={(error) => {
                  console.warn('Error cargando imagen:', error);
                }}
              />
              <View style={[
                styles.statusIndicator,
                { backgroundColor: colaborador.activo ? colors.success : colors.greyMedium }
              ]} />
            </TouchableOpacity>
            
            <View style={styles.colaboradorInfo}>
              <Text style={[styles.colaboradorNombre, { color: colors.text }]}>
                {colaborador.nombres} {colaborador.apellidos}
              </Text>
              <View style={styles.colaboradorMeta}>
                <View style={[styles.crewIdBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.crewIdText}>{colaborador.crew_id}</Text>
                </View>
                {colaborador.cedula && (
                  <Text style={[styles.cedulaText, { color: colors.greyMedium }]}>
                    Cédula: {colaborador.cedula}
                  </Text>
                )}
              </View>
              
              {colaborador.fecha_vuelo && (
                <View style={styles.fechaContainer}>
                  <Ionicons name="calendar-outline" size={14} color={colors.greyMedium} />
                  <Text style={[styles.fechaText, { color: colors.greyMedium }]}>
                    {new Date(colaborador.fecha_vuelo).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              )}
            </View>

            {/* ✅ INDICADOR DE ESTADO DE PROCESADO */}
            <View style={styles.estadoBadgeContainer}>
              {colaborador.procesado === 1 ? (
                <View style={[styles.estadoBadge, { backgroundColor: colors.success }]}>
                  <Ionicons name="checkmark-circle" size={12} color="white" />
                  <Text style={styles.estadoBadgeText}>Completo</Text>
                </View>
              ) : (
                <View style={[styles.estadoBadge, { backgroundColor: colors.warning }]}>
                  <Ionicons name="time-outline" size={12} color="white" />
                  <Text style={styles.estadoBadgeText}>Pendiente</Text>
                </View>
              )}
            </View>
          </View>

          {/* ✅ MOSTRAR MARCACIONES REALES CON PRIORIDAD */}
          {tieneMarcaciones && (
            <View style={styles.marcacionesContainer}>
              <View style={styles.seccionHeader}>
                <Ionicons name="finger-print" size={16} color={colors.success} />
                <Text style={[styles.seccionTitulo, { color: colors.success }]}>
                  Marcaciones Registradas
                </Text>
              </View>
              
              <View style={styles.marcacionesGrid}>
                {colaborador.marcacion_entrada && (
                  <View style={styles.marcacionItem}>
                    <View style={[styles.marcacionIcono, { backgroundColor: colors.success }]}>
                      <Ionicons name="log-in" size={12} color="white" />
                    </View>
                    <View style={styles.marcacionTexto}>
                      <Text style={[styles.marcacionTipo, { color: colors.success }]}>
                        Entrada
                      </Text>
                      <Text style={[styles.marcacionHora, { color: colors.text }]}>
                        {colaborador.marcacion_entrada}
                      </Text>
                    </View>
                  </View>
                )}
                
                {colaborador.marcacion_salida && (
                  <View style={styles.marcacionItem}>
                    <View style={[styles.marcacionIcono, { backgroundColor: colors.warning }]}>
                      <Ionicons name="log-out" size={12} color="white" />
                    </View>
                    <View style={styles.marcacionTexto}>
                      <Text style={[styles.marcacionTipo, { color: colors.warning }]}>
                        Salida
                      </Text>
                      <Text style={[styles.marcacionHora, { color: colors.text }]}>
                        {colaborador.marcacion_salida}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
          
          {/* ✅ MOSTRAR HORAS PLANIFICADAS SOLO SI NO HAY MARCACIONES */}
          {!tieneMarcaciones && tieneHorariosPlanificados && (
            <View style={styles.planificadosContainer}>
              <View style={styles.seccionHeader}>
                <Ionicons name="calendar-outline" size={16} color={colors.greyMedium} />
                <Text style={[styles.seccionTitulo, { color: colors.greyMedium }]}>
                  Horario Planificado
                </Text>
              </View>
              
              <View style={styles.planificadosGrid}>
                {colaborador.hora_entrada && (
                  <View style={styles.planificadoItem}>
                    <Ionicons name="time-outline" size={14} color={colors.greyMedium} />
                    <Text style={[styles.planificadoTexto, { color: colors.greyMedium }]}>
                      Entrada: {colaborador.hora_entrada}
                    </Text>
                  </View>
                )}
                
                {colaborador.hora_salida && (
                  <View style={styles.planificadoItem}>
                    <Ionicons name="time-outline" size={14} color={colors.greyMedium} />
                    <Text style={[styles.planificadoTexto, { color: colors.greyMedium }]}>
                      Salida: {colaborador.hora_salida}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ✅ MENSAJE CUANDO NO HAY INFORMACIÓN DE HORARIOS */}
          {!tieneMarcaciones && !tieneHorariosPlanificados && (
            <View style={styles.sinInformacionContainer}>
              <Ionicons name="information-circle-outline" size={16} color={colors.greyMedium} />
              <Text style={[styles.sinInformacionTexto, { color: colors.greyMedium }]}>
                Sin información de horarios
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Modal para mostrar imagen en grande */}
      <ImageModal
        visible={imageModalVisible}
        imageSource={getImageSource()}
        onClose={() => setImageModalVisible(false)}
      />
    </>
  );
};



export default function EventDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  
  const { 
    currentEvent, 
    currentPlanification, 
    loading, 
    error,
    loadEventDetail,
    loadEventPlanification,
    clearError
  } = useEventsStore();

  useEffect(() => {
    if (eventId) {
      const id = parseInt(eventId);
      loadEventDetail(id);
      loadEventPlanification(id);
    }
  }, [eventId, loadEventDetail, loadEventPlanification]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando detalles del evento...
          </Text>
          <Text style={[styles.loadingSubtext, { color: colors.greyMedium }]}>
            Obteniendo información completa
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Error al Cargar Evento
          </Text>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <View style={styles.errorActions}>
            <Button 
              mode="outlined" 
              onPress={() => router.back()}
              style={{ marginBottom: 12 }}
              textColor={colors.primary}
            >
              Volver
            </Button>
            <Button 
              mode="contained" 
              onPress={() => {
                if (eventId) {
                  const id = parseInt(eventId);
                  loadEventDetail(id);
                  loadEventPlanification(id);
                }
              }}
              buttonColor={colors.primary}
            >
              Reintentar
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentEvent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={48} color={colors.greyMedium} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Evento No Encontrado
          </Text>
          <Text style={[styles.errorText, { color: colors.greyMedium }]}>
            No se pudo cargar la información del evento solicitado
          </Text>
          <Button 
            mode="contained" 
            onPress={() => router.back()}
            buttonColor={colors.primary}
          >
            Volver
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return colors.success;
      case 'inactivo':
        return colors.greyMedium;
      default:
        return colors.greyMedium;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'inactivo':
        return 'Inactivo';
      default:
        return status;
    }
  };

  const colaboradoresActivos = currentPlanification?.tripulantes.filter(t => t.activo).length || 0;
  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header fijo con safe area */}
      <View style={[styles.headerContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Button
            mode="text"
            onPress={() => router.back()}
            icon="arrow-left"
            textColor={colors.primary}
            compact
          >
            Volver
          </Button>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Detalles del Evento
          </Text>
          <View style={{ width: 80 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Event Info Card */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {currentEvent.nombre}
              </Text>
              <Chip 
                style={[styles.statusChip, { backgroundColor: getStatusColor(currentEvent.estado) }]}
                textStyle={{ color: 'white', fontWeight: 'bold' }}
              >
                {getStatusText(currentEvent.estado)}
              </Chip>
            </View>
            
            {currentEvent.descripcion && (
              <Text style={[styles.description, { color: colors.greyMedium }]}>
                {currentEvent.descripcion}
              </Text>
            )}

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.greyMedium }]}>
                    Fecha de Inicio
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {new Date(currentEvent.fecha_inicio).toLocaleString('es-ES')}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.greyMedium }]}>
                    Fecha de Fin
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {new Date(currentEvent.fecha_fin).toLocaleString('es-ES')}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.greyMedium }]}>
                    Ubicación
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {currentEvent.ubicacion}
                  </Text>
                </View>
              </View>

              {currentEvent.organizador && (
                <View style={styles.infoItem}>
                  <Ionicons name="person" size={20} color={colors.primary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: colors.greyMedium }]}>
                      Organizador
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {currentEvent.organizador}
                    </Text>
                  </View>
                </View>
              )}

              {currentEvent.pais && (
                <View style={styles.infoItem}>
                  <Ionicons name="flag" size={20} color={colors.primary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: colors.greyMedium }]}>
                      País
                    </Text>
                    <View style={styles.paisContainer}>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {currentEvent.pais}
                      </Text>
                      {currentEvent.pais?.toLowerCase().includes('panamá') || currentEvent.pais?.toLowerCase().includes('panama') ? (
                        <View style={styles.estrellasPanama}>
                          <Text style={styles.estrella}>⭐</Text>
                          <Text style={styles.estrella}>⭐</Text>
                          <Text style={styles.estrella}>⭐</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Estadísticas de Marcaciones */}
        {currentPlanification && (
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.statsHeader}>
                <Ionicons name="stats-chart" size={20} color={colors.primary} />
                <Text style={[styles.statsTitle, { color: colors.text }]}>
                  Estadísticas de Asistencia
                </Text>
              </View>
              
                            <View style={styles.statsGrid}>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: colors.primary }]}>
                      <Ionicons name="people" size={16} color="white" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {currentPlanification.total_asignados}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.greyMedium }]}>
                        Total Asignados
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: colors.success }]}>
                      <Ionicons name="checkmark-circle" size={16} color="white" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {currentPlanification.tripulantes.filter(t => t.procesado === 1).length}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.greyMedium }]}>
                        Completados
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: colors.warning }]}>
                      <Ionicons name="time" size={16} color="white" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {currentPlanification.tripulantes.filter(t => t.procesado !== 1).length}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.greyMedium }]}>
                        Pendientes
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: colors.primary }]}>
                      <Ionicons name="finger-print" size={16} color="white" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {currentPlanification.tripulantes.filter(t => t.marcacion_entrada || t.marcacion_salida).length}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.greyMedium }]}>
                        Con Marcaciones
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Colaboradores Card - Ahora como grid de cards */}
        {currentPlanification ? (
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.planificationHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Colaboradores Asignados
                </Text>
                <View style={styles.statsChips}>
                  <Chip 
                    style={{ backgroundColor: colors.primary, marginRight: 8 }}
                    textStyle={{ color: 'white', fontSize: 12 }}
                    compact
                  >
                    {currentPlanification.total_asignados} total
                  </Chip>
                  {colaboradoresActivos > 0 && (
                    <Chip 
                      style={{ backgroundColor: colors.success }}
                      textStyle={{ color: 'white', fontSize: 12 }}
                      compact
                    >
                      {colaboradoresActivos} activos
                    </Chip>
                  )}
                </View>
              </View>

              {currentPlanification.tripulantes.length > 0 ? (
                <View style={styles.colaboradoresGrid}>
                  {currentPlanification.tripulantes.map((colaborador) => (
                    <ColaboradorCard
                      key={colaborador.id_tripulante}
                      colaborador={colaborador}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyColaboradores}>
                  <Ionicons name="people-outline" size={48} color={colors.greyMedium} />
                  <Text style={[styles.emptyText, { color: colors.greyMedium }]}>
                    No hay colaboradores asignados
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        ) : (
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.emptyColaboradores}>
                <Ionicons name="people-outline" size={48} color={colors.greyMedium} />
                <Text style={[styles.sectionTitle, { color: colors.text, textAlign: 'center' }]}>
                  Sin Planificación
                </Text>
                <Text style={[styles.emptyText, { color: colors.greyMedium }]}>
                  Este evento no tiene colaboradores asignados
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... estilos existentes mantener ...
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  loadingSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
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
    marginBottom: 24,
    lineHeight: 22,
  },
  errorActions: {
    width: '100%',
    maxWidth: 280,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  planificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyColaboradores: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  colaboradoresGrid: {
    gap: 12,
  },

  // ✅ ESTILOS PARA EL COMPONENTE COLABORADOR CARD
  colaboradorCard: {
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  colaboradorContent: {
    padding: 16,
  },
  colaboradorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  colaboradorInfo: {
    flex: 1,
  },
  colaboradorNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  colaboradorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  crewIdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  crewIdText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  cedulaText: {
    fontSize: 12,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fechaText: {
    fontSize: 12,
  },

  // ✅ NUEVOS ESTILOS PARA ESTADO DE PROCESADO
  estadoBadgeContainer: {
    alignItems: 'flex-end',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  estadoBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // ✅ ESTILOS PARA MARCACIONES REGISTRADAS
  marcacionesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  marcacionesGrid: {
    gap: 8,
  },
  marcacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
  },
  marcacionIcono: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marcacionTexto: {
    flex: 1,
  },
  marcacionTipo: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  marcacionHora: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'monospace',
  },

  // ✅ ESTILOS PARA HORARIOS PLANIFICADOS
  planificadosContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  planificadosGrid: {
    gap: 6,
  },
  planificadoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planificadoTexto: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ✅ ESTILOS PARA SIN INFORMACIÓN
  sinInformacionContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sinInformacionTexto: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // ✅ ESTILOS ADICIONALES EXISTENTES
  paisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  estrellasPanama: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  estrella: {
    fontSize: 16,
    marginLeft: 2,
  },

  // ✅ ESTILOS PARA EL MODAL DE IMAGEN
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  modalContent: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalImage: {
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // ✅ ESTILOS PARA ESTADÍSTICAS
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});