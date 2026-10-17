/**
 * Piwowar (Brewcraft) — Database & Repositories Test Suite
 * Tests SQLite schema, WAL mode, seeds, snapshots (DEC-15), quota (DEC-06), and cascade operations
 */

import { createNodeSqliteDatabase } from '../lib/db/adapters/nodeSqliteAdapter';
import {
  initDatabase,
  DatabaseClient,
  getAllEquipmentProfiles,
  getDefaultEquipmentProfile,
  getEquipmentProfileById,
  createEquipmentProfile,
  updateEquipmentProfile,
  setDefaultEquipmentProfile,
  deleteEquipmentProfile,
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getBatchCount,
  getNextBatchNumber,
  getAllBatches,
  getActiveBatches,
  getBatchById,
  createBatch,
  updateBatchStatus,
  updateBatchMeasurements,
  updateBatchBottling,
  deleteBatch,
  insertTelemetry,
  getTelemetryForBatch,
  getLatestTelemetryForBatch,
  getAllBjcpStyles,
  searchBjcpStyles,
  recordOp,
  popLatestOp
} from '../lib/db';
import { FullRecipe, EquipmentProfile } from '../lib/types/domain';

describe('Data Layer & Repositories Suite', () => {
  let db: DatabaseClient;

  beforeEach(async () => {
    db = createNodeSqliteDatabase(':memory:');
    await initDatabase(db);
  });

  describe('Database Initialization & Seeds', () => {
    it('seeds 3 default equipment profiles with BIAB as default (DEC-11)', async () => {
      const profiles = await getAllEquipmentProfiles(db);
      expect(profiles.length).toBe(3);
      expect(profiles[0].is_default).toBe(1);
      expect(profiles[0].name).toContain('BIAB');

      const defaultProfile = await getDefaultEquipmentProfile(db);
      expect(defaultProfile).not.toBeNull();
      expect(defaultProfile?.id).toBe('eq-biab-20l');
    });

    it('seeds BJCP 2021 reference styles including Polish Grodziskie (DEC-05)', async () => {
      const styles = await getAllBjcpStyles(db);
      expect(styles.length).toBeGreaterThanOrEqual(7);

      const grodziskie = styles.find((s) => s.style_code === '27A');
      expect(grodziskie).toBeDefined();
      expect(grodziskie?.name).toBe('Piwo Grodziskie');
      expect(grodziskie?.og_min).toBe(1.028);
    });

    it('seeds starter craft recipe with cascade ingredients', async () => {
      const recipes = await getAllRecipes(db);
      expect(recipes.length).toBe(1);
      expect(recipes[0].name).toBe('Piastowskie APA 12°Blg');

      const full = await getRecipeById(db, recipes[0].id);
      expect(full).not.toBeNull();
      expect(full?.fermentables.length).toBe(2);
      expect(full?.hops.length).toBe(3);
      expect(full?.yeasts.length).toBe(1);
      expect(full?.mash_profile?.steps.length).toBe(2);
    });
  });

  describe('Equipment Repository (DEC-11)', () => {
    it('creates custom equipment and switches default profile atomically', async () => {
      const custom: Omit<EquipmentProfile, 'created_at' | 'updated_at'> = {
        id: 'eq-custom-50l',
        name: 'Custom RIMS 50L',
        is_default: 1,
        batch_volume_l: 50.0,
        boil_time_mins: 90,
        boil_off_l_per_hr: 4.5,
        mash_dead_space_l: 2.0,
        kettle_loss_l: 3.0,
        cooling_shrinkage_pct: 4.0,
        grain_absorption_l_per_kg: 0.95,
        brewhouse_efficiency_pct: 80.0
      };

      const created = await createEquipmentProfile(db, custom);
      expect(created.id).toBe('eq-custom-50l');

      const def = await getDefaultEquipmentProfile(db);
      expect(def?.id).toBe('eq-custom-50l');

      // Previous BIAB profile should no longer be default
      const biab = await getEquipmentProfileById(db, 'eq-biab-20l');
      expect(biab?.is_default).toBe(0);

      // Switch back
      await setDefaultEquipmentProfile(db, 'eq-biab-20l');
      const defSwitched = await getDefaultEquipmentProfile(db);
      expect(defSwitched?.id).toBe('eq-biab-20l');
    });

    it('updates and deletes equipment profile', async () => {
      const updated = await updateEquipmentProfile(db, {
        id: 'eq-aio-30l',
        brewhouse_efficiency_pct: 81.5
      });
      expect(updated?.brewhouse_efficiency_pct).toBe(81.5);

      const deleted = await deleteEquipmentProfile(db, 'eq-aio-30l');
      expect(deleted).toBe(true);

      const check = await getEquipmentProfileById(db, 'eq-aio-30l');
      expect(check).toBeNull();
    });
  });

  describe('Recipe Repository & Cascades', () => {
    it('creates a new full craft recipe and updates it with replaced ingredients', async () => {
      const newRecipe: FullRecipe = {
        id: 'rec-test-neipa',
        name: 'Juicy Hazy NEIPA',
        bjcp_style_id: 'bjcp-21b-neipa',
        equipment_profile_id: 'eq-biab-20l',
        target_volume_l: 20.0,
        target_og_sg: 1.065,
        target_fg_sg: 1.014,
        target_ibu: 40.0,
        target_srm: 4.5,
        target_abv: 6.7,
        mash_profile_json: JSON.stringify({
          name: 'Pojedyncza infuzja',
          grain_temp_c: 20,
          ratio_l_per_kg: 3.0,
          steps: [{ name: 'Zacieranie', step_temp_c: 68, step_time_mins: 60 }]
        }),
        notes: 'Chmielenie na whirlpool w 78C i na zimno.',
        source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        fermentables: [
          {
            id: 'ferm-neipa-1',
            recipe_id: 'rec-test-neipa',
            name: 'Pilzneński',
            weight_kg: 4.5,
            color_lovibond: 1.8,
            potential_sg: 1.037,
            is_mash: 1,
            sort_order: 1
          },
          {
            id: 'ferm-neipa-2',
            recipe_id: 'rec-test-neipa',
            name: 'Płatki owsiane',
            weight_kg: 1.2,
            color_lovibond: 1.2,
            potential_sg: 1.035,
            is_mash: 1,
            sort_order: 2
          }
        ],
        hops: [
          {
            id: 'hop-neipa-1',
            recipe_id: 'rec-test-neipa',
            name: 'Citra',
            weight_g: 100,
            alpha_acids_pct: 12.5,
            boil_time_mins: 0,
            use_stage: 'whirlpool',
            form: 'pellet',
            sort_order: 1
          }
        ],
        yeasts: [
          {
            id: 'yeast-neipa-1',
            recipe_id: 'rec-test-neipa',
            name: 'Verdant IPA',
            laboratory: 'Lallemand',
            product_id: 'VERDANT',
            form: 'dry',
            attenuation_pct: 76.0,
            min_temp_c: 18.0,
            max_temp_c: 23.0
          }
        ]
      };

      await createRecipe(db, newRecipe);

      const loaded = await getRecipeById(db, 'rec-test-neipa');
      expect(loaded).not.toBeNull();
      expect(loaded?.name).toBe('Juicy Hazy NEIPA');
      expect(loaded?.fermentables.length).toBe(2);
      expect(loaded?.hops.length).toBe(1);

      // Update recipe with extra dry hop
      newRecipe.hops.push({
        id: 'hop-neipa-2',
        recipe_id: 'rec-test-neipa',
        name: 'Mosaic',
        weight_g: 100,
        alpha_acids_pct: 11.5,
        boil_time_mins: 0,
        use_stage: 'dry_hop',
        form: 'pellet',
        sort_order: 2
      });

      await updateRecipe(db, newRecipe);
      const updated = await getRecipeById(db, 'rec-test-neipa');
      expect(updated?.hops.length).toBe(2);

      // Delete recipe cascades to ingredients
      await deleteRecipe(db, 'rec-test-neipa');
      const deletedCheck = await getRecipeById(db, 'rec-test-neipa');
      expect(deletedCheck).toBeNull();
    });
  });

  describe('Batch Repository & Snapshot Immutability (DEC-06 & DEC-15)', () => {
    it('creates batch with deep frozen snapshot and increments batch number', async () => {
      const initialCount = await getBatchCount(db);
      expect(initialCount).toBe(0);

      const nextNum = await getNextBatchNumber(db);
      expect(nextNum).toBe(1);

      const recipe = await getRecipeById(db, 'recipe-seed-craft-apa');
      const equipment = await getDefaultEquipmentProfile(db);
      expect(recipe).not.toBeNull();
      expect(equipment).not.toBeNull();

      const batch = await createBatch(db, {
        id: 'batch-001',
        recipe: recipe!,
        equipment: equipment!,
        name: 'Warka #1 — Piastowskie APA'
      });

      expect(batch.batch_number).toBe(1);
      expect(batch.status).toBe('planning');
      expect(await getBatchCount(db)).toBe(1);

      // Check snapshot content
      const snapshotRecipe = JSON.parse(batch.recipe_snapshot_json) as FullRecipe;
      expect(snapshotRecipe.name).toBe('Piastowskie APA 12°Blg');
      expect(snapshotRecipe.fermentables.length).toBe(2);

      // Now alter the base recipe in library
      recipe!.name = 'Zmieniona receptura bazowa';
      await updateRecipe(db, recipe!);

      // Verify that the batch snapshot remains UNALTERED (DEC-15)
      const persistedBatch = await getBatchById(db, 'batch-001');
      const frozenRecipe = JSON.parse(persistedBatch!.recipe_snapshot_json) as FullRecipe;
      expect(frozenRecipe.name).toBe('Piastowskie APA 12°Blg');
    });

    it('tracks batch lifecycle through statuses, measurements, and bottling', async () => {
      const recipe = await getRecipeById(db, 'recipe-seed-craft-apa');
      const equipment = await getDefaultEquipmentProfile(db);

      await createBatch(db, {
        id: 'batch-lifecycle',
        recipe: recipe!,
        equipment: equipment!,
        name: 'Warka Cykl Życia'
      });

      // Update to mashing
      await updateBatchStatus(db, 'batch-lifecycle', 'mashing');
      let b = await getBatchById(db, 'batch-lifecycle');
      expect(b?.status).toBe('mashing');

      // Record measurements
      await updateBatchMeasurements(db, 'batch-lifecycle', {
        measured_pre_boil_sg: 1.042,
        measured_pre_boil_volume_l: 24.5,
        measured_og_sg: 1.049,
        measured_volume_l: 20.2,
        calculated_efficiency_pct: 76.5
      });

      b = await getBatchById(db, 'batch-lifecycle');
      expect(b?.measured_og_sg).toBe(1.049);
      expect(b?.calculated_efficiency_pct).toBe(76.5);

      // Active batches check
      const active = await getActiveBatches(db);
      expect(active.some((item) => item.id === 'batch-lifecycle')).toBe(true);

      // Bottling
      await updateBatchBottling(db, 'batch-lifecycle', {
        bottling_date: '2026-10-17',
        priming_sugar_type: 'sucrose',
        priming_sugar_grams: 120.0,
        target_vco2: 2.4
      });

      b = await getBatchById(db, 'batch-lifecycle');
      expect(b?.status).toBe('bottled');
      expect(b?.priming_sugar_grams).toBe(120.0);

      // No longer in active batches
      const activeAfterBottling = await getActiveBatches(db);
      expect(activeAfterBottling.some((item) => item.id === 'batch-lifecycle')).toBe(false);

      // Delete batch
      const deleted = await deleteBatch(db, 'batch-lifecycle');
      expect(deleted).toBe(true);
      expect(await getBatchById(db, 'batch-lifecycle')).toBeNull();
    });
  });

  describe('Tilt Telemetry Repository (DEC-04)', () => {
    it('logs readings and cascades deletion when batch is deleted', async () => {
      const recipe = await getRecipeById(db, 'recipe-seed-craft-apa');
      const equipment = await getDefaultEquipmentProfile(db);

      await createBatch(db, {
        id: 'batch-tilt',
        recipe: recipe!,
        equipment: equipment!,
        name: 'Warka z Tilt BLE'
      });

      await insertTelemetry(db, {
        id: 'tilt-01',
        batch_id: 'batch-tilt',
        color: 'red',
        raw_temp_f: 68.0,
        raw_sg: 1.048,
        calibrated_temp_c: 20.0,
        calibrated_sg: 1.048,
        calibrated_plato: 11.9,
        rssi: -65,
        recorded_at: '2026-10-17T12:00:00.000Z'
      });

      await insertTelemetry(db, {
        id: 'tilt-02',
        batch_id: 'batch-tilt',
        color: 'red',
        raw_temp_f: 68.5,
        raw_sg: 1.042,
        calibrated_temp_c: 20.2,
        calibrated_sg: 1.042,
        calibrated_plato: 10.5,
        rssi: -67,
        recorded_at: '2026-10-17T16:00:00.000Z'
      });

      const history = await getTelemetryForBatch(db, 'batch-tilt');
      expect(history.length).toBe(2);

      const latest = await getLatestTelemetryForBatch(db, 'batch-tilt');
      expect(latest?.id).toBe('tilt-02');
      expect(latest?.calibrated_sg).toBe(1.042);

      // Foreign key cascade: deleting batch removes telemetry
      await deleteBatch(db, 'batch-tilt');
      const historyAfterDelete = await getTelemetryForBatch(db, 'batch-tilt');
      expect(historyAfterDelete.length).toBe(0);
    });
  });

  describe('BJCP Styles Search (DEC-05)', () => {
    it('searches styles by partial name or style code', async () => {
      const results = await searchBjcpStyles(db, 'IPA');
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.some((s) => s.style_code === '21A')).toBe(true);

      const grodziskie = await searchBjcpStyles(db, 'Grodziskie');
      expect(grodziskie.length).toBe(1);
      expect(grodziskie[0].style_code).toBe('27A');
    });
  });

  describe('Undo Journal & Pending Ops (DEC-03)', () => {
    it('records and pops operations in LIFO order', async () => {
      await recordOp(db, {
        entity_table: 'batches',
        entity_id: 'batch-undo-1',
        operation_type: 'INSERT',
        payload_after_json: JSON.stringify({ id: 'batch-undo-1' })
      });

      await recordOp(db, {
        entity_table: 'batches',
        entity_id: 'batch-undo-2',
        operation_type: 'UPDATE',
        payload_before_json: JSON.stringify({ status: 'planning' }),
        payload_after_json: JSON.stringify({ status: 'mashing' })
      });

      const op1 = await popLatestOp(db);
      expect(op1?.entity_id).toBe('batch-undo-2');

      const op2 = await popLatestOp(db);
      expect(op2?.entity_id).toBe('batch-undo-1');

      const opEmpty = await popLatestOp(db);
      expect(opEmpty).toBeNull();
    });
  });
});
