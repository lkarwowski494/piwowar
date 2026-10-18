/**
 * Piwowar (Brewcraft) — Legacy Database Generator
 * Creates tests/fixtures/v1.0-legacy.db representing a real production database from v1.0.
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const fixturesDir = path.resolve(__dirname, '../tests/fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

const legacyDbPath = path.resolve(fixturesDir, 'v1.0-legacy.db');
if (fs.existsSync(legacyDbPath)) {
  fs.unlinkSync(legacyDbPath);
}

const db = new DatabaseSync(legacyDbPath);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA busy_timeout = 5000;');

// 1. Create v1.0 schema (Version 1 only)
db.exec(`
  CREATE TABLE schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  INSERT INTO schema_migrations (version, name) VALUES (1, 'initial_schema');

  CREATE TABLE bjcp_styles (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    style_code TEXT NOT NULL,
    name TEXT NOT NULL,
    og_min REAL NOT NULL,
    og_max REAL NOT NULL,
    fg_min REAL NOT NULL,
    fg_max REAL NOT NULL,
    ibu_min REAL NOT NULL,
    ibu_max REAL NOT NULL,
    srm_min REAL NOT NULL,
    srm_max REAL NOT NULL,
    abv_min REAL NOT NULL,
    abv_max REAL NOT NULL,
    description TEXT,
    aroma TEXT,
    appearance TEXT,
    flavor TEXT,
    mouthfeel TEXT,
    comments TEXT,
    history TEXT,
    characteristic_ingredients TEXT,
    style_comparison TEXT,
    commercial_examples TEXT
  );

  CREATE TABLE equipment_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    batch_volume_l REAL NOT NULL,
    boil_time_mins INTEGER NOT NULL,
    boil_off_l_per_hr REAL NOT NULL,
    mash_dead_space_l REAL NOT NULL,
    kettle_loss_l REAL NOT NULL,
    fermenter_loss_l REAL NOT NULL,
    cooling_loss_pct REAL NOT NULL,
    brewhouse_efficiency_pct REAL NOT NULL,
    mash_tun_heat_capacity REAL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bjcp_style_id TEXT REFERENCES bjcp_styles(id),
    equipment_profile_id TEXT REFERENCES equipment_profiles(id),
    target_volume_l REAL NOT NULL DEFAULT 20.0,
    target_og_sg REAL NOT NULL,
    target_fg_sg REAL NOT NULL,
    target_ibu REAL NOT NULL,
    target_srm REAL NOT NULL,
    target_abv REAL NOT NULL,
    mash_profile_json TEXT NOT NULL,
    notes TEXT,
    source TEXT DEFAULT 'manual',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE batches (
    id TEXT PRIMARY KEY,
    recipe_id TEXT REFERENCES recipes(id) ON DELETE SET NULL,
    batch_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    brew_date TEXT NOT NULL,
    status TEXT NOT NULL,
    equipment_snapshot_json TEXT NOT NULL,
    recipe_snapshot_json TEXT NOT NULL,
    measured_pre_boil_sg REAL,
    measured_pre_boil_volume_l REAL,
    measured_og_sg REAL,
    measured_fg_sg REAL,
    measured_volume_l REAL,
    calculated_abv REAL,
    calculated_efficiency_pct REAL,
    bottling_date TEXT,
    priming_sugar_type TEXT,
    priming_sugar_grams REAL,
    target_vco2 REAL,
    tasting_notes TEXT,
    bjcp_score INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// 2. Insert sample production historical data
db.exec(`
  INSERT INTO equipment_profiles (
    id, name, is_default, batch_volume_l, boil_time_mins,
    boil_off_l_per_hr, mash_dead_space_l, kettle_loss_l,
    fermenter_loss_l, cooling_loss_pct, brewhouse_efficiency_pct,
    created_at, updated_at
  ) VALUES (
    'eq-garnek-30l', 'Standardowy Kociołek 30L', 1, 20.0, 60,
    3.0, 1.0, 1.5, 1.0, 4.0, 72.0,
    '2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z'
  );

  INSERT INTO recipes (
    id, name, target_volume_l, target_og_sg, target_fg_sg,
    target_ibu, target_srm, target_abv, mash_profile_json,
    created_at, updated_at
  ) VALUES (
    'recipe-legacy-01', 'Staropolskie Jasne Pełne', 20.0, 1.048, 1.010,
    25.0, 4.5, 5.0, '{"steps":[{"name":"Zacieranie","step_temp_c":67,"step_time_mins":60}]}',
    '2026-01-05T12:00:00Z', '2026-01-05T12:00:00Z'
  );

  INSERT INTO batches (
    id, recipe_id, batch_number, name, brew_date, status,
    equipment_snapshot_json, recipe_snapshot_json,
    measured_og_sg, measured_fg_sg, calculated_abv, tasting_notes,
    created_at, updated_at
  ) VALUES (
    'batch-legacy-01', 'recipe-legacy-01', 1, 'Warka #1 — Premierowe Jasne', '2026-01-10', 'bottled',
    '{"name":"Standardowy Kociołek 30L"}', '{"name":"Staropolskie Jasne Pełne"}',
    1.049, 1.011, 5.0, 'Znakomita piana, zbalansowana goryczka',
    '2026-01-10T08:00:00Z', '2026-02-01T18:00:00Z'
  ), (
    'batch-legacy-02', 'recipe-legacy-01', 2, 'Warka #2 — Zimowy Koźlak', '2026-02-15', 'fermenting_primary',
    '{"name":"Standardowy Kociołek 30L"}', '{"name":"Staropolskie Jasne Pełne"}',
    1.065, 1.018, 6.2, 'Fermentacja w 12C z drozdzami W-34/70',
    '2026-02-15T09:00:00Z', '2026-02-20T10:00:00Z'
  );
`);

db.close();
console.log(`Generated ${legacyDbPath} successfully.`);
