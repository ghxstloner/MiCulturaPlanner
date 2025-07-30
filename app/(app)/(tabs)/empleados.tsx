import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import CulturalHeader from '@/components/common/CulturalHeader';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tripulante, TripulantesMetadata, tripulantesService } from '@/services/tripulantesService';
import { useAuthStore } from '@/store/authStore';

// Componente para avatar con iniciales
const AvatarWithInitials = ({ 
  imagen, 
  crew_id, 
  nombres, 
  apellidos, 
  onPress, 
  size = 60 
}: { 
  imagen: string | null; 
  crew_id: string; 
  nombres: string; 
  apellidos: string; 
  onPress: () => void; 
  size?: number;
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getInitials = () => {
    const firstNameInitial = nombres.charAt(0).toUpperCase();
    const lastNameInitial = apellidos.charAt(0).toUpperCase();
    return `${firstNameInitial}${lastNameInitial}`;
  };

  const getImageSource = () => {
    if (imagen && imagen.trim() !== '') {
      return { 
        uri: `${process.env.EXPO_PUBLIC_IMAGE_URL}/${crew_id}/${imagen}` 
      };
    }
    return null;
  };

  const imageSource = getImageSource();

  if (!imageSource || error) {
    // Mostrar iniciales
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.avatarContainer,
          styles.initialsContainer,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            backgroundColor: colors.primary 
          }
        ]}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.initialsText, 
          { 
            fontSize: size * 0.4,
            color: 'white' 
          }
        ]}>
          {getInitials()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}
      activeOpacity={0.7}
    >
      {loading && (
        <View style={[
          styles.loadingOverlay, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            backgroundColor: colors.surface 
          }
        ]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
      <Image
        source={imageSource}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </TouchableOpacity>
  );
};

// Componente modal para mostrar imagen en grande
const ImageModal = ({ visible, imageSource, onClose }: { 
  visible: boolean; 
  imageSource: any; 
  onClose: () => void; 
}) => {
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

export default function EmpleadosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { logout } = useAuthStore();
  
  const [empleados, setEmpleados] = useState<Tripulante[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmpleados, setFilteredEmpleados] = useState<Tripulante[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [metadata, setMetadata] = useState<TripulantesMetadata | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<{
    visible: boolean;
    imageSource: any;
  }>({ visible: false, imageSource: null });

  const loadEmpleados = useCallback(async (offset: number = 0, append: boolean = false) => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
  
      const result = await tripulantesService.getTripulantes(offset, 50);
      
      if (result.success && result.data) {
        if (append) {
          setEmpleados(prev => [...prev, ...(result.data || [])]);
        } else {
          setEmpleados(result.data);
        }
        
        // Actualizar metadata
        if (result.metadata) {
          setMetadata(result.metadata);
        }
      }
    } catch (error) {
      console.error('❌ Error loading empleados:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (metadata && metadata.has_more && !loadingMore && searchQuery.trim() === '') {
      const nextOffset = empleados.length;
      loadEmpleados(nextOffset, true);
    }
  }, [metadata, loadingMore, empleados.length, searchQuery, loadEmpleados]);

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
    setSearchQuery(''); // Limpiar búsqueda al refrescar
    await loadEmpleados(0, false);
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

  const handleImagePress = (imagen: string | null, crew_id: string) => {
    const imageSource = getImageSource(imagen, crew_id);
    setSelectedImageModal({
      visible: true,
      imageSource
    });
  };

  const renderEmpleado = ({ item }: { item: Tripulante }) => (
    <Card style={[styles.empleadoCard, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.empleadoContent}>
        <View style={styles.empleadoHeader}>
          <AvatarWithInitials
            imagen={item.imagen}
            crew_id={item.crew_id}
            nombres={item.nombres}
            apellidos={item.apellidos}
            onPress={() => handleImagePress(item.imagen, item.crew_id)}
            size={60}
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

  const renderFooter = () => {
    if (loadingMore && searchQuery.trim() === '') {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingMoreText, { color: colors.greyMedium }]}>
            Cargando más empleados...
          </Text>
        </View>
      );
    }

    // Counter footer
    const currentCount = filteredEmpleados.length;
    const totalCount = metadata?.total || 0;
    
    return (
      <View style={[styles.footerCounter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Text style={[styles.counterText, { color: colors.greyMedium }]}>
          {searchQuery.trim() !== '' 
            ? `${currentCount} resultado${currentCount !== 1 ? 's' : ''} de búsqueda`
            : `${currentCount} de ${totalCount} empleados`
          }
        </Text>
        {metadata && metadata.has_more && searchQuery.trim() === '' && (
          <Text style={[styles.moreAvailableText, { color: colors.primary }]}>
            Desliza hacia abajo para cargar más
          </Text>
        )}
        {metadata && !metadata.has_more && searchQuery.trim() === '' && currentCount > 0 && (
          <Text style={[styles.allLoadedText, { color: colors.greyMedium }]}>
            Todos los empleados cargados
          </Text>
        )}
      </View>
    );
  };

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

      {loading && empleados.length === 0 ? (
        <View style={styles.initialLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.initialLoadingText, { color: colors.text }]}>
            Cargando empleados...
          </Text>
        </View>
      ) : (
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
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
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Modal para mostrar imagen en grande */}
      <ImageModal
        visible={selectedImageModal.visible}
        imageSource={selectedImageModal.imageSource}
        onClose={() => setSelectedImageModal({ visible: false, imageSource: null })}
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
  initialLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  initialLoadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
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
  // Estilos para avatar
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#f0f0f0',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
  moreAvailableText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  allLoadedText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Estilos para el modal de imagen
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
});