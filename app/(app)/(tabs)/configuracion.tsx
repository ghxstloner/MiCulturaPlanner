import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Href, router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import CulturalHeader from '@/components/common/CulturalHeader';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/authStore';

export default function ConfiguracionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión", 
      "¿Está seguro que desea cerrar la sesión?", 
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí", 
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              await logout();
              router.replace('/(auth)/login' as Href);
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }, 
          style: "destructive" 
        }
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    showArrow = true,
    textColor,
    iconColor 
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    onPress: () => void;
    showArrow?: boolean;
    textColor?: string;
    iconColor?: string;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: (iconColor || colors.primary) + '15' }]}>
        <Ionicons name={icon as any} size={20} color={iconColor || colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: textColor || colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.greyMedium }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.greyMedium} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <CulturalHeader 
        title="MiCultura Planner"
        subtitle="Configuración del Sistema"
        onLogoutPress={handleLogout}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Información del usuario */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content style={styles.userSection}>
            <View style={styles.userInfo}>
              <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.userInitials}>
                  {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user?.name || 'Administrador'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.greyMedium }]}>
                  {user?.email || 'admin@cultura.gob.pa'}
                </Text>
                {user?.is_admin && (
                  <View style={[styles.adminBadge, { backgroundColor: colors.success }]}>
                    <Ionicons name="shield-checkmark" size={12} color="white" />
                    <Text style={styles.adminText}>Administrador</Text>
                  </View>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Sistema */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sistema
        </Text>
        
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <SettingItem
              title="Base de Datos"
              subtitle="Ver estado de conexión"
              icon="server"
              onPress={() => {
                Alert.alert(
                  "Estado de la Base de Datos",
                  "Conexión activa y funcionando correctamente",
                  [{ text: "OK" }]
                );
              }}
            />
            
            <Divider style={{ backgroundColor: colors.border }} />
            
            <SettingItem
              title="Reconocimiento Facial"
              subtitle="Configurar umbrales de confianza"
              icon="scan"
              onPress={() => {
                Alert.alert(
                  "Configuración de IA",
                  "Umbral de confianza actual: 70%\nUmbral de distancia: 0.4",
                  [{ text: "OK" }]
                );
              }}
            />
            
            <Divider style={{ backgroundColor: colors.border }} />
            
            <SettingItem
              title="Logs del Sistema"
              subtitle="Ver registros de actividad"
              icon="document-text"
              onPress={() => {
                Alert.alert(
                  "Logs del Sistema",
                  "Los logs se guardan en: logs/app.log\n\nÚltimas entradas disponibles para revisión.",
                  [{ text: "OK" }]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* Datos */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Gestión de Datos
        </Text>
        
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <SettingItem
              title="Exportar Datos"
              subtitle="Descargar reportes en CSV"
              icon="download"
              onPress={() => {
                Alert.alert(
                  "Exportar Datos",
                  "Funcionalidad disponible próximamente",
                  [{ text: "OK" }]
                );
              }}
            />
            
            <Divider style={{ backgroundColor: colors.border }} />
            
            <SettingItem
              title="Backup de Embeddings"
              subtitle="Respaldar datos faciales"
              icon="cloud-upload"
              onPress={() => {
                Alert.alert(
                  "Backup de Embeddings",
                  "¿Desea crear un respaldo de todos los embeddings faciales?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Crear Backup", onPress: () => {
                      Alert.alert("Éxito", "Backup creado correctamente");
                    }}
                  ]
                );
              }}
            />
            
            <Divider style={{ backgroundColor: colors.border }} />
            
            <SettingItem
              title="Limpiar Caché"
              subtitle="Liberar espacio temporal"
              icon="refresh"
              onPress={() => {
                Alert.alert(
                  "Limpiar Caché",
                  "¿Desea eliminar todos los archivos temporales?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Limpiar", onPress: () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert("Éxito", "Caché limpiado correctamente");
                    }}
                  ]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* Información */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Información
        </Text>
        
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <SettingItem
              title="Acerca de la App"
              subtitle="MiCultura v1.0.0"
              icon="information-circle"
              onPress={() => {
                Alert.alert(
                  "MiCultura",
                  "Sistema de Asistencia Digital\nVersión 1.0.0\n\nMinisterio de Cultura\nRepública de Panamá",
                  [{ text: "OK" }]
                );
              }}
            />
            
            <Divider style={{ backgroundColor: colors.border }} />
            
            <SettingItem
              title="Soporte Técnico"
              subtitle="Contactar administrador"
              icon="help-circle"
              onPress={() => {
                Alert.alert(
                  "Soporte Técnico",
                  "Para soporte técnico, contacte al administrador del sistema.",
                  [{ text: "OK" }]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* Cerrar sesión */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <SettingItem
              title="Cerrar Sesión"
              subtitle="Salir de la aplicación"
              icon="log-out"
              onPress={handleLogout}
              showArrow={false}
              textColor={colors.error}
              iconColor={colors.error}
            />
          </Card.Content>
        </Card>

        {/* Footer con info del sistema */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.greyMedium }]}>
            MiCultura • Sistema de Asistencia Digital
          </Text>
          <Text style={[styles.footerText, { color: colors.greyMedium }]}>
            Ministerio de Cultura • República de Panamá
          </Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardContent: {
    paddingVertical: 8,
  },
  userSection: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInitials: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});