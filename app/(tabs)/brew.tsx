/**
 * Piwowar (Brewcraft) — Focused Active Brew View (BR-WARZ-001..003)
 * Giant 64pt timer, Kitchen-Proof Thumb Zone controls, and Just-in-Time strike water & hop alerts
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform
} from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { useBrewStore } from '../../lib/store/brewStore';
import { CraftHeader } from '../../components/CraftHeader';
import { CraftButton } from '../../components/CraftButton';
import { CraftCard } from '../../components/CraftCard';
import { CraftInput } from '../../components/CraftInput';
import { calculateStrikeWaterTemp } from '../../lib/brewing/strikeWater';
import { correctRefractometerFinalGravity } from '../../lib/brewing/refractometer';
import { SEED_SAMPLE_RECIPE } from '../../lib/db/seeds';
import { startBrewLiveActivity, updateBrewLiveActivity, endBrewLiveActivity } from '../../lib/native/liveActivities';
import { syncBrewSessionToWatch } from '../../lib/native/watchConnectivity';
import { THEME } from '../../lib/theme';
import { t } from '../../lib/i18n';

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function BrewScreen() {
  const {
    isActive,
    stage,
    recipe,
    currentStepIndex,
    steps,
    secondsRemaining,
    isRunning,
    hopAlert,
    startBrew,
    pauseResume,
    nextStep,
    adjustSeconds,
    tick,
    dismissHopAlert,
    stopBrew
  } = useBrewStore();

  // In-flight measurement state
  const [showMeasure, setShowMeasure] = useState(false);
  const [inBrixOb, setInBrixOb] = useState('12.0');
  const [inBrixFb, setInBrixFb] = useState('6.0');

  // Strike water quick calc state
  const [mashTempInput, setMashTempInput] = useState('67.0');
  const [grainTempInput, setGrainTempInput] = useState('20.0');
  const [ratioInput, setRatioInput] = useState('3.0');

  // Ticking timer
  useEffect(() => {
    let timer: any = null;
    if (isRunning) {
      if (Platform.OS !== 'web') {
        activateKeepAwakeAsync().catch(() => {});
      }
      timer = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (Platform.OS !== 'web') {
        deactivateKeepAwake().catch(() => {});
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, tick]);

  // Synchronize Live Activities (Dynamic Island / Lock Screen) & Apple Watch
  useEffect(() => {
    if (isActive && recipe) {
      const stepItem = steps[currentStepIndex];
      startBrewLiveActivity({
        recipeName: recipe.name,
        batchVolumeL: recipe.target_volume_l,
        stageName: stage,
        stepName: stepItem?.name || 'Zacieranie',
        durationSeconds: secondsRemaining,
        isRunning,
        nextHopName: hopAlert?.name,
        nextHopWeightG: hopAlert?.weightG
      }).catch(() => {});

      syncBrewSessionToWatch({
        recipeName: recipe.name,
        stepName: stepItem?.name || 'Zacieranie',
        secondsRemaining,
        isRunning,
        triggerTaptic: !!hopAlert
      }).catch(() => {});
    } else {
      endBrewLiveActivity().catch(() => {});
    }
  }, [isActive, stage, currentStepIndex, isRunning, secondsRemaining, hopAlert]);

  const handlePauseResume = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
    pauseResume();
  };

  const handleNextStep = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    nextStep();
  };

  const handleAdjust = async (deltaSec: number) => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    adjustSeconds(deltaSec);
  };

  const currentStep = steps[currentStepIndex];
  const strikeTemp = calculateStrikeWaterTemp(
    parseFloat(mashTempInput) || 67,
    parseFloat(grainTempInput) || 20,
    parseFloat(ratioInput) || 3.0
  );

  const refResult = correctRefractometerFinalGravity(
    parseFloat(inBrixOb) || 12.0,
    parseFloat(inBrixFb) || 6.0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <CraftHeader
        title={t('brew_title')}
        subtitle={
          isActive
            ? `${recipe?.name || 'Warka w toku'} • Krok ${currentStepIndex + 1}/${steps.length}`
            : t('brew_status_idle')
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {!isActive ? (
          /* IDLE / START VIEW */
          <View>
            <CraftCard highlightBorder>
              <Text style={styles.idleTitle}>Gotowy na warzenie?</Text>
              <Text style={styles.idleDesc}>
                Wybierz recepturę i rozpocznij asystenta krok po kroku z sygnałami audio,
                odliczaniem przerw zacierania i alertami dodawania chmielu.
              </Text>

              <View style={styles.recipePreview}>
                <Text style={styles.recipeName}>{SEED_SAMPLE_RECIPE.name}</Text>
                <Text style={styles.recipeSpecs}>
                  20.0 L • {SEED_SAMPLE_RECIPE.target_og_sg} SG • {SEED_SAMPLE_RECIPE.target_ibu} IBU
                </Text>
              </View>

              <CraftButton
                label="Rozpocznij dzień warzenia"
                onPress={() => startBrew(SEED_SAMPLE_RECIPE)}
                variant="primary"
                style={{ marginTop: THEME.spacing.md }}
              />
            </CraftCard>

            {/* Just-In-Time Strike Water Card (DEC-12) */}
            <CraftCard>
              <Text style={styles.sectionHeader}>🌡️ Woda Zacierna (Strike Water)</Text>
              <Text style={styles.sectionDesc}>
                Sprawdź wymaganą temperaturę wody przed wsypaniem słodu do garnka lub kociołka:
              </Text>

              <View style={styles.inlineInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <CraftInput
                    label="Docelowe T"
                    unit="°C"
                    value={mashTempInput}
                    onChangeText={setMashTempInput}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <CraftInput
                    label="Temp. słodu"
                    unit="°C"
                    value={grainTempInput}
                    onChangeText={setGrainTempInput}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <CraftInput
                    label="Stosunek"
                    unit="L/kg"
                    value={ratioInput}
                    onChangeText={setRatioInput}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.strikeResultBadge}>
                <Text style={styles.strikeResultLabel}>Temperatura wody zaciernej:</Text>
                <Text style={styles.strikeResultValue}>{strikeTemp} °C</Text>
              </View>
            </CraftCard>
          </View>
        ) : (
          /* ACTIVE FOCUSED BREW VIEW */
          <View>
            {/* Hop Alert Banner (BR-WARZ-002) */}
            {hopAlert && (
              <View style={styles.hopAlertCard}>
                <Text style={styles.hopAlertHeader}>🌿 {t('brew_hop_alert_title')}</Text>
                <Text style={styles.hopAlertBody}>
                  {hopAlert.name} — <Text style={styles.bold}>{hopAlert.weightG} g</Text>
                </Text>
                <CraftButton
                  label="Odznacz dodanie"
                  onPress={dismissHopAlert}
                  variant="primary"
                  style={{ minHeight: 44, marginTop: 8 }}
                />
              </View>
            )}

            {/* Step info badge */}
            <View style={styles.stepInfoContainer}>
              <View style={styles.stageTag}>
                <Text style={styles.stageTagText}>
                  {stage === 'mashing'
                    ? 'ZACIERANIE'
                    : stage === 'boiling'
                    ? 'GOTOWANIE'
                    : 'WHIRLPOOL'}
                </Text>
              </View>
              <Text style={styles.stepName}>{currentStep?.name}</Text>
              {currentStep?.tempC && (
                <Text style={styles.stepTemp}>Docelowo: {currentStep.tempC} °C</Text>
              )}
            </View>

            {/* Giant 64pt Timer Display */}
            <View style={styles.timerDisplayContainer}>
              <Text style={styles.timerDigits}>{formatTimer(secondsRemaining)}</Text>
              <Text style={styles.timerStatus}>
                {isRunning ? 'ODLICZANIE W TOKU' : 'WSTRZYMANO (PAUZA)'}
              </Text>
            </View>

            {/* In-Flight Gravity Measurement Accordion */}
            <CraftCard>
              <CraftButton
                label={showMeasure ? 'Zamknij pomiar refraktometru' : '🔬 Zmierz ekstrakt w locie (2 krople)'}
                onPress={() => setShowMeasure(!showMeasure)}
                variant="secondary"
                style={{ minHeight: 44 }}
              />

              {showMeasure && (
                <View style={{ marginTop: 12 }}>
                  <View style={styles.inlineInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <CraftInput
                        label="Początkowy"
                        unit="°Brix"
                        value={inBrixOb}
                        onChangeText={setInBrixOb}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <CraftInput
                        label="Aktualny"
                        unit="°Brix"
                        value={inBrixFb}
                        onChangeText={setInBrixFb}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View style={styles.measureResultBox}>
                    <Text style={styles.measureResultText}>
                      Skorygowana gęstość (Terrill WCF=1.04):{' '}
                      <Text style={styles.bold}>{refResult.fgPlato} °P</Text> ({refResult.fgSg} SG)
                    </Text>
                  </View>
                </View>
              )}
            </CraftCard>

            <CraftButton
              label="Zakończ dzień warzenia"
              onPress={stopBrew}
              variant="secondary"
              style={{ marginVertical: 8, minHeight: 44 }}
            />
          </View>
        )}
      </ScrollView>

      {/* Thumb Zone Kitchen-Proof Controls (BR-WARZ-003) */}
      {isActive && (
        <View style={styles.thumbZoneContainer}>
          <View style={styles.thumbZoneRow}>
            <CraftButton
              label={t('brew_minus_min')}
              onPress={() => handleAdjust(-60)}
              variant="secondary"
              style={styles.pillButton}
            />
            <CraftButton
              label={isRunning ? `▌▌ ${t('brew_pause')}` : `▶ ${t('brew_resume')}`}
              onPress={handlePauseResume}
              variant="primary"
              style={styles.mainActionButton}
            />
            <CraftButton
              label={t('brew_plus_min')}
              onPress={() => handleAdjust(60)}
              variant="secondary"
              style={styles.pillButton}
            />
          </View>

          <CraftButton
            label={t('brew_next_step')}
            onPress={handleNextStep}
            variant="hop"
            style={{ marginTop: 8 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bgCanvas
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 160
  },
  idleTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6
  },
  idleDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20
  },
  recipePreview: {
    backgroundColor: THEME.colors.bgCanvas,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    marginTop: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle
  },
  recipeName: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  recipeSpecs: {
    color: THEME.colors.accentPrimary,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600'
  },
  sectionHeader: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  sectionDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginBottom: 12
  },
  inlineInputs: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  strikeResultBadge: {
    backgroundColor: 'rgba(229, 138, 43, 0.15)',
    borderWidth: 1,
    borderColor: THEME.colors.accentPrimary,
    borderRadius: THEME.borderRadius.sm,
    padding: THEME.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  strikeResultLabel: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  strikeResultValue: {
    color: THEME.colors.accentPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  stepInfoContainer: {
    alignItems: 'center',
    marginBottom: THEME.spacing.md
  },
  stageTag: {
    backgroundColor: THEME.colors.accentHop,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6
  },
  stageTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  stepName: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center'
  },
  stepTemp: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    marginTop: 4
  },
  timerDisplayContainer: {
    backgroundColor: THEME.colors.bgSurface,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: THEME.spacing.xl,
    alignItems: 'center',
    marginBottom: THEME.spacing.lg
  },
  timerDigits: {
    color: THEME.colors.textPrimary,
    fontSize: 68,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2
  },
  timerStatus: {
    color: THEME.colors.accentPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 6
  },
  hopAlertCard: {
    backgroundColor: 'rgba(234, 168, 36, 0.2)',
    borderWidth: 2,
    borderColor: THEME.colors.statusWarning,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md
  },
  hopAlertHeader: {
    color: THEME.colors.statusWarning,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  hopAlertBody: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 4
  },
  bold: {
    fontWeight: '800'
  },
  measureResultBox: {
    backgroundColor: THEME.colors.bgCanvas,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginTop: 4
  },
  measureResultText: {
    color: THEME.colors.textPrimary,
    fontSize: 13
  },
  thumbZoneContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.bgCanvas,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    paddingBottom: THEME.spacing.md
  },
  thumbZoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pillButton: {
    width: 90,
    minHeight: 52
  },
  mainActionButton: {
    flex: 1,
    marginHorizontal: 8,
    minHeight: 56
  }
});
