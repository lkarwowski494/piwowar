/**
 * Piwowar (Brewcraft) — CraftHeader Component
 * WCAG AAA header with strict 32-wzorce navigation terms ("Wróć", "Zamknij", "Dodaj {obiekt}")
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../lib/theme';

export interface CraftHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string; // Default: 'Wróć'
  onClose?: () => void;
  actionButton?: {
    label: string; // e.g. 'Dodaj warkę'
    onPress: () => void;
    accessibilityLabel: string;
  };
}

export const CraftHeader: React.FC<CraftHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Wróć',
  onClose,
  actionButton
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.navButtonText}>← {backLabel}</Text>
          </TouchableOpacity>
        ) : onClose ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Zamknij"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.navButtonText}>Zamknij</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {actionButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={actionButton.onPress}
            accessibilityRole="button"
            accessibilityLabel={actionButton.accessibilityLabel}
          >
            <Text style={styles.actionButtonText}>+ {actionButton.label}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.bgCanvas,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 36,
    marginBottom: THEME.spacing.xs
  },
  placeholder: {
    width: 36
  },
  navButton: {
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.sm
  },
  navButtonText: {
    color: THEME.colors.accentPrimary,
    fontSize: 16,
    fontWeight: '600'
  },
  actionButton: {
    backgroundColor: THEME.colors.accentPrimary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.sm
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700'
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    marginTop: 2
  }
});
