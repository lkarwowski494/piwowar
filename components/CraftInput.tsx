/**
 * Piwowar (Brewcraft) — CraftInput Component
 * Ergonomic input field with unit labels and high-contrast text
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { THEME } from '../lib/theme';

export interface CraftInputProps extends TextInputProps {
  label: string;
  unit?: string;
  error?: string;
}

export const CraftInput: React.FC<CraftInputProps> = ({
  label,
  unit,
  error,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, !!error && styles.errorBorder]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={THEME.colors.textMuted}
          keyboardAppearance="dark"
          {...props}
        />
        {unit && <Text style={styles.unitText}>{unit}</Text>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md
  },
  label: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: THEME.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.bgCanvas,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: THEME.spacing.md,
    minHeight: THEME.touchTarget.minHeight
  },
  input: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 16,
    paddingVertical: THEME.spacing.sm
  },
  unitText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: THEME.spacing.sm
  },
  errorBorder: {
    borderColor: THEME.colors.statusDanger
  },
  errorText: {
    color: THEME.colors.statusDanger,
    fontSize: 12,
    marginTop: 4
  }
});
