/**
 * Piwowar (Brewcraft) — CraftCard Component
 * Physical 1px micro-border with steel workshop surface
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../lib/theme';

export interface CraftCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
  highlightBorder?: boolean;
}

export const CraftCard: React.FC<CraftCardProps> = ({
  children,
  title,
  subtitle,
  style,
  highlightBorder = false
}) => {
  return (
    <View
      style={[
        styles.card,
        highlightBorder && styles.highlight,
        style
      ]}
    >
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.bgSurface,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md
  },
  highlight: {
    borderColor: THEME.colors.accentPrimary
  },
  header: {
    marginBottom: THEME.spacing.md
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2
  }
});
