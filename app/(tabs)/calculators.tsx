/**
 * Piwowar (Brewcraft) — Pocket Lab (Calculators Screen)
 * High-precision brewing calculators: Terrill Refractometer, NIST Hydrometer,
 * Tinseth IBU, Morey Color, Palmer Strike Water, Priming & Bottle Bomb Blocker, Water Chemistry.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { CraftHeader } from '../../components/CraftHeader';
import { CraftCard } from '../../components/CraftCard';
import { CraftInput } from '../../components/CraftInput';
import { BottleBombAlert } from '../../components/BottleBombAlert';
import {
  correctRefractometerFinalGravity,
  correctHydrometerTemp,
  calculateHopIbuTinseth,
  calculateSrmFromMcu,
  calculateEbcFromSrm,
  srmToHex,
  calculateStrikeWaterTemp,
  calculatePrimingSugar,
  checkBottleBombRisk,
  calculateWaterAdditions,
  calculateSulfateToChlorideRatio,
  calculateLacticAcidAddition
} from '../../lib/brewing';
import { THEME } from '../../lib/theme';
import { t } from '../../lib/i18n';

type CalcTab = 'refractometer' | 'hydrometer' | 'priming' | 'water' | 'ibu' | 'strike';

export default function CalculatorsScreen() {
  const [selectedCalc, setSelectedCalc] = useState<CalcTab>('refractometer');

  // 1. Refractometer state
  const [refOb, setRefOb] = useState('12.5');
  const [refFb, setRefFb] = useState('6.2');
  const [refWcf, setRefWcf] = useState('1.04');

  // 2. Hydrometer state
  const [hydSg, setHydSg] = useState('1.046');
  const [hydTemp, setHydTemp] = useState('50.0');
  const [hydCalib, setHydCalib] = useState('20.0');

  // 3. Priming & Bottle Bomb state
  const [primeVol, setPrimeVol] = useState('20.0');
  const [primeTemp, setPrimeTemp] = useState('20.0');
  const [primeTargetVco2, setPrimeTargetVco2] = useState('2.4');
  const [primeCurrentPlato, setPrimeCurrentPlato] = useState('2.5');
  const [primeExpectedPlato, setPrimeExpectedPlato] = useState('2.4');
  const [primeSugarType, setPrimeSugarType] = useState<'sucrose' | 'dextrose' | 'dme'>('sucrose');

  // 4. Water state
  const [waterVol, setWaterVol] = useState('20.0');
  const [gypsumG, setGypsumG] = useState('4.0');
  const [cacl2G, setCacl2G] = useState('2.0');
  const [mashPhCurrent, setMashPhCurrent] = useState('5.8');
  const [mashPhTarget, setMashPhTarget] = useState('5.3');

  // 5. IBU state
  const [ibuVol, setIbuVol] = useState('20.0');
  const [ibuSg, setIbuSg] = useState('1.050');
  const [ibuWeight, setIbuWeight] = useState('30.0');
  const [ibuAlpha, setIbuAlpha] = useState('10.0');
  const [ibuMins, setIbuMins] = useState('60');

  // 6. Strike water state
  const [strikeMashTarget, setStrikeMashTarget] = useState('67.0');
  const [strikeGrainTemp, setStrikeGrainTemp] = useState('20.0');
  const [strikeRatio, setStrikeRatio] = useState('3.0');

  // Calculations
  const refRes = correctRefractometerFinalGravity(
    parseFloat(refOb) || 0,
    parseFloat(refFb) || 0,
    parseFloat(refWcf) || 1.04
  );

  const hydRes = correctHydrometerTemp(
    parseFloat(hydSg) || 1.0,
    parseFloat(hydTemp) || 20,
    parseFloat(hydCalib) || 20
  );

  const primeRes = calculatePrimingSugar(
    parseFloat(primeVol) || 0,
    parseFloat(primeTemp) || 20,
    parseFloat(primeTargetVco2) || 2.4,
    primeSugarType
  );

  const bombRisk = checkBottleBombRisk(
    parseFloat(primeCurrentPlato) || 0,
    parseFloat(primeExpectedPlato) || 0,
    parseFloat(primeTargetVco2) || 2.4
  );

  const waterRes = calculateWaterAdditions(parseFloat(waterVol) || 20, {
    gypsumGrams: parseFloat(gypsumG) || 0,
    calciumChlorideGrams: parseFloat(cacl2G) || 0
  });

  const waterRatio = calculateSulfateToChlorideRatio(waterRes.so4, waterRes.cl);

  const lacticAcidRes = calculateLacticAcidAddition(
    parseFloat(waterVol) || 20,
    parseFloat(mashPhCurrent) || 5.8,
    parseFloat(mashPhTarget) || 5.3
  );

  const ibuRes = calculateHopIbuTinseth(
    parseFloat(ibuVol) || 20,
    parseFloat(ibuSg) || 1.05,
    parseFloat(ibuWeight) || 0,
    parseFloat(ibuAlpha) || 0,
    parseInt(ibuMins, 10) || 0,
    'pellet'
  );

  const strikeRes = calculateStrikeWaterTemp(
    parseFloat(strikeMashTarget) || 67,
    parseFloat(strikeGrainTemp) || 20,
    parseFloat(strikeRatio) || 3.0
  );

  const calcTabs: Array<{ id: CalcTab; label: string }> = [
    { id: 'refractometer', label: 'Refraktometr' },
    { id: 'priming', label: 'Butelkowanie' },
    { id: 'water', label: 'Woda & pH' },
    { id: 'hydrometer', label: 'Areometr' },
    { id: 'ibu', label: 'IBU' },
    { id: 'strike', label: 'Woda zacierna' }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <CraftHeader title={t('calc_title')} />

      {/* Calculator Selector Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContainer}
      >
        {calcTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.calcPill, selectedCalc === tab.id && styles.calcPillActive]}
            onPress={() => setSelectedCalc(tab.id)}
          >
            <Text
              style={[
                styles.calcPillText,
                selectedCalc === tab.id && styles.calcPillTextActive
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 1. REFRACTOMETER */}
        {selectedCalc === 'refractometer' && (
          <CraftCard highlightBorder>
            <Text style={styles.cardTitle}>{t('calc_refractometer')}</Text>
            <Text style={styles.cardDesc}>
              Korekta odczytu refraktometru w obecności alkoholu wielomianem Seana Terrilla z
              domyślnym współczynnikiem brzeczki WCF = 1.04 (DEC-08).
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Początkowy (OG)"
                  unit="°Brix"
                  value={refOb}
                  onChangeText={setRefOb}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Końcowy (FG)"
                  unit="°Brix"
                  value={refFb}
                  onChangeText={setRefFb}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 80 }}>
                <CraftInput
                  label="WCF"
                  value={refWcf}
                  onChangeText={setRefWcf}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Rzeczywista gęstość końcowa:</Text>
              <Text style={styles.resultValue}>{refRes.fgPlato} °P</Text>
              <Text style={styles.resultSubValue}>Specific Gravity: {refRes.fgSg} SG</Text>
            </View>
          </CraftCard>
        )}

        {/* 2. PRIMING & BOTTLE BOMB BLOCKER */}
        {selectedCalc === 'priming' && (
          <CraftCard highlightBorder>
            <Text style={styles.cardTitle}>{t('calc_priming')}</Text>
            <Text style={styles.cardDesc}>
              Obliczenie cukru do refermentacji z wielomianem rozpuszczalności CO2 deClercka oraz
              aktywną ochroną przed eksplozją butelek (BR-BOT-001..002).
            </Text>

            <BottleBombAlert risk={bombRisk} />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Objętość piwa"
                  unit="L"
                  value={primeVol}
                  onChangeText={setPrimeVol}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Temp. piwa"
                  unit="°C"
                  value={primeTemp}
                  onChangeText={setPrimeTemp}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Docelowe CO2"
                  unit="vol"
                  value={primeTargetVco2}
                  onChangeText={setPrimeTargetVco2}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Aktualne FG"
                  unit="°P"
                  value={primeCurrentPlato}
                  onChangeText={setPrimeCurrentPlato}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Oczekiwane FG"
                  unit="°P"
                  value={primeExpectedPlato}
                  onChangeText={setPrimeExpectedPlato}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Sugar type pills */}
            <View style={styles.sugarSelector}>
              {(['sucrose', 'dextrose', 'dme'] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.sugarPill,
                    primeSugarType === st && styles.sugarPillActive
                  ]}
                  onPress={() => setPrimeSugarType(st)}
                >
                  <Text
                    style={[
                      styles.sugarPillText,
                      primeSugarType === st && styles.sugarPillTextActive
                    ]}
                  >
                    {st === 'sucrose'
                      ? 'Sacharoza'
                      : st === 'dextrose'
                      ? 'Glukoza'
                      : 'Ekstrakt DME'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Wymagana masa surowca:</Text>
              <Text style={styles.resultValue}>{primeRes.grams} g</Text>
              <Text style={styles.resultSubValue}>
                {primeRes.gramsPerLiter} g/L • {primeRes.gramsPerHalfLiterBottle} g / butelka 0.5L
              </Text>
              <Text style={styles.resultDetail}>
                Rozpuszczony resztkowy CO2: {primeRes.residualVCO2} vol
              </Text>
            </View>
          </CraftCard>
        )}

        {/* 3. WATER CHEMISTRY */}
        {selectedCalc === 'water' && (
          <CraftCard highlightBorder>
            <Text style={styles.cardTitle}>{t('calc_water')}</Text>
            <Text style={styles.cardDesc}>
              Mineralizacja 6 kluczowych jonów solami piwowarskimi oraz dozowanie kwasu
              mlekowego 80% do zbicia pH zacieru (DEC-14, BR-WODA-001..002).
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Objętość wody"
                  unit="L"
                  value={waterVol}
                  onChangeText={setWaterVol}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Gips (CaSO4)"
                  unit="g"
                  value={gypsumG}
                  onChangeText={setGypsumG}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="CaCl2"
                  unit="g"
                  value={cacl2G}
                  onChangeText={setCacl2G}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.waterIonsGrid}>
              <Text style={styles.ionText}>Ca: {waterRes.ca} ppm</Text>
              <Text style={styles.ionText}>SO4: {waterRes.so4} ppm</Text>
              <Text style={styles.ionText}>Cl: {waterRes.cl} ppm</Text>
              <Text style={styles.ionText}>Mg: {waterRes.mg} ppm</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Stosunek Siarczany / Chlorki (SO4 / Cl):</Text>
              <Text style={styles.resultValue}>{waterRatio.ratio}</Text>
              <Text style={styles.resultSubValue}>{waterRatio.description}</Text>
            </View>

            <Text style={[styles.cardTitle, { marginTop: 16 }]}>Zakwaszanie Zacieru</Text>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Aktualne pH"
                  value={mashPhCurrent}
                  onChangeText={setMashPhCurrent}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Docelowe pH"
                  value={mashPhTarget}
                  onChangeText={setMashPhTarget}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Dawka kwasu mlekowego 80%:</Text>
              <Text style={styles.resultValue}>{lacticAcidRes} ml</Text>
            </View>
          </CraftCard>
        )}

        {/* 4. HYDROMETER */}
        {selectedCalc === 'hydrometer' && (
          <CraftCard highlightBorder>
            <Text style={styles.cardTitle}>{t('calc_hydrometer')}</Text>
            <Text style={styles.cardDesc}>
              Korekta areometru szklanego względem temperatury zacieru i brzeczki (NIST).
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Odczyt SG"
                  value={hydSg}
                  onChangeText={setHydSg}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Temp. próbki"
                  unit="°C"
                  value={hydTemp}
                  onChangeText={setHydTemp}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 80 }}>
                <CraftInput
                  label="Kalibracja"
                  unit="°C"
                  value={hydCalib}
                  onChangeText={setHydCalib}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Skorygowana gęstość rzeczywista:</Text>
              <Text style={styles.resultValue}>{hydRes} SG</Text>
            </View>
          </CraftCard>
        )}

        {/* 5. IBU */}
        {selectedCalc === 'ibu' && (
          <CraftCard highlightBorder>
            <Text style={styles.cardTitle}>{t('calc_ibu')}</Text>
            <Text style={styles.cardDesc}>
              Formuła Glenna Tinsetha utylizacji alfa-kwasów w kotle warzelnym.
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Warka"
                  unit="L"
                  value={ibuVol}
                  onChangeText={setIbuVol}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Gęstość"
                  unit="SG"
                  value={ibuSg}
                  onChangeText={setIbuSg}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Waga"
                  unit="g"
                  value={ibuWeight}
                  onChangeText={setIbuWeight}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Alfa-kwasy"
                  unit="%"
                  value={ibuAlpha}
                  onChangeText={setIbuAlpha}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Czas"
                  unit="min"
                  value={ibuMins}
                  onChangeText={setIbuMins}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Wyliczona goryczka:</Text>
              <Text style={styles.resultValue}>{ibuRes} IBU</Text>
            </View>
          </CraftCard>
        )}

        {/* 6. STRIKE WATER */}
        {selectedCalc === 'strike' && (
          <CraftCard highlightBorder>
            <Text style={styles.cardTitle}>{t('calc_strike')}</Text>
            <Text style={styles.cardDesc}>
              Termodynamiczny model Johna Palmera bilansu cieplnego słodu i wody.
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Docelowe T"
                  unit="°C"
                  value={strikeMashTarget}
                  onChangeText={setStrikeMashTarget}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Temp. słodu"
                  unit="°C"
                  value={strikeGrainTemp}
                  onChangeText={setStrikeGrainTemp}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Stosunek"
                  unit="L/kg"
                  value={strikeRatio}
                  onChangeText={setStrikeRatio}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Temperatura wody zaciernej:</Text>
              <Text style={styles.resultValue}>{strikeRes} °C</Text>
            </View>
          </CraftCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bgCanvas
  },
  tabsScroll: {
    maxHeight: 50,
    backgroundColor: THEME.colors.bgCanvas,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle
  },
  tabsContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row'
  },
  calcPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.bgSurface,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle
  },
  calcPillActive: {
    backgroundColor: THEME.colors.accentPrimary,
    borderColor: THEME.colors.accentPrimary
  },
  calcPillText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700'
  },
  calcPillTextActive: {
    color: '#000000'
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 80
  },
  cardTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4
  },
  cardDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sugarSelector: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10
  },
  sugarPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.bgCanvas,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center'
  },
  sugarPillActive: {
    borderColor: THEME.colors.accentPrimary,
    backgroundColor: 'rgba(229, 138, 43, 0.15)'
  },
  sugarPillText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  sugarPillTextActive: {
    color: THEME.colors.accentPrimary,
    fontWeight: '700'
  },
  waterIonsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.bgCanvas,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginBottom: 12
  },
  ionText: {
    color: THEME.colors.accentPrimary,
    fontWeight: '700',
    fontSize: 13
  },
  resultBox: {
    backgroundColor: THEME.colors.bgCanvas,
    borderWidth: 1,
    borderColor: THEME.colors.accentPrimary,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginTop: 8,
    alignItems: 'center'
  },
  resultLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  resultValue: {
    color: THEME.colors.accentPrimary,
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 4
  },
  resultSubValue: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  resultDetail: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 4
  }
});
