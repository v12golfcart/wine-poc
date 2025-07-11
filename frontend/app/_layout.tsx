import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="photo-confirm" 
          options={{ 
            headerShown: false,
            animation: 'none' // Instant transition, no sliding
          }} 
        />
        <Stack.Screen 
          name="recommendations" 
          options={{ 
            title: 'Sommelier Recommendations',
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerShadowVisible: false,
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen name="wine-list" options={{ title: 'Wine Selection' }} />
        <Stack.Screen name="wine-details/[id]" options={{ title: 'Wine Details' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
} 