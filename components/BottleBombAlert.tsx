/**
 * Piwowar (Brewcraft) — BottleBombAlert Component
 * BR-BOT-002: Visual alert and block banner for bottle burst prevention
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottleBombRisk } from '../lib/brewing/priming';
import { THEME } from '../lib/theme';

export interface BottleBombAlertProps {
  risk: BottleBombRisk;
}

export const BottleBombAlert: React.FC<BottleBombAlertProps> = ({ risk }) => {
  if (risk.severity === 'safe') return null;

  const isDanger = risk.severity === 'danger';
  const bgColor = isDanger ? 'rgba(224, 62, 62, 0.15)' : 'rgba(234, 168, 36, 0.15)';
  const borderColor = isDanger ? THEME.colors.statusDanger : THEME.colors.statusWarning;
  const textColor = isDanger ? '#FF6B6B' : '#FCD34D';

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <Text style={[styles.header, { color: textColor }]}>
        {isDanger ? '⚠️ STOP! NIE ROZLEWAJ! (ZAGROŻENIE WYBUCHEM)' : '⚠️ OSTRZEŻENIE O CIŚNIENIU'}
      </Text>
      <Text style={styles.message}>{risk.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginVertical: THEME.spacing.md
  },
  header: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  message: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500'
  }
});
