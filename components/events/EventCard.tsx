import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Event } from '../../types/api';

interface EventCardProps {
  event: Event;
  onMarkAttendance: (eventId: number) => void;
  onViewDetails: (eventId: number) => void;
  loading?: boolean;
}

export default function EventCard({ 
  event, 
  onMarkAttendance, 
  onViewDetails, 
  loading = false 
}: EventCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const eventStartDate = new Date(event.fecha_inicio);
  const eventEndDate = new Date(event.fecha_fin);
  const now = new Date();
  const isToday = eventStartDate.toDateString() === now.toDateString();
  const isActive = now >= eventStartDate && now <= eventEndDate;
  const isPast = now > eventEndDate;
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday) return 'Hoy';
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
    
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
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

  const canMarkAttendance = event.estado === 'en_curso' || (event.estado === 'programado' && isActive);
  const cardOpacity = isPast ? 0.8 : 1;

  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: colors.surface,
        opacity: cardOpacity,
        borderLeftWidth: isActive ? 4 : 0,
        borderLeftColor: isActive ? colors.success : 'transparent',
        borderColor: colors.border
      }
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
            {event.nombre}
          </Text>
          {event.organizador && (
            <Text style={[styles.organizador, { color: colors.textSecondary }]}>
              Por: {event.organizador}
            </Text>
          )}
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(event.estado) }
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(event.estado)}
            </Text>
          </View>
          {isActive && (
            <View style={[styles.liveIndicator, { backgroundColor: colors.success }]}>
              <View style={styles.pulseIndicator} />
              <Text style={styles.liveText}>EN VIVO</Text>
            </View>
          )}
        </View>
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeItem}>
          <Ionicons 
            name={isToday ? "today" : "calendar-outline"} 
            size={18} 
            color={isToday ? colors.primaryRed : colors.primary} 
          />
          <Text style={[
            styles.dateText, 
            { 
              color: isToday ? colors.primaryRed : colors.text,
              fontWeight: isToday ? '600' : '500'
            }
          ]}>
            {formatDate(event.fecha_inicio)}
          </Text>
        </View>
        
        <View style={styles.dateTimeItem}>
          <Ionicons name="time-outline" size={18} color={colors.greyMedium} />
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(event.fecha_inicio)} - {formatTime(event.fecha_fin)}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={16} color={colors.greyMedium} />
        <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
          {event.ubicacion}
        </Text>
      </View>

      {/* Description */}
      {event.descripcion && (
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {event.descripcion}
        </Text>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onViewDetails(event.id)}
          style={[styles.detailsButton, { borderColor: colors.border }]}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.detailsButtonText, { color: colors.primary }]}>
            Ver Detalles
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onMarkAttendance(event.id)}
          disabled={loading || !canMarkAttendance}
          style={[
            styles.attendanceButton,
            { 
              backgroundColor: canMarkAttendance 
                ? (isActive ? colors.success : colors.accent)
                : colors.greyMedium,
              opacity: loading ? 0.7 : 1
            }
          ]}
          activeOpacity={0.8}
        >
          {loading ? (
            <Text style={styles.attendanceButtonText}>Procesando...</Text>
          ) : (
            <>
              <Ionicons 
                name={canMarkAttendance ? "camera" : "ban-outline"} 
                size={16} 
                color="#FFFFFF" 
              />
              <Text style={styles.attendanceButtonText}>
                {canMarkAttendance 
                  ? (isActive ? 'Marcar Ahora' : 'Marcar Asistencia')
                  : 'No Disponible'
                }
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 24,
  },
  organizador: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  pulseIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 16,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  attendanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#005293',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attendanceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});