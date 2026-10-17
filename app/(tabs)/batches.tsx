/**
 * Piwowar (Brewcraft) — Batches Screen (DEC-06, DEC-15)
 * Lists active & archived batches with immutable snapshots, quota management, and undo deletions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert
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
import { Batch, BatchStatus } from '../../lib/types/domain';
import { THEME } from '../../lib/theme';
import { t } from '../../lib/i18n';

export default function BatchesScreen() {
  const { batches, totalCount, isPro, addNewBatch, removeBatch, toggleProOverride } =
    useBatchStore();
  const { defaultProfile } = useEquipmentStore();
  const { showUndo } = useUndoStore();

  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');
  const [modalVisible, setModalVisible] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');

  const displayedBatches =
    activeTab === 'active'
      ? batches.filter((b) => b.status !== 'bottled' && b.status !== 'archived')
      : batches;

  const handleOpenAdd = () => {
    if (!canStartNewBatch(totalCount, isPro)) {
      Alert.alert(
        t('quota_exhausted_title'),
        t('quota_exhausted_desc'),
        [
          { text: 'Zamknij', style: 'cancel' },
          { text: 'Włącz Apps4Brew Pro', onPress: toggleProOverride }
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
          renderItem={({ item }) => (
            <CraftCard>
              <View style={styles.batchCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.batchNumber}>Warka #{item.batch_number}</Text>
                  <Text style={styles.batchName}>{item.name}</Text>
                  <Text style={styles.batchDate}>Data warzenia: {item.brew_date}</Text>
                </View>
                {renderStatusBadge(item.status)}
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
          )}
        />
      </View>

      {/* New Batch Modal (32-wzorce standards) */}
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
          <Text style={styles.modalInfoText}>
            W momencie utworzenia warki, aplikacja zapisze trwałą i nienaruszalną kopię aktualnej
            receptury bazowej oraz profilu sprzętowego ({defaultProfile?.name || 'BIAB 20L'}).
          </Text>
        </View>
      </CraftModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bgCanvas
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.bgSurface,
    borderRadius: THEME.borderRadius.sm,
    padding: 3,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4
  },
  segmentBtnActive: {
    backgroundColor: THEME.colors.bgElevated
  },
  segmentText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  segmentTextActive: {
    color: THEME.colors.accentPrimary,
    fontWeight: '700'
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center'
  },
  emptyText: {
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20
  },
  batchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  batchNumber: {
    color: THEME.colors.accentPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  batchName: {
    color: THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2
  },
  batchDate: {
    color: THEME.colors.textMuted,
    fontSize: 12,
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
    fontWeight: '700'
  },
  batchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle
  },
  snapshotNotice: {
    color: THEME.colors.textMuted,
    fontSize: 11
  },
  deleteLink: {
    padding: 4
  },
  deleteText: {
    color: THEME.colors.statusDanger,
    fontSize: 12,
    fontWeight: '600'
  },
  modalInfoBox: {
    backgroundColor: THEME.colors.bgSurface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginTop: THEME.spacing.md
  },
  modalInfoTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4
  },
  modalInfoText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17
  }
});
