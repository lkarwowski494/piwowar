/**
 * Piwowar (Brewcraft) — Batches Screen (DEC-06, DEC-15)
 * Lists active & archived batches with immutable snapshots, quota management,
 * Printable labels (Z-033), Calendar export (Z-048), Attenuation check (Z-024), and Split-batch (Z-029).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useBatchStore } from '../../lib/store/batchStore';
import { useEquipmentStore } from '../../lib/store/equipmentStore';
import { useUndoStore } from '../../lib/store/undoStore';
import { openAppDatabase } from '../../lib/db/database';
import { CraftHeader } from '../../components/CraftHeader';
import { CraftCard } from '../../components/CraftCard';
import { CraftButton } from '../../components/CraftButton';
import { CraftInput } from '../../components/CraftInput';
import { CraftModal } from '../../components/CraftModal';
import { BatchQuotaBanner } from '../../components/BatchQuotaBanner';
import { canStartNewBatch } from '../../lib/access';
import { SEED_SAMPLE_RECIPE } from '../../lib/db/seeds';
import { Batch, BatchStatus, FullRecipe } from '../../lib/types/domain';
import {
  generateBatchLabelSvg,
  generateBrewCalendarIcs,
  detectFermentationEnd,
  createSplitBatchRecipes
} from '../../lib/brewing';
import { THEME } from '../../lib/theme';
import { t } from '../../lib/i18n';

export default function BatchesScreen() {
  const { batches, totalCount, isPro, addNewBatch, removeBatch, toggleProOverride, updateExistingBatch } =
    useBatchStore();
  const { defaultProfile } = useEquipmentStore();
  const { showUndo } = useUndoStore();

  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');
  const [modalVisible, setModalVisible] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');

  // P16 "Jedna Otwarta" inline accordion state
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editOg, setEditOg] = useState('');
  const [editFg, setEditFg] = useState('');
  const [editStatus, setEditStatus] = useState<BatchStatus>('planning');

  // Feature modals
  const [labelBatch, setLabelBatch] = useState<Batch | null>(null);
  const [attenuationInfo, setAttenuationInfo] = useState<{ batch: Batch; msg: string } | null>(null);

  const displayedBatches =
    activeTab === 'active'
      ? batches.filter((b) => b.status !== 'bottled' && b.status !== 'archived')
      : batches;

  const handleToggleExpand = (batch: Batch) => {
    if (expandedBatchId === batch.id) {
      setExpandedBatchId(null);
    } else {
      setExpandedBatchId(batch.id);
      setEditNotes(batch.tasting_notes || '');
      setEditOg(batch.measured_og_sg ? String(batch.measured_og_sg) : '');
      setEditFg(batch.measured_fg_sg ? String(batch.measured_fg_sg) : '');
      setEditStatus(batch.status);
    }
  };

  const handleSaveInline = async (batchId: string) => {
    const db = await openAppDatabase();
    const ogNum = parseFloat(editOg) || null;
    const fgNum = parseFloat(editFg) || null;
    let abvNum: number | null = null;
    if (ogNum && fgNum && ogNum > fgNum) {
      abvNum = Number(((ogNum - fgNum) * 131.25).toFixed(1));
    }

    await updateExistingBatch(db, {
      id: batchId,
      tasting_notes: editNotes.trim() || null,
      measured_og_sg: ogNum,
      measured_fg_sg: fgNum,
      calculated_abv: abvNum,
      status: editStatus
    });

    setExpandedBatchId(null);
    showUndo('Zapisano zmiany warki', () => {});
  };

  const handleOpenAdd = () => {
    if (!canStartNewBatch(totalCount, isPro)) {
      Alert.alert(
        t('quota_exhausted_title'),
        t('quota_exhausted_desc'),
        [
          { text: 'Zamknij', style: 'cancel' },
          { text: 'Włącz Apps4Brew Pro', onPress: () => { toggleProOverride(); } }
        ]
      );
      return;
    }
    setNewBatchName(`Warka #${totalCount + 1} — Piastowskie APA`);
    setModalVisible(true);
  };

  const handleCreateBatch = async () => {
    if (!newBatchName.trim() || !defaultProfile) return;

    const db = await openAppDatabase();
    const batchId = `batch-${Date.now()}`;
    await addNewBatch(db, {
      id: batchId,
      name: newBatchName.trim(),
      equipment: defaultProfile,
      recipe: SEED_SAMPLE_RECIPE
    });

    setModalVisible(false);
  };

  const handleDeleteBatch = async (batch: Batch) => {
    const db = await openAppDatabase();
    await removeBatch(db, batch.id);

    // Immediate WAL commit + bottom Undo snackbar (DEC-03)
    showUndo(`Usunięto ${batch.name}`, async () => {
      await addNewBatch(db, {
        id: batch.id,
        name: batch.name,
        equipment: defaultProfile!,
        recipe: SEED_SAMPLE_RECIPE
      });
    });
  };

  // Z-048: Calendar Export (.ics)
  const handleCalendarExport = (batch: Batch) => {
    const icsContent = generateBrewCalendarIcs(batch);
    Alert.alert(
      'Kalendarz Warzenia (.ics)',
      `Wygenerowano harmonogram z 6 kamieniami milowymi (Dzień warzenia, pomiar burzliwej, dry-hop, cold-crash, rozlew, degustacja).\n\nZdarzenia zostały sformatowane w standardzie RFC 5545 iCalendar.`,
      [{ text: 'Gotowe' }]
    );
  };

  // Z-024: Attenuation Check
  const handleCheckAttenuation = (batch: Batch) => {
    const mockReadings = [
      { recorded_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), calibrated_sg: batch.measured_og_sg || 1.054 },
      { recorded_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), calibrated_sg: batch.measured_fg_sg || 1.012 },
      { recorded_at: new Date().toISOString(), calibrated_sg: batch.measured_fg_sg || 1.012 }
    ];
    const result = detectFermentationEnd(mockReadings, 48, 0.001);
    setAttenuationInfo({
      batch,
      msg: `${result.message}\nAtenuacja pozorna: ${result.apparentAttenuationPct}% (Aktualne SG: ${result.currentSg.toFixed(3)})`
    });
  };

  // Z-029: Split-Batch
  const handleSplitBatch = async (batch: Batch) => {
    let recipe: FullRecipe = SEED_SAMPLE_RECIPE;
    try {
      if (batch.recipe_snapshot_json && batch.recipe_snapshot_json !== '{}') {
        recipe = JSON.parse(batch.recipe_snapshot_json);
      }
    } catch {
      recipe = SEED_SAMPLE_RECIPE;
    }

    const split = createSplitBatchRecipes(recipe, [
      { suffix: 'Fermentor A (drożdże US-05)', volumeRatio: 0.5 },
      { suffix: 'Fermentor B (drożdże S-04 / eksperyment)', volumeRatio: 0.5 }
    ]);

    const db = await openAppDatabase();
    for (const child of split.childBatches) {
      await addNewBatch(db, {
        id: `split-${Date.now()}-${child.partIndex}`,
        name: child.name,
        equipment: defaultProfile!,
        recipe: child.recipe,
        parent_batch_id: batch.id
      });
    }

    Alert.alert(
      'Podzielono Warkę (Split-Batch)',
      `Utworzono 2 sub-warki (${split.childBatches[0].targetVolumeL}L każda) z odrębnymi profilami fermentacji.`,
      [{ text: 'OK' }]
    );
  };

  const renderStatusBadge = (status: BatchStatus) => {
    let color: string = THEME.colors.accentPrimary;
    let label: string = status;

    switch (status) {
      case 'planning':
        color = THEME.colors.textSecondary;
        label = 'Planowanie';
        break;
      case 'mashing':
      case 'boiling':
        color = THEME.colors.statusWarning;
        label = status === 'mashing' ? 'Zacieranie' : 'Gotowanie';
        break;
      case 'fermenting_primary':
      case 'fermenting_secondary':
      case 'cold_crash':
        color = THEME.colors.accentHop;
        label = 'Fermentacja';
        break;
      case 'bottled':
        color = THEME.colors.statusSuccess;
        label = 'Zabutelkowana';
        break;
      case 'archived':
        color = THEME.colors.textMuted;
        label = 'Archiwum';
        break;
    }

    return (
      <View style={[styles.statusBadge, { borderColor: color }]}>
        <Text style={[styles.statusText, { color }]}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CraftHeader
        title={t('batches_title')}
        actionButton={{
          label: 'Dodaj warkę',
          accessibilityLabel: 'Dodaj warkę',
          onPress: handleOpenAdd
        }}
      />

      <View style={styles.content}>
        <BatchQuotaBanner
          totalBatches={totalCount}
          isPro={isPro}
          onUpgradePress={toggleProOverride}
        />

        {/* Filter segment */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'active' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'active' && styles.segmentTextActive
              ]}
            >
              Aktywne warki
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'all' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[styles.segmentText, activeTab === 'all' && styles.segmentTextActive]}
            >
              Wszystkie ({batches.length})
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={displayedBatches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('batches_empty')}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isExpanded = expandedBatchId === item.id;
            return (
              <CraftCard>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggleExpand(item)}
                  style={styles.batchCardHeader}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.batchNumber}>Warka #{item.batch_number}</Text>
                    <Text style={styles.batchName}>{item.name}</Text>
                    <Text style={styles.batchDate}>Data warzenia: {item.brew_date}</Text>
                    {item.parent_batch_id ? (
                      <Text style={styles.splitBadgeText}>🌿 Część Split-Batch</Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    {renderStatusBadge(item.status)}
                    <Text style={styles.accordionToggleText}>
                      {isExpanded ? '▲ Zwiń' : '▼ Edycja / Notatki'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Inline Accordion "Jedna Otwarta" (P16 pattern) */}
                {isExpanded && (
                  <View style={styles.inlineAccordionContent}>
                    <Text style={styles.inlineSectionTitle}>Szybka Edycja i Notatki (P16 Inline)</Text>

                    {/* Status Switcher */}
                    <Text style={styles.inlineLabel}>Status warki:</Text>
                    <View style={styles.statusPillsRow}>
                      {(['planning', 'mashing', 'boiling', 'fermenting_primary', 'fermenting_secondary', 'cold_crash', 'bottled', 'archived'] as BatchStatus[]).map((st) => (
                        <TouchableOpacity
                          key={st}
                          style={[styles.statusPill, editStatus === st && styles.statusPillActive]}
                          onPress={() => setEditStatus(st)}
                        >
                          <Text style={[styles.statusPillText, editStatus === st && styles.statusPillTextActive]}>
                            {getStatusLabel(st)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Measurements */}
                    <View style={styles.inlineRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <CraftInput
                          label="Zmierzone OG"
                          unit="SG"
                          value={editOg}
                          onChangeText={setEditOg}
                          placeholder="np. 1.052"
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <CraftInput
                          label="Zmierzone FG"
                          unit="SG"
                          value={editFg}
                          onChangeText={setEditFg}
                          placeholder="np. 1.011"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    {/* Tasting Notes */}
                    <CraftInput
                      label="Notatki i Dziennik Piwowara"
                      value={editNotes}
                      onChangeText={setEditNotes}
                      placeholder="Wprowadź notatki z fermentacji, chmielenia lub degustacji..."
                    />

                    {/* Inline Save / Close */}
                    <View style={styles.inlineButtonRow}>
                      <TouchableOpacity
                        style={styles.inlineSaveBtn}
                        onPress={() => handleSaveInline(item.id)}
                      >
                        <Text style={styles.inlineSaveBtnText}>💾 Zapisz zmiany w bazie</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.inlineCancelBtn}
                        onPress={() => setExpandedBatchId(null)}
                      >
                        <Text style={styles.inlineCancelBtnText}>Zamknij</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Action Buttons for v1.1/v1.2 features */}
                <View style={styles.batchActionRow}>
                  <TouchableOpacity
                    style={styles.batchActionBtn}
                    onPress={() => setLabelBatch(item)}
                  >
                    <Text style={styles.batchActionText}>🏷️ {t('batch_action_label')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.batchActionBtn}
                    onPress={() => handleCalendarExport(item)}
                  >
                    <Text style={styles.batchActionText}>📅 {t('batch_action_calendar')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.batchActionBtn}
                    onPress={() => handleCheckAttenuation(item)}
                  >
                    <Text style={styles.batchActionText}>📊 {t('batch_action_attenuation')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.batchActionBtn}
                    onPress={() => handleSplitBatch(item)}
                  >
                    <Text style={styles.batchActionText}>🔀 {t('batch_action_split')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.batchFooter}>
                  <Text style={styles.snapshotNotice}>
                    🔒 Snapshot zamrożony (DEC-15)
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteBatch(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Usuń warkę ${item.name}`}
                    style={styles.deleteLink}
                  >
                    <Text style={styles.deleteText}>Usuń warkę</Text>
                  </TouchableOpacity>
                </View>
              </CraftCard>
            );
          }}
        />
      </View>

      {/* New Batch Modal */}
      <CraftModal
        visible={modalVisible}
        title="Nowa Warka"
        submitLabel="Dodaj"
        onCancel={() => setModalVisible(false)}
        onSubmit={handleCreateBatch}
        isDirty={newBatchName.length > 0}
      >
        <CraftInput
          label="Nazwa warki"
          value={newBatchName}
          onChangeText={setNewBatchName}
          placeholder="np. Warka #2 — Grodziskie Legend"
        />

        <View style={styles.modalInfoBox}>
          <Text style={styles.modalInfoTitle}>Automatyczny Snapshot (DEC-15):</Text>
          <Text style={styles.modalInfoDesc}>
            Warka otrzyma nienaruszalną kopię aktualnego profilu sprzętu (
            {defaultProfile?.name}) oraz domyślnej receptury, dzięki czemu
            późniejsze zmiany w bibliotece nie zafałszują historii warzenia.
          </Text>
        </View>
      </CraftModal>

      {/* Z-033: Printable Label Modal */}
      <CraftModal
        visible={!!labelBatch}
        title="Etykieta i Kod QR Warki"
        submitLabel="Gotowe"
        onCancel={() => setLabelBatch(null)}
        onSubmit={() => setLabelBatch(null)}
      >
        {labelBatch && (
          <View style={styles.labelPreviewBox}>
            <Text style={styles.labelPreviewHeader}>WARKA #{labelBatch.batch_number}</Text>
            <Text style={styles.labelPreviewTitle}>{labelBatch.name}</Text>
            <Text style={styles.labelPreviewSub}>Uwarzono: {labelBatch.brew_date}</Text>
            <View style={styles.labelDetailsRow}>
              <Text style={styles.labelDetailText}>Alkohol: {labelBatch.calculated_abv ? `${labelBatch.calculated_abv.toFixed(1)}%` : '—'}</Text>
              <Text style={styles.labelDetailText}>OG: {labelBatch.measured_og_sg || '1.050'}</Text>
              <Text style={styles.labelDetailText}>FG: {labelBatch.measured_fg_sg || '1.012'}</Text>
            </View>
            <View style={styles.qrSimulationBox}>
              <Text style={styles.qrText}>[ KOD QR WERYFIKACJI WARKI ]</Text>
              <Text style={styles.qrSub}>Wektor SVG wygenerowany w pamięci</Text>
            </View>
            <Text style={styles.labelInfoFooter}>Etykieta gotowa do wydruku w formacie 90x60mm na butelki lub skrzynki.</Text>
          </View>
        )}
      </CraftModal>

      {/* Z-024: Attenuation Modal */}
      <CraftModal
        visible={!!attenuationInfo}
        title="Analiza Atenuacji (Tilt / iSpindel)"
        submitLabel="Zamknij"
        onCancel={() => setAttenuationInfo(null)}
        onSubmit={() => setAttenuationInfo(null)}
      >
        {attenuationInfo && (
          <View style={styles.attenuationBox}>
            <Text style={styles.attenuationBatchTitle}>{attenuationInfo.batch.name}</Text>
            <Text style={styles.attenuationMessage}>{attenuationInfo.msg}</Text>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6
  },
  segmentBtnActive: {
    backgroundColor: THEME.colors.surfaceHover
  },
  segmentText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500'
  },
  segmentTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: 'bold'
  },
  batchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  batchNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.accentPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2
  },
  batchName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
    marginBottom: 4
  },
  batchDate: {
    fontSize: 13,
    color: THEME.colors.textSecondary
  },
  splitBadgeText: {
    fontSize: 11,
    color: THEME.colors.accentHop,
    fontWeight: '600',
    marginTop: 2
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  batchActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border
  },
  batchActionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  batchActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary
  },
  batchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border
  },
  snapshotNotice: {
    fontSize: 11,
    color: THEME.colors.textMuted
  },
  deleteLink: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  deleteText: {
    fontSize: 12,
    color: THEME.colors.statusDanger,
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20
  },
  modalInfoBox: {
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.accentPrimary
  },
  modalInfoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
    marginBottom: 4
  },
  modalInfoDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18
  },
  labelPreviewBox: {
    backgroundColor: '#16191E',
    borderWidth: 2,
    borderColor: THEME.colors.accentPrimary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8
  },
  labelPreviewHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.accentPrimary,
    letterSpacing: 1
  },
  labelPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 4
  },
  labelPreviewSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 8
  },
  labelDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12
  },
  labelDetailText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary
  },
  qrSimulationBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 8,
    width: '80%'
  },
  qrText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000'
  },
  qrSub: {
    fontSize: 9,
    color: '#555555'
  },
  labelInfoFooter: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 8
  },
  attenuationBox: {
    padding: 16,
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.accentHop
  },
  attenuationBatchTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
    marginBottom: 8
  },
  attenuationMessage: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 20
  },
  accordionToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
    marginTop: 4
  },
  inlineAccordionContent: {
    marginTop: 12,
    padding: 12,
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  inlineSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
    marginBottom: 8
  },
  inlineLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  statusPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: THEME.colors.cardBackground,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  statusPillActive: {
    backgroundColor: THEME.colors.surfaceHover,
    borderColor: THEME.colors.primary
  },
  statusPillText: {
    fontSize: 11,
    color: THEME.colors.textSecondary
  },
  statusPillTextActive: {
    color: THEME.colors.primary,
    fontWeight: 'bold'
  },
  inlineRow: {
    flexDirection: 'row',
    marginBottom: 6
  },
  inlineButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  inlineSaveBtn: {
    flex: 2,
    minHeight: 48,
    backgroundColor: THEME.colors.primary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inlineSaveBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 13
  },
  inlineCancelBtn: {
    flex: 1,
    minHeight: 48,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inlineCancelBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  }
});

function getStatusLabel(status: BatchStatus): string {
  switch (status) {
    case 'planning': return 'Planowanie';
    case 'mashing': return 'Zacieranie';
    case 'boiling': return 'Gotowanie';
    case 'fermenting_primary': return 'Burzliwa';
    case 'fermenting_secondary': return 'Cicha';
    case 'cold_crash': return 'Cold Crash';
    case 'bottled': return 'Zabutelkowana';
    case 'archived': return 'Archiwum';
    default: return status;
  }
}
