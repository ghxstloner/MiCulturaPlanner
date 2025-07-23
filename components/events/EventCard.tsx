import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip } from 'react-native-paper';
import Colors from '../../constants/Colors';
import { CulturalEvent, EVENT_CATEGORIES } from '../../constants/Events';
import { useColorScheme } from '../../hooks/useColorScheme';

interface EventCardProps {
  event: CulturalEvent;
  onMarkAttendance: (eventId: string) => void;
  loading?: boolean;
}

export default function EventCard({ event, onMarkAttendance, loading = false }: EventCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const category = EVENT_CATEGORIES[event.category];
  const eventDate = new Date(event.startDate);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

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

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
              {event.name}
            </Text>
            <Text style={[styles.organizador, { color: colors.greyMedium }]}>
              {event.organizador}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(event.status) }]}
              textStyle={styles.statusText}
              compact
            >
              {getStatusText(event.status)}
            </Chip>
          </View>
        </View>

        {/* Category and Location */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name={category.icon as any} size={16} color={category.color} />
            <Text style={[styles.infoText, { color: colors.greyMedium }]}>
              {category.label}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.greyMedium }]} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        </View>

        {/* Time and Date */}
        <View style={styles.timeContainer}>
          <View style={styles.timeItem}>
            <Ionicons name="calendar" size={16} color={colors.secondary} />
            <Text style={[styles.timeText, { color: colors.text }]}>
              {isToday ? 'Hoy' : eventDate.toLocaleDateString('es-ES')}
            </Text>
          </View>
          
          <View style={styles.timeItem}>
            <Ionicons name="time" size={16} color={colors.secondary} />
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.addressContainer}>
          <Ionicons name="map" size={16} color={colors.greyMedium} />
          <Text style={[styles.addressText, { color: colors.greyMedium }]} numberOfLines={2}>
            {event.address}
          </Text>
        </View>

        {/* Description */}
        {event.description && (
          <Text style={[styles.description, { color: colors.greyMedium }]} numberOfLines={2}>
            {event.description}
          </Text>
        )}
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => onMarkAttendance(event.id)}
          loading={loading}
          disabled={loading || event.status !== 'en_curso'}
          style={styles.attendanceButton}
          buttonColor={colors.primary}
          textColor="#FFFFFF"
          icon="camera"
        >
          {loading ? 'Procesando...' : 'Marcar Asistencia'}
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  organizador: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  attendanceButton: {
    borderRadius: 8,
    flex: 1,
  },
});