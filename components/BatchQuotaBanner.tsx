/**
 * Piwowar (Brewcraft) — BatchQuotaBanner Component
 * DEC-06: Freemium Quota Notice (3 free batches) & Ethical Read-Only Notice
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getAccessState } from '../lib/access';
import { THEME } from '../lib/theme';

export interface BatchQuotaBannerProps {
  totalBatches: number;
  isPro: boolean;
  onUpgradePress?: () => void;
}

export const BatchQuotaBanner: React.FC<BatchQuotaBannerProps> = ({
  totalBatches,
  isPro,
  onUpgradePress
}) => {
  const access = getAccessState(totalBatches, isPro);

  if (access.isPro) {
    return (
      <View style={[styles.container, styles.proContainer]}>
        <Text style={styles.proBadge}>PRO</Text>
        <Text style={styles.proText}>Apps4Brew Pass: Nielimitowane warki i telemetria</Text>
      </View>
    );
  }

  if (access.batchesRemaining > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.quotaText}>
          Darmowy pakiet startowy: pozostało{' '}
          <Text style={styles.boldText}>{access.batchesRemaining} z 3</Text> warek Pro
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.exhaustedContainer]}>
      <Text style={styles.exhaustedTitle}>Wykorzystano 3 darmowe warki</Text>
      <Text style={styles.exhaustedSubtitle}>
        Dotychczasowe warki i notatki pozostają bezpłatnie w trybie do odczytu. Kolejne warki
        wymagają Apps4Brew Pass.
      </Text>
      {onUpgradePress && (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={onUpgradePress}
          accessibilityRole="button"
          accessibilityLabel="Odblokuj Apps4Brew Pass"
        >
          <Text style={styles.upgradeButtonText}>Odblokuj Apps4Brew Pass (od 0,99 €/msc)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.bgSurface,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md
  },
  proContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: THEME.colors.accentHop
  },
  proBadge: {
    backgroundColor: THEME.colors.accentHop,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: THEME.spacing.sm
  },
  proText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  quotaText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center'
  },
  boldText: {
    color: THEME.colors.accentPrimary,
    fontWeight: '700'
  },
  exhaustedContainer: {
    borderColor: THEME.colors.accentPrimary
  },
  exhaustedTitle: {
    color: THEME.colors.accentPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4
  },
  exhaustedSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: THEME.spacing.sm
  },
  upgradeButton: {
    backgroundColor: THEME.colors.accentPrimary,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center'
  },
  upgradeButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700'
  }
});
