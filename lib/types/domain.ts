/**
 * Piwowar (Brewcraft) — Domain Types & Data Contracts
 * Zgodny z Tomem D2 BRD v0.1 i DEC-01..DEC-15
 */

export interface BjcpStyle {
  id: string; // e.g. '1B', '21A'
  category: string;
  style_code: string;
  name: string;
  og_min: number;
  og_max: number;
  fg_min: number;
  fg_max: number;
  ibu_min: number;
  ibu_max: number;
  srm_min: number;
  srm_max: number;
  abv_min: number;
  abv_max: number;
  description?: string | null;
  aroma?: string | null;
  appearance?: string | null;
  flavor?: string | null;
  mouthfeel?: string | null;
  comments?: string | null;
  history?: string | null;
  commercial_examples?: string | null;
}

export interface EquipmentProfile {
  id: string;
  name: string;
  is_default: number; // 0 or 1
  batch_volume_l: number; // default 20.0
  boil_time_mins: number; // default 60
  boil_off_l_per_hr: number; // default 3.0
  mash_dead_space_l: number; // default 0.5
  kettle_loss_l: number; // default 1.5
  cooling_shrinkage_pct: number; // default 4.0
  grain_absorption_l_per_kg: number; // default 0.96
  brewhouse_efficiency_pct: number; // default 75.0
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface MashStep {
  name: string;
  step_temp_c: number;
  step_time_mins: number;
  infusion_volume_l?: number;
}

export interface MashProfile {
  name: string;
  grain_temp_c: number;
  ratio_l_per_kg: number;
  steps: MashStep[];
}

export interface Recipe {
  id: string;
  name: string;
  bjcp_style_id?: string | null;
  equipment_profile_id?: string | null;
  target_volume_l: number;
  target_og_sg: number;
  target_fg_sg: number;
  target_ibu: number;
  target_srm: number;
  target_abv: number;
  mash_profile_json: string;
  notes?: string | null;
  source: 'manual' | 'beerxml' | 'seed';
  created_at: string;
  updated_at: string;
}

export interface RecipeFermentable {
  id: string;
  recipe_id: string;
  name: string;
  weight_kg: number;
  color_lovibond: number;
  potential_sg: number;
  is_mash: number; // 1 or 0
  sort_order: number;
}

export interface RecipeHop {
  id: string;
  recipe_id: string;
  name: string;
  weight_g: number;
  alpha_acids_pct: number;
  boil_time_mins: number;
  use_stage: 'boil' | 'dry_hop' | 'whirlpool' | 'first_wort';
  form: 'pellet' | 'plug' | 'leaf';
  sort_order: number;
}

export interface RecipeYeast {
  id: string;
  recipe_id: string;
  name: string;
  laboratory?: string | null;
  product_id?: string | null;
  form: 'dry' | 'liquid';
  attenuation_pct: number;
  min_temp_c: number;
  max_temp_c: number;
}

export interface FullRecipe extends Recipe {
  fermentables: RecipeFermentable[];
  hops: RecipeHop[];
  yeasts: RecipeYeast[];
  mash_profile?: MashProfile;
}

export type BatchStatus =
  | 'planning'
  | 'mashing'
  | 'boiling'
  | 'fermenting_primary'
  | 'fermenting_secondary'
  | 'cold_crash'
  | 'bottled'
  | 'archived';

export interface Batch {
  id: string;
  recipe_id?: string | null;
  batch_number: number;
  name: string;
  brew_date: string;
  status: BatchStatus;
  equipment_snapshot_json: string;
  recipe_snapshot_json: string;
  measured_pre_boil_sg?: number | null;
  measured_pre_boil_volume_l?: number | null;
  measured_og_sg?: number | null;
  measured_fg_sg?: number | null;
  measured_volume_l?: number | null;
  calculated_abv?: number | null;
  calculated_efficiency_pct?: number | null;
  bottling_date?: string | null;
  priming_sugar_type?: 'sucrose' | 'dextrose' | 'dme' | null;
  priming_sugar_grams?: number | null;
  target_vco2?: number | null;
  tasting_notes?: string | null;
  bjcp_score?: number | null;
  created_at: string;
  updated_at: string;
}

export type TiltColor =
  | 'red'
  | 'green'
  | 'black'
  | 'purple'
  | 'orange'
  | 'blue'
  | 'yellow'
  | 'pink';

export interface TiltTelemetry {
  id: string;
  batch_id: string;
  color: TiltColor;
  raw_temp_f: number;
  raw_sg: number;
  calibrated_temp_c: number;
  calibrated_sg: number;
  calibrated_plato: number;
  rssi?: number | null;
  recorded_at: string;
}

export type OperationType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface PendingOp {
  id: string;
  entity_table: string;
  entity_id: string;
  operation_type: OperationType;
  payload_before_json?: string | null;
  payload_after_json?: string | null;
  created_at: string;
}

export const FREE_BATCH_LIMIT = 3;

export interface AccessState {
  isPro: boolean;
  totalBatchesCreated: number;
  batchesRemaining: number;
  canCreateBatch: boolean;
}

export interface WaterProfile {
  ca: number;
  mg: number;
  na: number;
  so4: number;
  cl: number;
  hco3: number;
}
