import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import CulturalHeader from '@/components/common/CulturalHeader';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { reportesService, ReportStats } from '@/services/reportesService';
import { useAuthStore } from '@/store/authStore';

export default function ReportesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { logout } = useAuthStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportStats, setReportStats] = useState<ReportStats>({
    totalEventos: 0,
    eventosActivos: 0,
    eventosFinalizados: 0,
    promedioAsistencia: 0,
    eventosPorMes: {},
    asistenciaCompleta: 0,
    asistenciaParcial: 0,
    ausencias: 0,
    tendenciaEventos: 0,
    tendenciaMarcaciones: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const result = await reportesService.getStats();
      if (result.success && result.data) {
        setReportStats(result.data);
      }
    } catch (error) {
      console.error('Error loading reportes stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const handleLogout = () => {
    logout();
  };

  const StatCard = ({ title, value, subtitle, icon, color }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
  }) => (
    <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
          <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.statSubtitle, { color: colors.greyMedium }]}>{subtitle}</Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const formatTendencia = (valor: number) => {
    const signo = valor >= 0 ? '+' : '';
    return `${signo}${valor}%`;
  };

  const getTendenciaIcon = (valor: number) => {
    if (valor > 0) return 'trending-up';
    if (valor < 0) return 'trending-down';
    return 'remove';
  };

  const getTendenciaColor = (valor: number) => {
    if (valor > 0) return colors.success;
    if (valor < 0) return colors.error;
    return colors.greyMedium;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <CulturalHeader 
          title="MiCultura Planner"
          subtitle="Reportes y Estadísticas"
          onLogoutPress={handleLogout}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.greyMedium }]}>
            Cargando estadísticas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <CulturalHeader 
        title="MiCultura Planner"
        subtitle="Reportes y Estadísticas"
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Resumen General
        </Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Eventos"
            value={reportStats.totalEventos}
            icon="calendar"
            color={colors.primary}
          />
          <StatCard
            title="Eventos Activos"
            value={reportStats.eventosActivos}
            icon="checkmark-circle"
            color={colors.success}
          />
          <StatCard
            title="Eventos Finalizados"
            value={reportStats.eventosFinalizados}
            icon="archive"
            color={colors.greyMedium}
          />
          <StatCard
            title="Promedio Asistencia"
            value={`${reportStats.promedioAsistencia}%`}
            icon="people"
            color={colors.warning}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Eventos por Mes
        </Text>
        
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            {Object.entries(reportStats.eventosPorMes).length > 0 ? (
              Object.entries(reportStats.eventosPorMes).map(([month, count]) => (
                <View key={month} style={styles.monthItem}>
                  <View style={styles.monthInfo}>
                    <Text style={[styles.monthName, { color: colors.text }]}>{month}</Text>
                    <Text style={[styles.monthCount, { color: colors.primary }]}>{count} eventos</Text>
                  </View>
                  <View style={styles.monthBar}>
                    <View 
                      style={[
                        styles.monthBarFill, 
                        { 
                          backgroundColor: colors.primary,
                          width: `${(count / Math.max(...Object.values(reportStats.eventosPorMes))) * 100}%`
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bar-chart-outline" size={48} color={colors.greyMedium} />
                <Text style={[styles.emptyText, { color: colors.greyMedium }]}>
                  No hay datos suficientes para mostrar estadísticas
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Métricas de Asistencia
        </Text>
        
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.metricTitle, { color: colors.text }]}>Asistencia Completa</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.success }]}>
                {reportStats.asistenciaCompleta}%
              </Text>
              <Text style={[styles.metricDescription, { color: colors.greyMedium }]}>
                Empleados que marcaron entrada y salida
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Ionicons name="time" size={20} color={colors.warning} />
                <Text style={[styles.metricTitle, { color: colors.text }]}>Asistencia Parcial</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.warning }]}>
                {reportStats.asistenciaParcial}%
              </Text>
              <Text style={[styles.metricDescription, { color: colors.greyMedium }]}>
                Empleados que solo marcaron entrada
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Ionicons name="close-circle" size={20} color={colors.error} />
                <Text style={[styles.metricTitle, { color: colors.text }]}>Ausencias</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.error }]}>
                {reportStats.ausencias}%
              </Text>
              <Text style={[styles.metricDescription, { color: colors.greyMedium }]}>
                Empleados asignados que no asistieron
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Tendencias
        </Text>
        
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.trendItem}>
              <Ionicons 
                name={getTendenciaIcon(reportStats.tendenciaMarcaciones) as any} 
                size={24} 
                color={getTendenciaColor(reportStats.tendenciaMarcaciones)} 
              />
              <View style={styles.trendInfo}>
                <Text style={[styles.trendTitle, { color: colors.text }]}>Asistencia General</Text>
                <Text style={[styles.trendDescription, { color: colors.greyMedium }]}>
                  {formatTendencia(reportStats.tendenciaMarcaciones)} respecto al mes anterior
                </Text>
              </View>
            </View>

            <View style={styles.trendItem}>
              <Ionicons 
                name={getTendenciaIcon(reportStats.tendenciaEventos) as any} 
                size={24} 
                color={getTendenciaColor(reportStats.tendenciaEventos)} 
              />
              <View style={styles.trendInfo}>
                <Text style={[styles.trendTitle, { color: colors.text }]}>Eventos Culturales</Text>
                <Text style={[styles.trendDescription, { color: colors.greyMedium }]}>
                  {formatTendencia(reportStats.tendenciaEventos)} respecto al mes anterior
                </Text>
              </View>
            </View>

            <View style={styles.trendItem}>
              <Ionicons name="analytics" size={24} color={colors.primary} />
              <View style={styles.trendInfo}>
                <Text style={[styles.trendTitle, { color: colors.text }]}>Eficiencia Operacional</Text>
                <Text style={[styles.trendDescription, { color: colors.greyMedium }]}>
                  Datos basados en marcaciones reales del sistema
                </Text>
              </View>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  card: {
    marginBottom: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  monthItem: {
    marginBottom: 16,
  },
  monthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  monthCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  monthBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  monthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricItem: {
    marginBottom: 20,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 14,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendInfo: {
    marginLeft: 12,
    flex: 1,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  trendDescription: {
    fontSize: 14,
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