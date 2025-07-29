import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import CulturalHeader from '@/components/common/CulturalHeader';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tripulante, tripulantesService } from '@/services/tripulantesService';
import { useAuthStore } from '@/store/authStore';

export default function EmpleadosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { logout } = useAuthStore();
  
  const [empleados, setEmpleados] = useState<Tripulante[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmpleados, setFilteredEmpleados] = useState<Tripulante[]>([]);

  const loadEmpleados = useCallback(async () => {
    try {
      const result = await tripulantesService.getTripulantes();
      if (result.success && result.data) {
        setEmpleados(result.data);
        setFilteredEmpleados(result.data);
      }
    } catch (error) {
      console.error('Error loading empleados:', error);

    }
  }, []);

  useEffect(() => {
    loadEmpleados();
  }, [loadEmpleados]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmpleados(empleados);
    } else {
      const filtered = empleados.filter(empleado =>
        empleado.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empleado.apellidos.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empleado.crew_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empleado.identidad?.includes(searchQuery)
      );
      setFilteredEmpleados(filtered);
    }
  }, [searchQuery, empleados]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEmpleados();
    setRefreshing(false);
  }, [loadEmpleados]);

  const handleLogout = () => {
    logout();
  };

  const getImageSource = (imagen: string | null, crew_id: string) => {
    if (imagen && imagen.trim() !== '') {
      return { 
        uri: `${process.env.EXPO_PUBLIC_IMAGE_URL}/${crew_id}/${imagen}` 
      };
    } else {
      return require('../../../assets/images/default-avatar.png');
    }
  };

  const renderEmpleado = ({ item }: { item: Tripulante }) => (
    <Card style={[styles.empleadoCard, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.empleadoContent}>
        <View style={styles.empleadoHeader}>
          <Image
            source={getImageSource(item.imagen, item.crew_id)}
            style={styles.avatar}
            onError={(error) => {
              console.warn('Error cargando imagen:', error);
            }}
          />
          
          <View style={styles.empleadoInfo}>
            <Text style={[styles.empleadoNombre, { color: colors.text }]}>
              {item.nombres} {item.apellidos}
            </Text>
            <View style={styles.empleadoMeta}>
              <View style={[styles.crewIdBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.crewIdText}>{item.crew_id}</Text>
              </View>
              {item.identidad && (
                <Text style={[styles.cedulaText, { color: colors.greyMedium }]}>
                  Cédula: {item.identidad}
                </Text>
              )}
            </View>
            
            {item.departamento && (
              <View style={styles.departamentoContainer}>
                <Ionicons name="business-outline" size={14} color={colors.greyMedium} />
                <Text style={[styles.departamentoText, { color: colors.greyMedium }]}>
                  {item.departamento}
                </Text>
              </View>
            )}
            
            {item.cargo && (
              <View style={styles.cargoContainer}>
                <Ionicons name="person-outline" size={14} color={colors.greyMedium} />
                <Text style={[styles.cargoText, { color: colors.greyMedium }]}>
                  {item.cargo}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.estadoBadgeContainer}>
            {item.estatus === 1 ? (
              <View style={[styles.estadoBadge, { backgroundColor: colors.success }]}>
                <Ionicons name="checkmark-circle" size={12} color="white" />
                <Text style={styles.estadoBadgeText}>Activo</Text>
              </View>
            ) : (
              <View style={[styles.estadoBadge, { backgroundColor: colors.greyMedium }]}>
                <Ionicons name="pause-circle" size={12} color="white" />
                <Text style={styles.estadoBadgeText}>Inactivo</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.contactoInfo}>
          {item.email && (
            <View style={styles.contactoItem}>
              <Ionicons name="mail-outline" size={16} color={colors.primary} />
              <Text style={[styles.contactoText, { color: colors.text }]} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
          )}
          
          {item.celular && (
            <View style={styles.contactoItem}>
              <Ionicons name="call-outline" size={16} color={colors.primary} />
              <Text style={[styles.contactoText, { color: colors.text }]}>
                {item.celular}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CulturalHeader
        title="MiCultura Planner"
        subtitle="Gestión de Empleados"
        onLogoutPress={handleLogout}
      />
  
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.greyMedium} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nombre, posición o cédula..."
            placeholderTextColor={colors.greyMedium}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.greyMedium} />
            </TouchableOpacity>
          )}
        </View>
      </View>
  
      <FlatList
        data={filteredEmpleados}
        renderItem={renderEmpleado}
        keyExtractor={(item) => item.id_tripulante.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.greyMedium} />
            <Text style={[styles.emptyText, { color: colors.greyMedium }]}>
              {searchQuery ? 'No se encontraron empleados' : 'No hay empleados registrados'}
            </Text>
            {searchQuery && (
              <Text style={[styles.emptySubtext, { color: colors.greyMedium }]}>
                Intenta con otro término de búsqueda
              </Text>
            )}
          </View>
        }
        // 👇 El contador de empleados ahora es el footer de la lista
        ListFooterComponent={
          <View style={[styles.footerCounter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <Text style={[styles.counterText, { color: colors.greyMedium }]}>
              {filteredEmpleados.length} de {empleados.length} empleados
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  listContainer: {
    padding: 16,
  },
  empleadoCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  empleadoContent: {
    padding: 16,
  },
  empleadoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  empleadoInfo: {
    flex: 1,
  },
  empleadoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  empleadoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  departamentoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  departamentoText: {
    fontSize: 12,
  },
  cargoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cargoText: {
    fontSize: 12,
  },
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
  contactoInfo: {
    gap: 8,
  },
  contactoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactoText: {
    fontSize: 14,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  footerCounter: {
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});