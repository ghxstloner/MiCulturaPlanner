import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import CulturalHeader from '@/components/common/CulturalHeader';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { dashboardService, DashboardStats } from '@/services/dashboardService';
import { useAuthStore } from '@/store/authStore';
import { useEventsStore } from '@/store/eventsStore';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, logout } = useAuthStore();
  const { events } = useEventsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEventos: 0,
    eventosHoy: 0,
    eventosActivos: 0,
    totalAsistencias: 0,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const result = await dashboardService.getStats();
      if (result.success && result.data) {
        setDashboardStats(result.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback calculation from events
      const today = new Date().toISOString().split('T')[0];
      const eventosHoy = events.filter(event => {
        const eventDate = event.fecha_inicio.split('T')[0];
        return eventDate === today;
      });
      
      const eventosActivos = events.filter(event => event.estado === 'activo');
      
      setDashboardStats({
        totalEventos: events.length,
        eventosHoy: eventosHoy.length,
        eventosActivos: eventosActivos.length,
        totalAsistencias: 0,
      });
    }
  }, [events]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboardData]);

  const handleLogout = () => {
    logout();
  };

  const StatCard = ({ title, value, icon, color, onPress }: {
    title: string;
    value: number | string;
    icon: string;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.statCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.greyMedium }]}>{title}</Text>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }: {
    title: string;
    icon: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.quickAction, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.quickActionText, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <CulturalHeader 
        title="MiCultura Planner"
        subtitle="Panel de Control"
        onLogoutPress={handleLogout}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Bienvenido, {user?.name}
          </Text>
          <Text style={[styles.welcomeSubtext, { color: colors.greyMedium }]}>
            Panel de control administrativo
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Eventos"
            value={dashboardStats.totalEventos}
            icon="calendar"
            color={colors.primary}
            onPress={() => router.push('/(app)/(tabs)/eventos')}
          />
          <StatCard
            title="Eventos Hoy"
            value={dashboardStats.eventosHoy}
            icon="today"
            color={colors.warning}
          />
          <StatCard
            title="Eventos Activos"
            value={dashboardStats.eventosActivos}
            icon="checkmark-circle"
            color={colors.success}
          />
          <StatCard
            title="Asistencias"
            value={dashboardStats.totalAsistencias}
            icon="people"
            color={colors.secondary}
            onPress={() => router.push('/marcaciones')}
          />
        </View>

        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Acciones Rápidas
            </Text>
            <View style={styles.quickActionsGrid}>
              <QuickAction
                title="Nuevo Evento"
                icon="add-circle"
                color={colors.primary}
                onPress={() => router.push('/(app)/(tabs)/eventos')}
              />
              <QuickAction
                title="Ver Empleados"
                icon="people"
                color={colors.success}
                onPress={() => router.push('/(app)/(tabs)/empleados')}
              />
              <QuickAction
                title="Reportes"
                icon="document-text"
                color={colors.warning}
                onPress={() => router.push('/(app)/(tabs)/reportes')}
              />
              <QuickAction
                title="Configuración"
                icon="settings"
                color={colors.greyMedium}
                onPress={() => router.push('/(app)/(tabs)/configuracion')}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Eventos Recientes
              </Text>
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/eventos')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  Ver todos
                </Text>
              </TouchableOpacity>
            </View>
            
            {events.slice(0, 3).map((event) => (
              <TouchableOpacity 
                key={event.id}
                style={styles.eventItem}
                onPress={() => router.push(`/event-details?eventId=${event.id}`)}
              >
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventName, { color: colors.text }]} numberOfLines={1}>
                    {event.nombre}
                  </Text>
                  <Text style={[styles.eventLocation, { color: colors.greyMedium }]} numberOfLines={1}>
                    {event.ubicacion}
                  </Text>
                </View>
                <View style={[
                  styles.eventStatus,
                  { backgroundColor: event.estado === 'activo' ? colors.success : colors.greyMedium }
                ]}>
                  <Text style={styles.eventStatusText}>
                    {event.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {events.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.greyMedium} />
                <Text style={[styles.emptyText, { color: colors.greyMedium }]}>
                  No hay eventos registrados
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
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
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
  },
  eventStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});