import { Slot } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <SafeAreaView 
      style={[
        styles.safeArea, 
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.container}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});