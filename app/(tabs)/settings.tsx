/**
 * Piwowar (Brewcraft) — Settings & Reference Screen (DEC-05, DEC-06, DEC-11)
 * Equipment profiles hybrid manager, BJCP 2021 offline browser, and Apps4Brew Pass status.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useEquipmentStore } from '../../lib/store/equipmentStore';
import { useBatchStore } from '../../lib/store/batchStore';
import { openAppDatabase } from '../../lib/db/database';
import { getAllBjcpStyles, searchBjcpStyles } from '../../lib/db/repositories/bjcpRepository';
import { CraftHeader } from '../../components/CraftHeader';
import { CraftCard } from '../../components/CraftCard';
import { CraftButton } from '../../components/CraftButton';
import { CraftInput } from '../../components/CraftInput';
import { CraftModal } from '../../components/CraftModal';
import { BjcpStyle, EquipmentProfile } from '../../lib/types/domain';
import { THEME } from '../../lib/theme';
import { t } from '../../lib/i18n';

export default function SettingsScreen() {
  const { profiles, defaultProfile, setDefault, addProfile } = useEquipmentStore();
  const { totalCount, isPro, toggleProOverride } = useBatchStore();

  // BJCP styles state
  const [bjcpStyles, setBjcpStyles] = useState<BjcpStyle[]>([]);
  const [bjcpSearch, setBjcpSearch] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<BjcpStyle | null>(null);

  // New Equipment Modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [eqName, setEqName] = useState('');
  const [eqVolume, setEqVolume] = useState('20.0');
  const [eqBoilOff, setEqBoilOff] = useState('3.0');
  const [eqEfficiency, setEqEfficiency] = useState('75.0');
  const [eqDeadSpace, setEqDeadSpace] = useState('0.5');
  const [eqKettleLoss, setEqKettleLoss] = useState('1.5');

  const loadBjcp = async (query = '') => {
    const db = await openAppDatabase();
    if (query.trim()) {
      const results = await searchBjcpStyles(db, query);
      setBjcpStyles(results);
    } else {
      const all = await getAllBjcpStyles(db);
      setBjcpStyles(all);
    }
  };

  useEffect(() => {
    loadBjcp();
  }, []);

  const handleSearchChange = (text: string) => {
    setBjcpSearch(text);
    loadBjcp(text);
  };

  const handleSetDefaultEquipment = async (profile: EquipmentProfile) => {
    const db = await openAppDatabase();
    await setDefault(db, profile.id);
    Alert.alert('Zmieniono profil domyślny', `Domyślnym zestawem sprzętowym jest teraz: ${profile.name}`);
  };

  const handleCreateProfile = async () => {
    if (!eqName.trim()) return;

    const db = await openAppDatabase();
    const newProfile: Omit<EquipmentProfile, 'created_at' | 'updated_at'> = {
      id: `eq-custom-${Date.now()}`,
      name: eqName.trim(),
      is_default: 0,
      batch_volume_l: parseFloat(eqVolume) || 20.0,
      boil_time_mins: 60,
      boil_off_l_per_hr: parseFloat(eqBoilOff) || 3.0,
      mash_dead_space_l: parseFloat(eqDeadSpace) || 0.5,
      kettle_loss_l: parseFloat(eqKettleLoss) || 1.5,
      cooling_shrinkage_pct: 4.0,
      grain_absorption_l_per_kg: 0.96,
      brewhouse_efficiency_pct: parseFloat(eqEfficiency) || 75.0
    };

    await addProfile(db, newProfile);
    setAddModalVisible(false);
    setEqName('');
    Alert.alert('Sukces', `Zapisano nowy profil sprzętowy: ${newProfile.name}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CraftHeader title={t('settings_title')} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Apps4Brew Pass Section (DEC-06) */}
        <CraftCard highlightBorder>
          <View style={styles.proHeader}>
            <Text style={styles.sectionTitle}>Apps4Brew Pass</Text>
            <View style={[styles.badge, isPro ? styles.badgePro : styles.badgeFree]}>
              <Text style={styles.badgeText}>{isPro ? 'PRO AKTYWNY' : 'FREEMIUM'}</Text>
            </View>
          </View>

          <Text style={styles.proDesc}>
            {isPro
              ? 'Posiadasz nielimitowany dostęp do tworzenia warek, zaawansowanej telemetrii Tilt BLE i narzędzi laboratoryjnych.'
              : `Wykorzystano ${totalCount} z 3 darmowych warek w pełnym standardzie Pro. Istniejące warki pozostają zawsze bezpłatne do odczytu.`}
          </Text>

          <CraftButton
            label={isPro ? 'Symuluj status Freemium' : 'Włącz status Apps4Brew Pro'}
            onPress={toggleProOverride}
            variant={isPro ? 'secondary' : 'primary'}
            style={{ marginTop: 12, minHeight: 44 }}
          />
        </CraftCard>

        {/* Equipment Profiles Section (DEC-11 Hybryda A+B) */}
        <CraftCard>
          <View style={styles.proHeader}>
            <Text style={styles.sectionTitle}>Profile Sprzętowe (DEC-11)</Text>
            <TouchableOpacity
              onPress={() => setAddModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Dodaj profil sprzętu"
              style={styles.addLink}
            >
              <Text style={styles.addLinkText}>+ Dodaj profil</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.proDesc}>
            Wybierz domyślny profil sprzętowy dla obliczeń wody zaciernej, strat chmielowych i
            odparowania w kotle:
          </Text>

          {profiles.map((p) => {
            const isDef = defaultProfile?.id === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.profileItem, isDef && styles.profileItemActive]}
                onPress={() => handleSetDefaultEquipment(p)}
                accessibilityRole="button"
                accessibilityLabel={`Wybierz profil ${p.name}`}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.profileName, isDef && styles.profileNameActive]}>
                    {p.name} {isDef && '✓'}
                  </Text>
                  <Text style={styles.profileSpecs}>
                    Objętość: {p.batch_volume_l} L • Wydajność: {p.brewhouse_efficiency_pct}% •
                    Odparowanie: {p.boil_off_l_per_hr} L/h
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </CraftCard>

        {/* BJCP 2021 Reference Styles Section (DEC-05) */}
        <CraftCard>
          <Text style={styles.sectionTitle}>Atlas Stylów BJCP 2021 (Offline)</Text>
          <Text style={styles.proDesc}>
            Kompletna baza stylów piwnych z parametrami gęstości, goryczki, barwy i opisami
            sensorycznymi dostępna w 100% bez dostępu do sieci:
          </Text>

          <CraftInput
            label="Szukaj stylu"
            placeholder="np. Grodziskie, IPA, Pils..."
            value={bjcpSearch}
            onChangeText={handleSearchChange}
          />

          {bjcpStyles.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={styles.bjcpItem}
              onPress={() => setSelectedStyle(style)}
              accessibilityRole="button"
              accessibilityLabel={`Zobacz szczegóły stylu ${style.name}`}
            >
              <View style={styles.bjcpItemHeader}>
                <Text style={styles.styleCode}>{style.style_code}</Text>
                <Text style={styles.styleName}>{style.name}</Text>
              </View>
              <Text style={styles.styleCategory}>{style.category}</Text>
              <Text style={styles.styleSpecs}>
                OG: {style.og_min}–{style.og_max} • IBU: {style.ibu_min}–{style.ibu_max} • SRM:{' '}
                {style.srm_min}–{style.srm_max} • ABV: {style.abv_min}–{style.abv_max}%
              </Text>
            </TouchableOpacity>
          ))}
        </CraftCard>
      </ScrollView>

      {/* Add Custom Equipment Profile Modal (DEC-11) */}
      <CraftModal
        visible={addModalVisible}
        title="Nowy Profil Sprzętowy"
        submitLabel="Dodaj"
        onCancel={() => setAddModalVisible(false)}
        onSubmit={handleCreateProfile}
        isDirty={eqName.length > 0}
      >
        <CraftInput
          label="Nazwa profilu"
          placeholder="np. Kocioł Brewcrafter 35L"
          value={eqName}
          onChangeText={setEqName}
        />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <CraftInput
              label="Wielkość warki"
              unit="L"
              value={eqVolume}
              onChangeText={setEqVolume}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <CraftInput
              label="Wydajność"
              unit="%"
              value={eqEfficiency}
              onChangeText={setEqEfficiency}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <CraftInput
              label="Odparowanie"
              unit="L/h"
              value={eqBoilOff}
              onChangeText={setEqBoilOff}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <CraftInput
              label="Martwa przestrzeń"
              unit="L"
              value={eqDeadSpace}
              onChangeText={setEqDeadSpace}
              keyboardType="numeric"
            />
          </View>
        </View>
      </CraftModal>

      {/* BJCP Style Details Modal */}
      {selectedStyle && (
        <CraftModal
          visible={!!selectedStyle}
          title={selectedStyle.name}
          submitLabel="Zamknij"
          onCancel={() => setSelectedStyle(null)}
          onSubmit={() => setSelectedStyle(null)}
        >
          <ScrollView>
            <Text style={styles.detailCategory}>
              Kategoria: {selectedStyle.category} ({selectedStyle.style_code})
            </Text>

            <View style={styles.specsBadgeBox}>
              <Text style={styles.specsBadgeText}>
                OG: {selectedStyle.og_min}–{selectedStyle.og_max} | FG: {selectedStyle.fg_min}–
                {selectedStyle.fg_max}
              </Text>
              <Text style={styles.specsBadgeText}>
                IBU: {selectedStyle.ibu_min}–{selectedStyle.ibu_max} | SRM: {selectedStyle.srm_min}
                –{selectedStyle.srm_max} | ABV: {selectedStyle.abv_min}–{selectedStyle.abv_max}%
              </Text>
            </View>

            {selectedStyle.description && (
              <View style={styles.detailSection}>
                <Text style={styles.detailHeading}>Opis Ogólny</Text>
                <Text style={styles.detailBody}>{selectedStyle.description}</Text>
              </View>
            )}

            {selectedStyle.aroma && (
              <View style={styles.detailSection}>
                <Text style={styles.detailHeading}>Aromat</Text>
                <Text style={styles.detailBody}>{selectedStyle.aroma}</Text>
              </View>
            )}

            {selectedStyle.flavor && (
              <View style={styles.detailSection}>
                <Text style={styles.detailHeading}>Smak</Text>
                <Text style={styles.detailBody}>{selectedStyle.flavor}</Text>
              </View>
            )}

            {selectedStyle.commercial_examples && (
              <View style={styles.detailSection}>
                <Text style={styles.detailHeading}>Przykłady Komercyjne</Text>
                <Text style={styles.detailBody}>{selectedStyle.commercial_examples}</Text>
              </View>
            )}
          </ScrollView>
        </CraftModal>
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
    paddingBottom: 80
  },
  proHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  sectionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  badgePro: {
    backgroundColor: THEME.colors.accentHop
  },
  badgeFree: {
    backgroundColor: THEME.colors.bgElevated
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  proDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 4
  },
  addLink: {
    padding: 4
  },
  addLinkText: {
    color: THEME.colors.accentPrimary,
    fontSize: 13,
    fontWeight: '700'
  },
  profileItem: {
    backgroundColor: THEME.colors.bgCanvas,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    borderRadius: THEME.borderRadius.sm,
    padding: THEME.spacing.md,
    marginTop: 8
  },
  profileItemActive: {
    borderColor: THEME.colors.accentHop,
    backgroundColor: 'rgba(62, 123, 84, 0.1)'
  },
  profileName: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  profileNameActive: {
    color: THEME.colors.accentHop
  },
  profileSpecs: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  bjcpItem: {
    backgroundColor: THEME.colors.bgCanvas,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    borderRadius: THEME.borderRadius.sm,
    padding: THEME.spacing.md,
    marginTop: 8
  },
  bjcpItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  styleCode: {
    backgroundColor: THEME.colors.bgElevated,
    color: THEME.colors.accentPrimary,
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  styleName: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1
  },
  styleCategory: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 2
  },
  styleSpecs: {
    color: THEME.colors.accentPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailCategory: {
    color: THEME.colors.accentPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8
  },
  specsBadgeBox: {
    backgroundColor: THEME.colors.bgSurface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginBottom: 12
  },
  specsBadgeText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginVertical: 2
  },
  detailSection: {
    marginBottom: 12
  },
  detailHeading: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2
  },
  detailBody: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18
  }
});
