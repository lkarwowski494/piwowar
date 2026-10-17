/**
 * Piwowar (Brewcraft) — CraftModal Component
 * Strict modal adhering to 32-wzorce-interakcji.md:
 * - 'Anuluj' always in headerLeft
 * - 'Dodaj' or 'Zapisz' always in headerRight
 * - Dirty form confirmation dialog
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { THEME } from '../lib/theme';

export interface CraftModalProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string; // 'Dodaj' or 'Zapisz'
  isDirty?: boolean;
  children: React.ReactNode;
}

export const CraftModal: React.FC<CraftModalProps> = ({
  visible,
  title,
  onCancel,
  onSubmit,
  submitLabel = 'Zapisz',
  isDirty = false,
  children
}) => {
  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        'Odrzucić zmiany?',
        'Wprowadzone dane nie zostaną zapisane.',
        [
          { text: 'Wróć do edycji', style: 'cancel' },
          { text: 'Odrzuć zmiany', style: 'destructive', onPress: onCancel }
        ]
      );
    } else {
      onCancel();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Anuluj"
          >
            <Text style={styles.cancelText}>Anuluj</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={onSubmit}
            accessibilityRole="button"
            accessibilityLabel={submitLabel}
          >
            <Text style={styles.submitText}>{submitLabel}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bgCanvas
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    backgroundColor: THEME.colors.bgCanvas
  },
  headerButton: {
    minWidth: 64,
    minHeight: 44,
    justifyContent: 'center'
  },
  cancelText: {
    color: THEME.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600'
  },
  headerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center'
  },
  submitText: {
    color: THEME.colors.accentPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right'
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg
  }
});
