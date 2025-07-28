import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const isActive = event.estado === 'activo';
  const isPast = now > eventEndDate;
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
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

  const getMarkingButtonStatus = () => {
    if (loading) {
      return {
        text: 'Cargando...',
        color: colors.greyMedium,
        icon: 'sync' as const,
        disabled: true
      };
    }

    if (!isActive) {
      return {
        text: 'Inactivo',
        color: colors.greyMedium,
        icon: 'ban-outline' as const,
        disabled: true
      };
    }

    if (isPast) {
      return {
        text: 'Finalizado',
        color: colors.greyMedium,
        icon: 'time-outline' as const,
        disabled: true
      };
    }

    if (!isToday) {
      return {
        text: 'No disponible',
        color: colors.greyMedium,
        icon: 'calendar-outline' as const,
        disabled: true
      };
    }

    return {
      text: 'Asistencia',
      color: colors.success,
      icon: 'camera' as const,
      disabled: false
    };
  };

  const cardOpacity = isPast ? 0.7 : 1;
  const buttonStatus = getMarkingButtonStatus();

  // Estilos dinámicos para sombras
  const cardShadowStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
  });

  const buttonShadowStyle = Platform.select({
    ios: {
      shadowColor: buttonStatus.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
      shadowColor: buttonStatus.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
  });

  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: colors.surface,
        opacity: cardOpacity,
        borderLeftWidth: isActive ? 3 : 0,
        borderLeftColor: isActive ? colors.success : 'transparent',
        borderColor: colors.border,
      },
      cardShadowStyle
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
          {isActive && !isPast && isToday && (
            <View style={[styles.liveIndicator, { backgroundColor: colors.primaryRed }]}>
              <View style={styles.pulseIndicator} />
              <Text style={styles.liveText}>HOY</Text>
            </View>
          )}
        </View>
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeItem}>
          <View style={[styles.iconContainer, { backgroundColor: isToday ? colors.primaryRed + '15' : colors.primary + '15' }]}>
            <Ionicons 
              name={isToday ? "today" : "calendar-outline"} 
              size={16} 
              color={isToday ? colors.primaryRed : colors.primary} 
            />
          </View>
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
          <View style={[styles.iconContainer, { backgroundColor: colors.greyMedium + '15' }]}>
            <Ionicons name="time-outline" size={16} color={colors.greyMedium} />
          </View>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(event.fecha_inicio)} - {formatTime(event.fecha_fin)}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.locationContainer}>
        <View style={[styles.iconContainer, { backgroundColor: colors.greyMedium + '15' }]}>
          <Ionicons name="location-outline" size={16} color={colors.greyMedium} />
        </View>
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
          style={[
            styles.detailsButton, 
            { 
              borderColor: colors.primary,
              backgroundColor: colors.primary + '08' 
            }
          ]}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={[styles.detailsButtonText, { color: colors.primary }]}>
            Detalles
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onMarkAttendance(event.id)}
          disabled={buttonStatus.disabled}
          style={[
            styles.attendanceButton,
            { 
              backgroundColor: buttonStatus.color,
              opacity: buttonStatus.disabled ? 0.6 : 1,
            },
            !buttonStatus.disabled && buttonShadowStyle
          ]}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={buttonStatus.icon} 
            size={18} 
            color="#FFFFFF" 
          />
          <Text style={styles.attendanceButtonText}>
            {buttonStatus.text}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginHorizontal: 4, // Para que las sombras se vean completas
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 24,
  },
  organizador: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
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
    gap: 12,
    marginBottom: 14,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 15,
    flex: 1,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
    minHeight: 48,
  },
  detailsButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  attendanceButton: {
    flex: 1.2, // Ligeramente más ancho para el texto
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12, // Menos padding horizontal
    borderRadius: 12,
    gap: 6,
    minHeight: 48,
  },
  attendanceButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});