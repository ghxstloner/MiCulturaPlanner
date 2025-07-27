import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import AttendanceList from '../../components/attendance/AttendanceList';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function MarcacionesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="checkmark-done" size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              Marcaciones
            </Text>
          </View>
          
          <Button
            mode="text"
            onPress={() => router.back()}
            textColor={colors.primary}
          >
            Volver
          </Button>
        </View>

        <View style={styles.periodSelector}>
          <SegmentedButtons
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            buttons={[
              {
                value: 'today',
                label: 'Hoy',
                icon: 'today',
              },
              {
                value: 'recent',
                label: 'Recientes',
                icon: 'time',
              },
            ]}
            style={{ backgroundColor: colors.surface }}
          />
        </View>
      </View>

      <View style={styles.content}>
        <AttendanceList 
          showToday={selectedPeriod === 'today'}
          limit={selectedPeriod === 'recent' ? 20 : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  periodSelector: {
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
});