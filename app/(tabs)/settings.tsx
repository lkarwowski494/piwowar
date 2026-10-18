/**
 * Piwowar (Brewcraft) — Settings & Reference Screen (DEC-05, DEC-06, DEC-11)
 * Equipment profiles hybrid manager, BJCP 2021 offline browser,
 * Pantry & Ingredients Inventory (Z-045), and Apps4Brew Pass status.
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
import { useInventoryStore } from '../../lib/store/inventoryStore';
import { openAppDatabase } from '../../lib/db/database';
import { getAllBjcpStyles, searchBjcpStyles } from '../../lib/db/repositories/bjcpRepository';
import { CraftHeader } from '../../components/CraftHeader';
import { CraftCard } from '../../components/CraftCard';
import { CraftButton } from '../../components/CraftButton';
import { CraftInput } from '../../components/CraftInput';
import { CraftModal } from '../../components/CraftModal';
import { BjcpStyle, EquipmentProfile, InventoryHop, InventoryFermentable, InventoryYeast } from '../../lib/types/domain';
import { THEME } from '../../lib/theme';
import { t } from '../../lib/i18n';

export default function SettingsScreen() {
  const { profiles, defaultProfile, setDefault, addProfile } = useEquipmentStore();
  const { totalCount, isPro, toggleProOverride } = useBatchStore();
  const { hops, fermentables, yeasts, loadInventory, addOrUpdateHop, addOrUpdateFermentable, addOrUpdateYeast, removeHop } = useInventoryStore();

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

  // New Inventory Item Modal state
  const [invModalVisible, setInvModalVisible] = useState(false);
  const [invType, setInvType] = useState<'hop' | 'malt' | 'yeast'>('hop');
  const [invName, setInvName] = useState('');
  const [invAmount, setInvAmount] = useState('100');
  const [invParam, setInvParam] = useState('12.0'); // AA% for hops, or color for malt

  const loadData = async () => {
    const db = await openAppDatabase();
    await loadInventory(db);
    const all = await getAllBjcpStyles(db);
    setBjcpStyles(all);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchChange = async (text: string) => {
    setBjcpSearch(text);
    const db = await openAppDatabase();
    if (text.trim()) {
      const results = await searchBjcpStyles(db, text);
      setBjcpStyles(results);
    } else {
      const all = await getAllBjcpStyles(db);
      setBjcpStyles(all);
    }
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

  const handleAddInventoryItem = async () => {
    if (!invName.trim()) return;
    const db = await openAppDatabase();
    const now = new Date().toISOString();

    if (invType === 'hop') {
      await addOrUpdateHop(db, {
        id: `hop-${Date.now()}`,
        name: invName.trim(),
        alpha_acids_pct: parseFloat(invParam) || 10.0,
        weight_g: parseFloat(invAmount) || 100,
        form: 'pellet',
        storage_temp: 'freezer',
        updated_at: now
      });
    } else if (invType === 'malt') {
      await addOrUpdateFermentable(db, {
        id: `ferm-${Date.now()}`,
        name: invName.trim(),
        weight_kg: parseFloat(invAmount) || 5.0,
        color_lovibond: parseFloat(invParam) || 2.0,
        potential_sg: 1.036,
        updated_at: now
      });
    } else {
      await addOrUpdateYeast(db, {
        id: `yeast-${Date.now()}`,
        name: invName.trim(),
        form: 'dry',
        pack_count: parseInt(invAmount, 10) || 1,
        updated_at: now
      });
    }

    setInvModalVisible(false);
    setInvName('');
    Alert.alert('Zapisano w spiżarni', `Dodano: ${invName.trim()}`);
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

        {/* Spiżarnia i Magazyn Surowców (Z-045) */}
        <CraftCard>
          <View style={styles.proHeader}>
            <Text style={styles.sectionTitle}>Spiżarnia i Magazyn Surowców (Z-045)</Text>
            <TouchableOpacity
              onPress={() => setInvModalVisible(true)}
              style={styles.addLink}
            >
              <Text style={styles.addLinkText}>+ Dodaj surowiec</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.proDesc}>
            Stan domowego magazynu słodów, chmieli i gęstw. Automatyczne odliczanie po uwarzeniu warki.
          </Text>

          {/* Quick counts */}
          <View style={styles.inventoryCountsRow}>
            <View style={styles.inventoryCountBox}>
              <Text style={styles.inventoryCountVal}>{hops.length}</Text>
              <Text style={styles.inventoryCountLbl}>Chmiele</Text>
            </View>
            <View style={styles.inventoryCountBox}>
              <Text style={styles.inventoryCountVal}>{fermentables.length}</Text>
              <Text style={styles.inventoryCountLbl}>Słody</Text>
            </View>
            <View style={styles.inventoryCountBox}>
              <Text style={styles.inventoryCountVal}>{yeasts.length}</Text>
              <Text style={styles.inventoryCountLbl}>Drożdże</Text>
            </View>
          </View>

          {/* Hops preview */}
          {hops.map((h) => (
            <View key={h.id} style={styles.invItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.invItemName}>🌿 {h.name} ({h.alpha_acids_pct}% AA)</Text>
                <Text style={styles.invItemSub}>{h.storage_temp} • {h.form}</Text>
              </View>
              <Text style={styles.invItemQty}>{h.weight_g} g</Text>
            </View>
          ))}

          {/* Malts preview */}
          {fermentables.map((f) => (
            <View key={f.id} style={styles.invItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.invItemName}>🌾 {f.name}</Text>
                <Text style={styles.invItemSub}>{f.color_lovibond} °L</Text>
              </View>
              <Text style={styles.invItemQty}>{f.weight_kg} kg</Text>
            </View>
          ))}

          {/* Yeasts preview */}
          {yeasts.map((y) => (
            <View key={y.id} style={styles.invItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.invItemName}>🧪 {y.name}</Text>
                <Text style={styles.invItemSub}>{y.form}</Text>
              </View>
              <Text style={styles.invItemQty}>{y.pack_count} szt</Text>
            </View>
          ))}
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

          <View style={styles.bjcpList}>
            {bjcpStyles.slice(0, 15).map((style) => (
              <TouchableOpacity
                key={style.id}
                style={styles.bjcpItem}
                onPress={() => setSelectedStyle(style)}
              >
                <View style={styles.bjcpBadge}>
                  <Text style={styles.bjcpBadgeText}>{style.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bjcpName}>{style.name}</Text>
                  <Text style={styles.bjcpCategory}>{style.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </CraftCard>
      </ScrollView>

      {/* Add Equipment Profile Modal */}
      <CraftModal
        visible={addModalVisible}
        title="Nowy Profil Sprzętowy"
        submitLabel="Zapisz"
        onCancel={() => setAddModalVisible(false)}
        onSubmit={handleCreateProfile}
        isDirty={eqName.length > 0}
      >
        <CraftInput
          label="Nazwa profilu"
          value={eqName}
          onChangeText={setEqName}
          placeholder="np. Garnek 30L + Taboret gazowy"
        />
        <CraftInput
          label="Objętość warki"
          unit="L"
          value={eqVolume}
          onChangeText={setEqVolume}
          keyboardType="numeric"
        />
        <CraftInput
          label="Odparowanie na godzinę"
          unit="L/h"
          value={eqBoilOff}
          onChangeText={setEqBoilOff}
          keyboardType="numeric"
        />
        <CraftInput
          label="Wydajność warzelni"
          unit="%"
          value={eqEfficiency}
          onChangeText={setEqEfficiency}
          keyboardType="numeric"
        />
      </CraftModal>

      {/* Add Inventory Item Modal (Z-045) */}
      <CraftModal
        visible={invModalVisible}
        title="Dodaj do Spiżarni"
        submitLabel="Zapisz"
        onCancel={() => setInvModalVisible(false)}
        onSubmit={handleAddInventoryItem}
        isDirty={invName.length > 0}
      >
        <View style={styles.invTypeSelector}>
          {(['hop', 'malt', 'yeast'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.invTypePill, invType === type && styles.invTypePillActive]}
              onPress={() => setInvType(type)}
            >
              <Text style={[styles.invTypePillText, invType === type && styles.invTypePillTextActive]}>
                {type === 'hop' ? 'Chmiel' : type === 'malt' ? 'Słód' : 'Drożdże'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <CraftInput
          label="Nazwa surowca"
          value={invName}
          onChangeText={setInvName}
          placeholder={invType === 'hop' ? 'np. Mosaic, Citra' : invType === 'malt' ? 'np. Pilzneński, Monachijski' : 'np. SafAle US-05'}
        />

        <CraftInput
          label={invType === 'hop' ? 'Waga w magazynie' : invType === 'malt' ? 'Waga w magazynie' : 'Liczba opakowań'}
          unit={invType === 'hop' ? 'g' : invType === 'malt' ? 'kg' : 'szt'}
          value={invAmount}
          onChangeText={setInvAmount}
          keyboardType="numeric"
        />

        {invType !== 'yeast' && (
          <CraftInput
            label={invType === 'hop' ? 'Zawartość alfa-kwasów (AA)' : 'Barwa słodu'}
            unit={invType === 'hop' ? '%' : '°L'}
            value={invParam}
            onChangeText={setInvParam}
            keyboardType="numeric"
          />
        )}
      </CraftModal>

      {/* BJCP Style Details Modal */}
      <CraftModal
        visible={!!selectedStyle}
        title={selectedStyle ? `${selectedStyle.id} — ${selectedStyle.name}` : ''}
        submitLabel="Zamknij"
        onCancel={() => setSelectedStyle(null)}
        onSubmit={() => setSelectedStyle(null)}
      >
        {selectedStyle && (
          <ScrollView style={{ maxHeight: 380 }}>
            <Text style={styles.modalCategory}>{selectedStyle.category}</Text>
            <View style={styles.specsBox}>
              <Text style={styles.specItem}>OG: {selectedStyle.og_min} - {selectedStyle.og_max}</Text>
              <Text style={styles.specItem}>FG: {selectedStyle.fg_min} - {selectedStyle.fg_max}</Text>
              <Text style={styles.specItem}>IBU: {selectedStyle.ibu_min} - {selectedStyle.ibu_max}</Text>
              <Text style={styles.specItem}>SRM: {selectedStyle.srm_min} - {selectedStyle.srm_max}</Text>
              <Text style={styles.specItem}>ABV: {selectedStyle.abv_min}% - {selectedStyle.abv_max}%</Text>
            </View>
            {selectedStyle.description && (
              <Text style={styles.modalDesc}>{selectedStyle.description}</Text>
            )}
          </ScrollView>
        )}
      </CraftModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  proHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  badgePro: {
    backgroundColor: THEME.colors.accentPrimary
  },
  badgeFree: {
    backgroundColor: THEME.colors.surface
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000'
  },
  proDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10
  },
  addLink: {
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  addLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.accentPrimary
  },
  profileItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 8
  },
  profileItemActive: {
    borderColor: THEME.colors.accentPrimary,
    backgroundColor: THEME.colors.surfaceHover
  },
  profileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
    marginBottom: 2
  },
  profileNameActive: {
    color: THEME.colors.accentPrimary
  },
  profileSpecs: {
    fontSize: 12,
    color: THEME.colors.textSecondary
  },
  inventoryCountsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10
  },
  inventoryCountBox: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  inventoryCountVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.accentPrimary
  },
  inventoryCountLbl: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2
  },
  invItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border
  },
  invItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary
  },
  invItemSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary
  },
  invItemQty: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.accentHop
  },
  invTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  invTypePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center'
  },
  invTypePillActive: {
    backgroundColor: THEME.colors.surfaceHover,
    borderColor: THEME.colors.accentPrimary
  },
  invTypePillText: {
    fontSize: 12,
    color: THEME.colors.textSecondary
  },
  invTypePillTextActive: {
    color: THEME.colors.accentPrimary,
    fontWeight: 'bold'
  },
  bjcpList: {
    marginTop: 8
  },
  bjcpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border
  },
  bjcpBadge: {
    backgroundColor: THEME.colors.surfaceHover,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10
  },
  bjcpBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.accentPrimary
  },
  bjcpName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary
  },
  bjcpCategory: {
    fontSize: 11,
    color: THEME.colors.textSecondary
  },
  modalCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.accentPrimary,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  specsBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: THEME.colors.surface,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12
  },
  specItem: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontWeight: '600'
  },
  modalDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18
  }
});
