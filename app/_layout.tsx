/**
 * Piwowar (Brewcraft) — Root Layout
 * Initializes SQLite WAL database, loads initial state, and mounts UndoSnackbar.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { openAppDatabase } from '../lib/db/database';
import { useBatchStore } from '../lib/store/batchStore';
import { useEquipmentStore } from '../lib/store/equipmentStore';
import { UndoSnackbar } from '../components/UndoSnackbar';
import { THEME } from '../lib/theme';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const loadBatches = useBatchStore((state) => state.loadBatches);
  const loadEquipment = useEquipmentStore((state) => state.loadEquipment);

  useEffect(() => {
    async function init() {
      try {
        const db = await openAppDatabase();
        await loadBatches(db);
        await loadEquipment(db);
        setDbReady(true);
      } catch (err: unknown) {
        console.error('Failed to initialize SQLite database:', err);
        setInitError(err instanceof Error ? err.message : 'Błąd inicjalizacji bazy danych');
      }
    }

    init();
  }, [loadBatches, loadEquipment]);

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        {initError ? (
          <Text style={styles.errorText}>Błąd: {initError}</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color={THEME.colors.accentPrimary} />
            <Text style={styles.loadingText}>Inicjalizacja Piwowar (Brewcraft)...</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: THEME.colors.bgCanvas }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <UndoSnackbar />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bgCanvas
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bgCanvas,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.md,
    fontSize: 15,
    fontWeight: '600'
  },
  errorText: {
    color: THEME.colors.statusDanger,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 24
  }
});
