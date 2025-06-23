import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sommelier',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'camera' : 'camera-outline'} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'list' : 'list-outline'} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />
    </Tabs>
  );
} 