/**
 * Piwowar (Brewcraft) — CraftButton Component
 * Kitchen-Proof touch button with >= 56pt height and high-contrast WCAG AAA text
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { THEME } from '../lib/theme';

export interface CraftButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'hop';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const CraftButton: React.FC<CraftButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel
}) => {
  const getBackgroundColor = () => {
    if (disabled) return THEME.colors.borderSubtle;
    switch (variant) {
      case 'primary':
        return THEME.colors.accentPrimary;
      case 'hop':
        return THEME.colors.accentHop;
      case 'danger':
        return THEME.colors.statusDanger;
      case 'secondary':
      default:
        return THEME.colors.bgSurface;
    }
  };

  const getTextColor = () => {
    if (disabled) return THEME.colors.textMuted;
    if (variant === 'primary') return '#000000';
    return THEME.colors.textPrimary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'secondary' && styles.secondaryBorder,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: THEME.touchTarget.kitchenProofHeight,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3
  }
});
