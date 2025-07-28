import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, Chip } from 'react-native-paper';

import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useMarcacionesStore } from '../../store/marcacionesStore';
import { Marcacion } from '../../types/api';

interface AttendanceListProps {
  showToday?: boolean;
  limit?: number;
}

export default function AttendanceList({ showToday = false, limit = 10 }: AttendanceListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const { 
    marcaciones, 
    loading, 
    error, 
    loadRecentMarcaciones, 
    loadTodayMarcaciones 
  } = useMarcacionesStore();

  useEffect(() => {
    if (showToday) {
      loadTodayMarcaciones();
    } else {
      loadRecentMarcaciones(limit);
    }
  }, [showToday, limit, loadRecentMarcaciones, loadTodayMarcaciones]);

  const renderMarcacion = ({ item }: { item: Marcacion }) => {
    const isEntrada = item.tipo.toLowerCase().includes('entrada');
    
    return (
      <Card style={[styles.marcacionCard, { backgroundColor: colors.surface }]}>
        <Card.Content style={styles.marcacionContent}>
          <View style={styles.marcacionHeader}>
            <View style={styles.tripulanteInfo}>
              <Text style={[styles.tripulanteNombre, { color: colors.text }]}>
                {item.nombres} {item.apellidos}
              </Text>
              <Text style={[styles.crewId, { color: colors.greyMedium }]}>
                No. Posición: {item.crew_id}
              </Text>
            </View>
            
            <Chip 
              style={[
                styles.tipoChip, 
                { backgroundColor: isEntrada ? colors.success : colors.secondary }
              ]}
              textStyle={{ color: '#FFFFFF', fontSize: 10 }}
              compact
            >
              {item.tipo}
            </Chip>
          </View>

          <View style={styles.marcacionDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {item.hora}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {new Date(item.fecha).toLocaleDateString('es-ES')}
              </Text>
            </View>
          </View>

          <View style={styles.eventoInfo}>
            <Ionicons name="location" size={16} color={colors.secondary} />
            <Text style={[styles.eventoText, { color: colors.greyMedium }]} numberOfLines={1}>
              {item.evento_nombre}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="sync" size={32} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.greyMedium }]}>
          Cargando marcaciones...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={32} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (marcaciones.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-outline" size={48} color={colors.greyMedium} />
        <Text style={[styles.emptyText, { color: colors.greyMedium }]}>
          {showToday ? 'No hay marcaciones hoy' : 'No hay marcaciones recientes'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={marcaciones}
      renderItem={renderMarcacion}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  marcacionCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  marcacionContent: {
    padding: 16,
  },
  marcacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripulanteInfo: {
    flex: 1,
  },
  tripulanteNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  crewId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  tipoChip: {
    alignSelf: 'flex-start',
  },
  marcacionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  eventoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventoText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});