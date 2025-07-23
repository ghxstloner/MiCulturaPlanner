import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!user) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={colorScheme === 'dark' 
            ? ['#1B4D8C', '#4A90D9']
            : ['#4A90D9', '#1B4D8C']
          }
          style={styles.headerGradient}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Profile Header - SEPARADO del gradiente */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={45} color="white" />
            </View>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
          </View>
          
          <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.userPosition, { color: colors.greyMedium }]}>{user.position}</Text>
        </View>

        {/* Profile Details */}
        <View style={[styles.detailsContainer, { backgroundColor: colors.surface }]}>
          <ProfileDetailItem
            icon="id-card"
            label="Cédula"
            value={user.cedula}
            colors={colors}
          />
          
          <ProfileDetailItem
            icon="mail"
            label="Email"
            value={user.email}
            colors={colors}
          />
          
          <ProfileDetailItem
            icon="business"
            label="Departamento"
            value={user.department}
            colors={colors}
          />
          
          {user.phone && (
            <ProfileDetailItem
              icon="call"
              label="Teléfono"
              value={user.phone}
              colors={colors}
            />
          )}
        </View>

        {/* Stats Section */}
        <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>
            Estadísticas de Asistencia
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statNumberContainer, { backgroundColor: `${colors.success}15` }]}>
                <Text style={[styles.statNumber, { color: colors.success }]}>12</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.greyMedium }]}>Eventos</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statNumberContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>98%</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.greyMedium }]}>Puntualidad</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statNumberContainer, { backgroundColor: `${colors.secondary}15` }]}>
                <Text style={[styles.statNumber, { color: colors.secondary }]}>5.0</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.greyMedium }]}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.footerText, { color: colors.greyMedium }]}>
            Ministerio de Cultura - República de Panamá
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

interface ProfileDetailItemProps {
  icon: string;
  label: string;
  value: string;
  colors: any;
}

const ProfileDetailItem: React.FC<ProfileDetailItemProps> = ({ icon, label, value, colors }) => (
  <View style={styles.detailItem}>
    <View style={[styles.detailIconContainer, { backgroundColor: `${colors.primary}15` }]}>
      <Ionicons name={icon as any} size={22} color={colors.primary} />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={[styles.detailLabel, { color: colors.greyMedium }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  headerGradient: {
    height: 100,
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 12,
    paddingRight: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    marginTop: -50, // Overlap con el header
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  userPosition: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  detailsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumberContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
});