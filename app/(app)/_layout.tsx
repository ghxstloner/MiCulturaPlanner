import { Href, Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useAuthStore } from '../../store/authStore';

export default function AppLayout() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  if (!isAuthenticated) {
    return <Redirect href={'/(auth)/login' as Href} />;
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: colors.background,
            paddingTop: 0,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Asistencia a Eventos',
            headerShown: false, // Esta pantalla tendrá su propio header personalizado
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            title: 'Reconocimiento Facial',
            headerShown: false,
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="event-details"
          options={{
            title: 'Detalles del Evento',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
              color: colors.primary,
            },
          }}
        />
      </Stack>
    </>
  );
}