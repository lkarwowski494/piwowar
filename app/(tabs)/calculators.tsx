/**
 * Piwowar (Brewcraft) — Pocket Lab (Calculators Screen)
 * High-precision brewing calculators: Terrill Refractometer, NIST Hydrometer,
 * Tinseth/Rager/Garetz IBU, Palmer Strike Water, Priming & Bottle Bomb Blocker, Water Chemistry & pH,
 * Yeast Starter, Kegging CO2, Spunding, Hop Aging, Hop Stand / Dip Hopping, Chiller, iSpindel.
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
  calculateHopIbuByFormula,
  IbuFormula,
  calculateStrikeWaterTemp,
  calculatePrimingSugar,
  checkBottleBombRisk,
  calculateWaterAdditions,
  calculateSulfateToChlorideRatio,
  calculateLacticAcidAddition,
  calculateYeastStarter,
  calculateKegPressure,
  calculateSpundingPressure,
  calculateHopAging,
  calculateHopStandDipHopping,
  calculateChillerPerformance,
  calculateIspindelSg,
  calculateAbv,
  brixToSg,
  sgToPlato
} from '../../lib/brewing';
import { THEME } from '../../lib/theme';
import { t } from '../../lib/i18n';

type CalcTab =
  | 'refractometer'
  | 'priming'
  | 'water'
  | 'hydrometer'
  | 'ibu'
  | 'strike'
  | 'starter'
  | 'kegging'
  | 'spunding'
  | 'hop_aging'
  | 'hop_stand'
  | 'chiller'
  | 'ispindel';

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
  const [ibuFormula, setIbuFormula] = useState<IbuFormula>('tinseth');

  // 6. Strike water state
  const [strikeMashTarget, setStrikeMashTarget] = useState('67.0');
  const [strikeGrainTemp, setStrikeGrainTemp] = useState('20.0');
  const [strikeRatio, setStrikeRatio] = useState('3.0');

  // 7. Starter state
  const [starterInitialCells, setStarterInitialCells] = useState('100');
  const [starterTargetCells, setStarterTargetCells] = useState('220');
  const [starterVolL, setStarterVolL] = useState('1.5');
  const [starterAeration, setStarterAeration] = useState<'stir_plate' | 'shaken' | 'still'>('stir_plate');

  // 8. Kegging state
  const [kegTargetVco2, setKegTargetVco2] = useState('2.4');
  const [kegTempC, setKegTempC] = useState('4.0');

  // 9. Spunding state
  const [spundTargetVco2, setSpundTargetVco2] = useState('2.5');
  const [spundTempC, setSpundTempC] = useState('12.0');
  const [spundExpectedFg, setSpundExpectedFg] = useState('1.010');

  // 10. Hop aging state
  const [hopAgeInitialAlpha, setHopAgeInitialAlpha] = useState('12.5');
  const [hopAgeMonths, setHopAgeMonths] = useState('14');
  const [hopAgeTemp, setHopAgeTemp] = useState<'freezer' | 'fridge' | 'room' | 'warm'>('fridge');
  const [hopAgePkg, setHopAgePkg] = useState<'vacuum_foil' | 'ziploc' | 'open'>('vacuum_foil');

  // 11. Hop stand / Dip hop state
  const [lateHopTemp, setLateHopTemp] = useState('80');
  const [lateHopMins, setLateHopMins] = useState('25');
  const [lateHopWeight, setLateHopWeight] = useState('50');
  const [lateHopAlpha, setLateHopAlpha] = useState('13.0');
  const [lateHopTech, setLateHopTech] = useState<'whirlpool' | 'hop_stand' | 'dip_hopping'>('hop_stand');

  // 12. Chiller state
  const [chillerWortVol, setChillerWortVol] = useState('20');
  const [chillerTapTemp, setChillerTapTemp] = useState('12');
  const [chillerTargetTemp, setChillerTargetTemp] = useState('18');
  const [chillerType, setChillerType] = useState<'immersion' | 'counterflow' | 'plate'>('immersion');

  // 13. iSpindel state
  const [ispindelAngle, setIspindelAngle] = useState('48.5');

  // Calculations
  const refRes = correctRefractometerFinalGravity(
    parseFloat(refOb) || 0,
    parseFloat(refFb) || 0,
    parseFloat(refWcf) || 1.04
  );
  const refOgSg = brixToSg((parseFloat(refOb) || 0) / (parseFloat(refWcf) || 1.04));
  const refAbv = calculateAbv(refOgSg, refRes.fgSg);

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

  const ibuRes = calculateHopIbuByFormula(
    ibuFormula,
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

  const starterRes = calculateYeastStarter({
    initialCellsBillion: parseFloat(starterInitialCells) || 100,
    targetCellsBillion: parseFloat(starterTargetCells) || 200,
    starterVolumeL: parseFloat(starterVolL) || 1.5,
    aerationMethod: starterAeration
  });

  const kegRes = calculateKegPressure({
    targetVco2: parseFloat(kegTargetVco2) || 2.4,
    kegTempC: parseFloat(kegTempC) || 4.0
  });

  const spundRes = calculateSpundingPressure({
    targetVco2: parseFloat(spundTargetVco2) || 2.5,
    fermentationTempC: parseFloat(spundTempC) || 12.0,
    expectedFgSg: parseFloat(spundExpectedFg) || 1.010
  });

  const hopAgeRes = calculateHopAging({
    initialAlphaPct: parseFloat(hopAgeInitialAlpha) || 12.5,
    monthsInStorage: parseFloat(hopAgeMonths) || 12,
    storageTemp: hopAgeTemp,
    packaging: hopAgePkg
  });

  const lateHopRes = calculateHopStandDipHopping({
    technique: lateHopTech,
    tempC: parseFloat(lateHopTemp) || 80,
    durationMins: parseFloat(lateHopMins) || 20,
    hopWeightG: parseFloat(lateHopWeight) || 50,
    alphaPct: parseFloat(lateHopAlpha) || 13,
    batchVolL: 20
  });

  const chillerRes = calculateChillerPerformance({
    wortVolumeL: parseFloat(chillerWortVol) || 20,
    tapWaterTempC: parseFloat(chillerTapTemp) || 12,
    targetPitchTempC: parseFloat(chillerTargetTemp) || 18,
    chillerType: chillerType
  });

  const ispindelSg = calculateIspindelSg(parseFloat(ispindelAngle) || 45);

  const calcTabs: Array<{ id: CalcTab; label: string }> = [
    { id: 'refractometer', label: 'Refraktometr' },
    { id: 'priming', label: 'Butelkowanie' },
    { id: 'water', label: 'Woda & pH' },
    { id: 'hydrometer', label: 'Areometr' },
    { id: 'ibu', label: 'IBU (Tinseth/Rager)' },
    { id: 'strike', label: 'Woda zacierna' },
    { id: 'starter', label: 'Starter drożdży' },
    { id: 'kegging', label: 'Keg & CO2' },
    { id: 'spunding', label: 'Spunding' },
    { id: 'hop_aging', label: 'Starzenie chmielu' },
    { id: 'hop_stand', label: 'Hop Stand / Dip' },
    { id: 'chiller', label: 'Chłodnica' },
    { id: 'ispindel', label: 'iSpindel' }
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Refractometer */}
        {selectedCalc === 'refractometer' && (
          <CraftCard title={t('calc_refractometer')} subtitle="Algorytm Seana Terrilla z korektą alkoholu">
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Ekstrakt początkowy (OG)"
                  unit="°Brix"
                  value={refOb}
                  onChangeText={setRefOb}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Odczyt końcowy (FG)"
                  unit="°Brix"
                  value={refFb}
                  onChangeText={setRefFb}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Współczynnik (WCF)"
                  unit=""
                  value={refWcf}
                  onChangeText={setRefWcf}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Prawdziwe FG</Text>
                  <Text style={styles.metricValue}>{refRes.fgSg.toFixed(3)} SG</Text>
                  <Text style={styles.metricSub}>{refRes.fgPlato.toFixed(1)} °Plato</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Alkohol</Text>
                  <Text style={[styles.metricValue, { color: THEME.colors.primary }]}>
                    {refAbv.toFixed(1)}%
                  </Text>
                  <Text style={styles.metricSub}>objętościowo</Text>
                </View>
              </View>
            </View>
          </CraftCard>
        )}

        {/* 2. Priming & Bottle Bomb Blocker */}
        {selectedCalc === 'priming' && (
          <CraftCard title={t('calc_priming')} subtitle="Dawkowanie cukru & Bottle Bomb Blocker">
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Objętość warki"
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

            <View style={styles.sugarSelector}>
              {(['sucrose', 'dextrose', 'dme'] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.sugarPill, primeSugarType === st && styles.sugarPillActive]}
                  onPress={() => setPrimeSugarType(st)}
                >
                  <Text style={[styles.sugarPillText, primeSugarType === st && styles.sugarPillTextActive]}>
                    {st === 'sucrose' ? 'Sacharoza' : st === 'dextrose' ? 'Glukoza' : 'Suchy Ekstrakt (DME)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <BottleBombAlert risk={bombRisk} />

            <View style={styles.resultBox}>
              <Text style={styles.metricLabel}>Wymagana gramatura surowca</Text>
              <Text style={[styles.metricValueLarge, { color: THEME.colors.primary }]}>
                {primeRes.grams} g
              </Text>
              <Text style={styles.metricSub}>
                Rozpuść w ok. 150-200 ml wrzącej wody i ostudź przed dodaniem do rozlewu.
              </Text>
            </View>
          </CraftCard>
        )}

        {/* 3. Water & pH */}
        {selectedCalc === 'water' && (
          <CraftCard title={t('calc_water')} subtitle="Mineralizacja wody solami i pH zacieru">
            <CraftInput
              label="Objętość wody"
              unit="L"
              value={waterVol}
              onChangeText={setWaterVol}
              keyboardType="numeric"
            />

            <View style={styles.row}>
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
                  label="Chlorek wapnia (CaCl2)"
                  unit="g"
                  value={cacl2G}
                  onChangeText={setCacl2G}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.metricLabel}>Stosunek Siarczanów do Chlorków (SO4 / Cl)</Text>
              <Text style={[styles.metricValueLarge, { color: THEME.colors.primary }]}>
                {waterRatio.ratio.toFixed(2)} : 1
              </Text>
              <Text style={styles.metricSub}>{waterRatio.description}</Text>
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={[styles.metricLabel, { marginBottom: 8 }]}>Kwas Mlekowy 80% — Korekta pH zacieru</Text>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <CraftInput
                    label="Aktualne pH"
                    unit=""
                    value={mashPhCurrent}
                    onChangeText={setMashPhCurrent}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <CraftInput
                    label="Docelowe pH"
                    unit=""
                    value={mashPhTarget}
                    onChangeText={setMashPhTarget}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.resultBox}>
                <Text style={styles.metricLabel}>Dawka kwasu mlekowego 80%</Text>
                <Text style={[styles.metricValue, { color: THEME.colors.primary }]}>
                  {lacticAcidRes} ml
                </Text>
              </View>
            </View>
          </CraftCard>
        )}

        {/* 4. Hydrometer */}
        {selectedCalc === 'hydrometer' && (
          <CraftCard title={t('calc_hydrometer')} subtitle="Korekta areometru wg krzywej NIST">
            <CraftInput
              label="Odczytana gęstość"
              unit="SG"
              value={hydSg}
              onChangeText={setHydSg}
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Temperatura próbki"
                  unit="°C"
                  value={hydTemp}
                  onChangeText={setHydTemp}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Temp. kalibracji spławika"
                  unit="°C"
                  value={hydCalib}
                  onChangeText={setHydCalib}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.metricLabel}>Skorygowana gęstość rzeczywista</Text>
              <Text style={[styles.metricValueLarge, { color: THEME.colors.primary }]}>
                {hydRes.toFixed(3)} SG
              </Text>
              <Text style={styles.metricSub}>{sgToPlato(hydRes).toFixed(1)} °Plato / °Blg</Text>
            </View>
          </CraftCard>
        )}

        {/* 5. IBU with formula switcher */}
        {selectedCalc === 'ibu' && (
          <CraftCard title={t('calc_ibu')} subtitle="Modele goryczki chmielowej (Z-008, Z-009)">
            <View style={styles.sugarSelector}>
              {(['tinseth', 'rager', 'garetz'] as const).map((form) => (
                <TouchableOpacity
                  key={form}
                  style={[styles.sugarPill, ibuFormula === form && styles.sugarPillActive]}
                  onPress={() => setIbuFormula(form)}
                >
                  <Text style={[styles.sugarPillText, ibuFormula === form && styles.sugarPillTextActive]}>
                    {form === 'tinseth' ? 'Tinseth' : form === 'rager' ? 'Rager' : 'Garetz'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Objętość warki"
                  unit="L"
                  value={ibuVol}
                  onChangeText={setIbuVol}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Gęstość brzeczki"
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
                  label="Waga chmielu"
                  unit="g"
                  value={ibuWeight}
                  onChangeText={setIbuWeight}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Alfa-kwasy (AA)"
                  unit="%"
                  value={ibuAlpha}
                  onChangeText={setIbuAlpha}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Czas gotowania"
                  unit="min"
                  value={ibuMins}
                  onChangeText={setIbuMins}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.metricLabel}>Wypadkowa goryczka ({ibuFormula.toUpperCase()})</Text>
              <Text style={[styles.metricValueLarge, { color: THEME.colors.primary }]}>
                {ibuRes} IBU
              </Text>
            </View>
          </CraftCard>
        )}

        {/* 6. Strike Water */}
        {selectedCalc === 'strike' && (
          <CraftCard title={t('calc_strike')} subtitle="Termodynamika zasypu słodu wg Johna Palmera">
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Docelowa przerwa"
                  unit="°C"
                  value={strikeMashTarget}
                  onChangeText={setStrikeMashTarget}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Temp. słodu (suchego)"
                  unit="°C"
                  value={strikeGrainTemp}
                  onChangeText={setStrikeGrainTemp}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <CraftInput
              label="Stosunek woda / słód"
              unit="L/kg"
              value={strikeRatio}
              onChangeText={setStrikeRatio}
              keyboardType="numeric"
            />

            <View style={styles.resultBox}>
              <Text style={styles.metricLabel}>Woda do infuzji (Strike Water)</Text>
              <Text style={[styles.metricValueLarge, { color: THEME.colors.primary }]}>
                {strikeRes.toFixed(1)} °C
              </Text>
              <Text style={styles.metricSub}>
                Podgrzej wodę w garze do tej temperatury przed wsypaniem słodu.
              </Text>
            </View>
          </CraftCard>
        )}

        {/* 7. Yeast Starter (Z-019) */}
        {selectedCalc === 'starter' && (
          <CraftCard title="Kalkulator Startera Drożdżowego" subtitle="Model namnażania komórek White / Troester (Z-019)">
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Komórki wyjściowe"
                  unit="mld"
                  value={starterInitialCells}
                  onChangeText={setStarterInitialCells}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Docelowe komórki"
                  unit="mld"
                  value={starterTargetCells}
                  onChangeText={setStarterTargetCells}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <CraftInput
              label="Objętość startera"
              unit="L"
              value={starterVolL}
              onChangeText={setStarterVolL}
              keyboardType="numeric"
            />

            <View style={styles.sugarSelector}>
              {(['stir_plate', 'shaken', 'still'] as const).map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.sugarPill, starterAeration === a && styles.sugarPillActive]}
                  onPress={() => setStarterAeration(a)}
                >
                  <Text style={[styles.sugarPillText, starterAeration === a && styles.sugarPillTextActive]}>
                    {a === 'stir_plate' ? 'Mieszadło magnetyczne' : a === 'shaken' ? 'Wytrząsanie' : 'Spokojny'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.resultBox}>
              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Ekstrakt (DME)</Text>
                  <Text style={[styles.metricValue, { color: THEME.colors.primary }]}>{starterRes.dmeGrams} g</Text>
                  <Text style={styles.metricSub}>na {starterRes.starterVolumeL} L wody</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Uzysk komórek</Text>
                  <Text style={[styles.metricValue, { color: THEME.colors.success }]}>
                    {starterRes.resultingCellsBillion} mld
                  </Text>
                  <Text style={styles.metricSub}>Wzrost x{starterRes.growthFactor}</Text>
                </View>
              </View>
            </View>
          </CraftCard>
        )}

        {/* 8. Kegging & CO2 (Z-051) */}
        {selectedCalc === 'kegging' && (
          <CraftCard title="Kalkulator Kegowania" subtitle="Ciśnienie wysycenia CO2 wg prawa Henry'ego (Z-051)">
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Docelowe CO2"
                  unit="vol"
                  value={kegTargetVco2}
                  onChangeText={setKegTargetVco2}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Temp. kega"
                  unit="°C"
                  value={kegTempC}
                  onChangeText={setKegTempC}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.metricLabel}>Ciśnienie równowagowe reduktora</Text>
              <Text style={[styles.metricValueLarge, { color: THEME.colors.primary }]}>
                {kegRes.equilibriumBar} bar ({kegRes.equilibriumPsi} PSI)
              </Text>
              <Text style={styles.metricSub}>{kegRes.styleRecommendation}</Text>
            </View>

            <View style={[styles.resultBox, { marginTop: 12 }]}>
              <Text style={styles.metricLabel}>Harmonogram szybkiego nagazowania (Burst):</Text>
              <Text style={styles.metricSub}>• Szybkie 24h: {kegRes.burstSchedule.fast24hBar} bar ({kegRes.burstSchedule.fast24hPsi} PSI)</Text>
              <Text style={styles.metricSub}>• Łagodne 48h: {kegRes.burstSchedule.gentle48hBar} bar ({kegRes.burstSchedule.gentle48hPsi} PSI)</Text>
              <Text style={styles.metricSub}>• Ciśnienie wyszynku: {kegRes.burstSchedule.servingBar} bar ({kegRes.burstSchedule.servingPsi} PSI)</Text>
            </View>
          </CraftCard>
        )}

        {/* 9. Spunding (Z-052) */}
        {selectedCalc === 'spunding' && (
          <CraftCard title="Kalkulator Spundingu" subtitle="Naturalne nagazowanie w fermentacji ciśnieniowej (Z-052)">
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Docelowe CO2"
                  unit="vol"
                  value={spundTargetVco2}
                  onChangeText={setSpundTargetVco2}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Temp. fermentacji"
                  unit="°C"
                  value={spundTempC}
                  onChangeText={setSpundTempC}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Oczekiwane FG"
                  unit="SG"
                  value={spundExpectedFg}
                  onChangeText={setSpundExpectedFg}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.metricLabel}>Nastawa zaworu spunding valve</Text>
              <Text style={[styles.metricValueLarge, { color: THEME.colors.primary }]}>
                {spundRes.spundingPressureBar} bar ({spundRes.spundingPressurePsi} PSI)
              </Text>
              <Text style={styles.metricSub}>{spundRes.instructions}</Text>
            </View>
          </CraftCard>
        )}

        {/* 10. Hop Aging (Z-046) */}
        {selectedCalc === 'hop_aging' && (
          <CraftCard title="Starzenie Chmielu (HSI)" subtitle="Degradacja alfa-kwasów w zależności od warunków (Z-046)">
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Alfa wyjściowe"
                  unit="%"
                  value={hopAgeInitialAlpha}
                  onChangeText={setHopAgeInitialAlpha}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Miesięcy w magazynie"
                  unit="mc"
                  value={hopAgeMonths}
                  onChangeText={setHopAgeMonths}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={[styles.metricLabel, { marginTop: 8 }]}>Warunki przechowywania:</Text>
            <View style={styles.sugarSelector}>
              {(['freezer', 'fridge', 'room', 'warm'] as const).map((tmp) => (
                <TouchableOpacity
                  key={tmp}
                  style={[styles.sugarPill, hopAgeTemp === tmp && styles.sugarPillActive]}
                  onPress={() => setHopAgeTemp(tmp)}
                >
                  <Text style={[styles.sugarPillText, hopAgeTemp === tmp && styles.sugarPillTextActive]}>
                    {tmp === 'freezer' ? 'Zamrażarka (-18°C)' : tmp === 'fridge' ? 'Lodówka (4°C)' : tmp === 'room' ? 'Pokój (20°C)' : 'Ciepło (30°C)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.resultBox}>
              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Pozostałe Alfa-Kwasy</Text>
                  <Text style={[styles.metricValue, { color: THEME.colors.primary }]}>{hopAgeRes.remainingAlphaPct}%</Text>
                  <Text style={styles.metricSub}>Utrata: -{hopAgeRes.totalLossPct}%</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Mnożnik kompensacji</Text>
                  <Text style={[styles.metricValue, { color: THEME.colors.warning }]}>x{hopAgeRes.compensationMultiplier}</Text>
                  <Text style={styles.metricSub}>np. 50g ➔ {hopAgeRes.adjustedGramsForTargetAlpha(50)}g</Text>
                </View>
              </View>
            </View>
          </CraftCard>
        )}

        {/* 11. Hop Stand / Dip Hopping (Z-050) */}
        {selectedCalc === 'hop_stand' && (
          <CraftCard title="Hop Stand & Dip Hopping" subtitle="Ekstrakcja olejków eterycznych w 60-85°C (Z-050)">
            <View style={styles.sugarSelector}>
              {(['whirlpool', 'hop_stand', 'dip_hopping'] as const).map((tech) => (
                <TouchableOpacity
                  key={tech}
                  style={[styles.sugarPill, lateHopTech === tech && styles.sugarPillActive]}
                  onPress={() => setLateHopTech(tech)}
                >
                  <Text style={[styles.sugarPillText, lateHopTech === tech && styles.sugarPillTextActive]}>
                    {tech === 'whirlpool' ? 'Whirlpool (85°C)' : tech === 'hop_stand' ? 'Hop Stand (75°C)' : 'Dip Hopping (65°C)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Temperatura"
                  unit="°C"
                  value={lateHopTemp}
                  onChangeText={setLateHopTemp}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Czas infuzji"
                  unit="min"
                  value={lateHopMins}
                  onChangeText={setLateHopMins}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Waga chmielu"
                  unit="g"
                  value={lateHopWeight}
                  onChangeText={setLateHopWeight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Ekstrakcja IBU</Text>
                  <Text style={[styles.metricValue, { color: THEME.colors.primary }]}>+{lateHopRes.addedIbu} IBU</Text>
                  <Text style={styles.metricSub}>Wydajność: {lateHopRes.effectiveUtilizationPct}%</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Retencja olejków</Text>
                  <Text style={[styles.metricValue, { color: THEME.colors.success }]}>{lateHopRes.oilRetentionPct}%</Text>
                  <Text style={styles.metricSub}>Zachowano: {lateHopRes.estimatedOilRetainedMl} ml</Text>
                </View>
              </View>
              <Text style={[styles.metricSub, { marginTop: 8 }]}>{lateHopRes.recommendation}</Text>
            </View>
          </CraftCard>
        )}

        {/* 12. Chiller (Z-053) */}
        {selectedCalc === 'chiller' && (
          <CraftCard title="Zarządzanie Chłodnicą" subtitle="Wydajność termiczna i zużycie wody lodowej (Z-053)">
            <View style={styles.sugarSelector}>
              {(['immersion', 'counterflow', 'plate'] as const).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.sugarPill, chillerType === c && styles.sugarPillActive]}
                  onPress={() => setChillerType(c)}
                >
                  <Text style={[styles.sugarPillText, chillerType === c && styles.sugarPillTextActive]}>
                    {c === 'immersion' ? 'Zanurzeniowa' : c === 'counterflow' ? 'Przeciwprądowa' : 'Płytowa'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Warka"
                  unit="L"
                  value={chillerWortVol}
                  onChangeText={setChillerWortVol}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CraftInput
                  label="Temp. kranówki"
                  unit="°C"
                  value={chillerTapTemp}
                  onChangeText={setChillerTapTemp}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CraftInput
                  label="Docelowa temp."
                  unit="°C"
                  value={chillerTargetTemp}
                  onChangeText={setChillerTargetTemp}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.resultBox}>
              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Czas chłodzenia</Text>
                  <Text style={[styles.metricValue, { color: THEME.colors.primary }]}>{chillerRes.coolingTimeMinutes} min</Text>
                  <Text style={styles.metricSub}>Zużycie wody: {chillerRes.totalWaterUsedL} L</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Wskaźnik wody</Text>
                  <Text style={[styles.metricValue, { color: THEME.colors.textSecondary }]}>{chillerRes.waterToWortRatio} : 1</Text>
                  <Text style={styles.metricSub}>Sprawność: {chillerRes.efficiencyScore}%</Text>
                </View>
              </View>
              <Text style={[styles.metricSub, { marginTop: 8, color: chillerRes.isTapWaterTooWarm ? THEME.colors.danger : THEME.colors.textSecondary }]}>
                {chillerRes.notes}
              </Text>
            </View>
          </CraftCard>
        )}

        {/* 13. iSpindel (Z-025) */}
        {selectedCalc === 'ispindel' && (
          <CraftCard title="iSpindel — Kalibracja Kąta" subtitle="Wielomianowy przelicznik kąta wychylenia na gęstość (Z-025)">
            <CraftInput
              label="Kąt wychylenia żyroskopu (Tilt Angle)"
              unit="°"
              value={ispindelAngle}
              onChangeText={setIspindelAngle}
              keyboardType="numeric"
            />

            <View style={styles.resultBox}>
              <Text style={styles.metricLabel}>Obliczona gęstość brzeczki</Text>
              <Text style={[styles.metricValueLarge, { color: THEME.colors.primary }]}>
                {ispindelSg.toFixed(3)} SG
              </Text>
              <Text style={styles.metricSub}>
                Wzór: SG = a2·θ² + a1·θ + a0 (zgodny z profilem standardowym iSpindel).
              </Text>
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
    backgroundColor: THEME.colors.background
  },
  tabsScroll: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row'
  },
  calcPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: THEME.colors.cardBackground,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  calcPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary
  },
  calcPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary
  },
  calcPillTextActive: {
    color: '#000000'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8
  },
  sugarSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
    flexWrap: 'wrap'
  },
  sugarPill: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center'
  },
  sugarPillActive: {
    backgroundColor: THEME.colors.surfaceHover,
    borderColor: THEME.colors.primary
  },
  sugarPillText: {
    fontSize: 12,
    color: THEME.colors.textSecondary
  },
  sugarPillTextActive: {
    color: THEME.colors.primary,
    fontWeight: 'bold'
  },
  resultBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center'
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  metric: {
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary
  },
  metricValueLarge: {
    fontSize: 30,
    fontWeight: 'bold',
    color: THEME.colors.primary,
    marginVertical: 4
  },
  metricSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2
  }
});
