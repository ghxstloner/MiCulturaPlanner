# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo for the Ministry of Culture (MinCultura) attendance tracking system. The app allows employees to mark attendance at events using facial recognition.

## Tech Stack

- **Framework**: React Native with Expo (v53.0.20)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **UI Components**: React Native Paper (Material Design 3)
- **TypeScript**: Fully typed codebase
- **Camera/Facial Recognition**: expo-camera with facial recognition API
- **Data Storage**: AsyncStorage for token/user data persistence

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start
# or
expo start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Linting
npm run lint

# Reset project (removes example code)
npm run reset-project
```

## Application Architecture

### Routing Structure
- Uses Expo Router with file-based routing
- Two main route groups:
  - `(auth)`: Authentication flows (login)
  - `(app)`: Main application screens (requires authentication)
- Authentication guard in `app/(app)/_layout.tsx` redirects unauthenticated users

### Key Screens
- `app/(auth)/login.tsx`: Login screen
- `app/(app)/index.tsx`: Events dashboard/home
- `app/(app)/camera.tsx`: Facial recognition camera for attendance
- `app/(app)/event-details.tsx`: Event detail view
- `app/(app)/marcaciones.tsx`: Attendance records view

### State Management
Uses Zustand stores for global state:

- **authStore.ts**: Authentication state, login/logout, token management
- **eventsStore.ts**: Events data, attendance marking, facial recognition
- **marcacionesStore.ts**: Attendance records management

### Services Layer
- **api.ts**: Base API client with authentication headers
- **authService.ts**: Authentication API calls
- **eventsService.ts**: Events and attendance API calls
- **facialService.ts**: Facial recognition processing
- **marcacionesService.ts**: Attendance records API
- **tripulantesService.ts**: Employee/crew management API

### Backend Integration
- API base URL configured in `services/api.ts`: `http://192.168.2.11:8000/api/v1`
- Uses Bearer token authentication
- Backend data mapping functions in stores to transform API responses to frontend models

### Theme & Styling
- Dark/light mode support via `useColorScheme` hook
- React Native Paper Material Design 3 themes
- Custom color scheme in `constants/Colors.ts`
- Cultural branding with MinCultura assets

### Permissions & Security
- Camera permission for facial recognition
- Secure token storage using AsyncStorage
- Bundle IDs: `gov.micultura.planner`

## Key Features

1. **Facial Recognition Attendance**: Users take photos that are processed for identity verification
2. **Event Management**: View events, details, and attendance status
3. **Authentication**: Secure login with persistent sessions
4. **Attendance Records**: View historical attendance data

## Development Notes

- The app uses Expo's new architecture (`newArchEnabled: true`)
- TypeScript paths configured with `@/*` alias
- Custom splash screen with animations
- Material Design 3 with cultural branding
- Supports both iOS and Android with platform-specific configurations

## API Integration

The app communicates with a backend API for:
- User authentication
- Events data retrieval
- Facial recognition processing
- Attendance marking
- Historical records

Backend responses are mapped to frontend types using transformation functions in the stores.