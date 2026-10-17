/**
 * Piwowar (Brewcraft) — UndoSnackbar Component
 * DEC-03: Immediate WAL commit + bottom Snackbar "Cofnij" (32-wzorce-interakcji.md)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUndoStore } from '../lib/store/undoStore';
import { THEME } from '../lib/theme';

export const UndoSnackbar: React.FC = () => {
  const { visible, message, triggerUndo } = useUndoStore();

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity
        style={styles.undoButton}
        onPress={triggerUndo}
        accessibilityRole="button"
        accessibilityLabel="Cofnij"
      >
        <Text style={styles.undoText}>Cofnij</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: THEME.colors.bgElevated,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  message: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: THEME.spacing.md
  },
  undoButton: {
    backgroundColor: THEME.colors.accentPrimary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    minHeight: 36,
    justifyContent: 'center'
  },
  undoText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700'
  }
});
