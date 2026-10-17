/**
 * Piwowar (Brewcraft) — Tabs Layout
 * 5 Main tabs with dark workshop aesthetics and WCAG AAA colors
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { THEME } from '../../lib/theme';
import { t } from '../../lib/i18n';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.colors.bgCanvas,
          borderTopColor: THEME.colors.borderSubtle,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarActiveTintColor: THEME.colors.accentPrimary,
        tabBarInactiveTintColor: THEME.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700'
        }
      }}
    >
      <Tabs.Screen
        name="brew"
        options={{
          title: t('tab_brew'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⏱️</Text>
        }}
      />
      <Tabs.Screen
        name="batches"
        options={{
          title: t('tab_batches'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🫙</Text>
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: t('tab_recipes'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📜</Text>
        }}
      />
      <Tabs.Screen
        name="calculators"
        options={{
          title: t('tab_calculators'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🎛️</Text>
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab_settings'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text>
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null
        }}
      />
    </Tabs>
  );
}
