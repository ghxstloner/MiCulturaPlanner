import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, DataTable } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useEventsStore } from '../../store/eventsStore';

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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="sync" size={48} color={colors.primary} />
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
      case 'en_curso':
        return colors.success;
      case 'programado':
        return colors.primary;
      case 'finalizado':
        return colors.greyMedium;
      case 'cancelado':
        return colors.error;
      default:
        return colors.greyMedium;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_curso':
        return 'En Curso';
      case 'programado':
        return 'Programado';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const colaboradoresActivos = currentPlanification?.tripulantes.filter(t => t.activo).length || 0;
  const colaboradoresInactivos = currentPlanification?.tripulantes.filter(t => !t.activo).length || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
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

              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.greyMedium }]}>
                    Creado
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {new Date(currentEvent.created_at).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Planification Card */}
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
                  <Chip 
                    style={{ backgroundColor: colors.success, marginRight: 8 }}
                    textStyle={{ color: 'white', fontSize: 12 }}
                    compact
                  >
                    {colaboradoresActivos} activos
                  </Chip>
                  {colaboradoresInactivos > 0 && (
                    <Chip 
                      style={{ backgroundColor: colors.error }}
                      textStyle={{ color: 'white', fontSize: 12 }}
                      compact
                    >
                      {colaboradoresInactivos} inactivos
                    </Chip>
                  )}
                </View>
              </View>

              {currentPlanification.tripulantes.length > 0 ? (
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Nombre</DataTable.Title>
                    <DataTable.Title>Crew ID</DataTable.Title>
                    <DataTable.Title>Estado</DataTable.Title>
                  </DataTable.Header>

                  {currentPlanification.tripulantes.map((colaborador) => (
                    <DataTable.Row key={colaborador.id_tripulante}>
                      <DataTable.Cell>
                        <Text style={{ color: colors.text }}>
                          {colaborador.nombres} {colaborador.apellidos}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text style={{ color: colors.text, fontFamily: 'monospace' }}>
                          {colaborador.crew_id}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Chip 
                          style={{ 
                            backgroundColor: colaborador.activo ? colors.success : colors.error 
                          }}
                          textStyle={{ color: 'white', fontSize: 10 }}
                          compact
                        >
                          {colaborador.activo ? 'Activo' : 'Inactivo'}
                        </Chip>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button 
            mode="outlined" 
            onPress={() => router.back()}
            style={styles.backButton}
            textColor={colors.primary}
          >
            Volver a Eventos
          </Button>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  actionButtons: {
    marginTop: 24,
    marginBottom: 40,
  },
  backButton: {
    borderRadius: 8,
  },
});