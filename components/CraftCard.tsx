/**
 * Piwowar (Brewcraft) — CraftCard Component
 * Physical 1px micro-border with steel workshop surface
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../lib/theme';

export interface CraftCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  highlightBorder?: boolean;
}

export const CraftCard: React.FC<CraftCardProps> = ({
  children,
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
  }
});
