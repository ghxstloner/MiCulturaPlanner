import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react'; // Añadir useState
import { Image, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, Chip } from 'react-native-paper';

import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { User } from '../../types';

interface UserProfileCardProps {
  user: User | null;
  onClose: () => void;
}

export default function UserProfileCard({ user, onClose }: UserProfileCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [imageError, setImageError] = useState(false); // Estado para manejar errores de imagen

  if (!user) {
    return (
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content style={styles.content}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Error: No se pudo cargar la información del usuario
          </Text>
          <Button mode="outlined" onPress={onClose} style={styles.closeButton}>
            Cerrar
          </Button>
        </Card.Content>
      </Card>
    );
  }

  // Función para renderizar el avatar
  const renderAvatar = () => {
    // Si tiene imagen, no hubo error y no está vacía
    if (user.picture && user.picture.trim() !== '' && !imageError) {
      return (
        <Image 
          source={{ uri: `data:image/jpeg;base64,${user.picture}` }} 
          style={styles.avatarImage}
          onError={(error) => {
            console.log('Error cargando imagen del usuario:', error);
            setImageError(true); // Marcar que hubo error para mostrar fallback
          }}
        />
      );
    }
    
    // Avatar con iniciales por defecto (si no hay imagen o hubo error)
    return (
      <Avatar.Text 
        size={80} 
        label={(user.name?.substring(0, 2) || 'US').toUpperCase()} 
        style={{ backgroundColor: colors.primary }}
        labelStyle={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' }}
      />
    );
  };

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          {renderAvatar()}
          <View style={styles.headerInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.name || 'Sin nombre'}
            </Text>
            <Text style={[styles.userLogin, { color: colors.greyMedium }]}>
              @{user.login || 'sin-login'}
            </Text>
            {user.is_admin && (
              <Chip 
                style={{ backgroundColor: colors.success, alignSelf: 'flex-start', marginTop: 8 }}
                textStyle={{ color: '#FFFFFF', fontSize: 10 }}
                compact
              >
                Administrador
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={20} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.greyMedium }]}>
                Email
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user.email || 'No especificado'}
              </Text>
            </View>
          </View>

          {user.id_aerolinea ? (
            <View style={styles.infoItem}>
              <Ionicons name="business" size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: colors.greyMedium }]}>
                  Departamento
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {String(user.id_aerolinea)}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.infoItem}>
            <Ionicons 
              name={user.active === 'Y' ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={user.active === 'Y' ? colors.success : colors.error} 
            />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.greyMedium }]}>
                Estado
              </Text>
              <Text style={[
                styles.infoValue, 
                { color: user.active === 'Y' ? colors.success : colors.error }
              ]}>
                {user.active === 'Y' ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.secondary} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.greyMedium }]}>
                Permisos
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user.is_admin ? 'Administrador del Sistema' : 'Usuario Estándar'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={onClose}
            style={styles.closeButton}
            buttonColor={colors.primary}
          >
            Cerrar
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxWidth: 400,
    width: '100%',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userLogin: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
  },
  actions: {
    alignItems: 'center',
  },
  closeButton: {
    borderRadius: 8,
    minWidth: 120,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
});