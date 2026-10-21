/**
 * MomentumForge AI — Production TypeScript Domain Interfaces & API DTOs
 * Autonomous Blender-to-Godot Agentic GameDev Boilerplate, Masterclass & CI/CD Platform
 */

// ============================================================================
// 1. Domain Enumerations
// ============================================================================

export const TIER_TYPES = [
  'STARTER_KIT',
  'COHORT_BOOTCAMP',
  'STUDIO_LICENSE',
  'SAAS_PRO_PIPELINE',
] as const;
export type TierType = (typeof TIER_TYPES)[number];

export const PIPELINE_STAGES = [
  'BLENDER_MCP_GEN',
  'KDTREE_CORRIDOR_AUDIT',
  'CONTRACT_VALIDATION',
  'VISUAL_QA_LOOP',
  'GLTF_CHUNK_EXPORT',
  'GODOT_HEADLESS_TEST',
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const VALIDATION_STATUSES = [
  'PASSED',
  'WARNING',
  'FAILED',
  'RUNNING',
] as const;
export type ValidationStatus = (typeof VALIDATION_STATUSES)[number];

export const ARTIFACT_CATEGORIES = [
  'BPY_HARNESS',
  'JSON_CONTRACT',
  'AGENT_SKILL',
  'GODOT_RUNTIME',
  'GDSCRIPT_TEST',
] as const;
export type ArtifactCategory = (typeof ARTIFACT_CATEGORIES)[number];

// ============================================================================
// 2. Database Table Entity Interfaces
// ============================================================================

export interface CurriculumModule {
  id: string;
  module_number: number;
  slug: string;
  title: string;
  subtitle: string;
  duration_minutes: number;
  video_lessons_count: number;
  key_deliverables: string[];
  code_template_filename: string;
  completion_rate_percent: number;
  created_at: string;
}

export interface BoilerplateArtifact {
  id: string;
  filename: string;
  category: ArtifactCategory;
  description: string;
  lines_of_code: number;
  version: string;
  source_preview: string;
  download_count: number;
  created_at: string;
}

export interface PipelineStageResult {
  stage: PipelineStage;
  status: ValidationStatus;
  duration_ms: number;
  summary: string;
  metrics: Record<string, string | number | boolean>;
}

export interface PipelineRun {
  id: string;
  project_name: string;
  sector_range: string;
  total_objects_verified: number;
  corridor_clearance_percent: number;
  active_lights_pooled: number;
  rain_particles_count: number;
  godot_tests_passed: number;
  godot_tests_total: number;
  physics_tick_ms: number;
  peak_memory_mb: number;
  status: ValidationStatus;
  stage_results: PipelineStageResult[];
  triggered_by: string;
  created_at: string;
}

export interface EnrollmentAndLicense {
  id: string;
  buyer_email_masked: string;
  buyer_handle: string;
  tier: TierType;
  amount_cents: number;
  github_repo_provisioned: boolean;
  license_key_prefix: string;
  cohort_batch: string | null;
  created_at: string;
}

// ============================================================================
// 3. API Request & Response DTOs
// ============================================================================

export type CurriculumModuleResponse = CurriculumModule;

export type BoilerplateArtifactResponse = BoilerplateArtifact;

export interface BoilerplateFilterParams {
  category?: ArtifactCategory;
  search?: string;
}

/**
 * Payload for triggering a live Blender-to-Godot CI/CD validation run.
 */
export interface PipelineRunCreateRequest {
  project_name: string;
  sector_start: number;
  sector_end: number;
  corridor_min_clearance_m?: number;
  max_pooled_lights?: number;
  target_rain_particles?: number;
  inject_corridor_obstruction?: boolean;
  triggered_by: string;
}

export type PipelineRunResponse = PipelineRun;

/**
 * Payload for purchasing or provisioning a Boilerplate License, Cohort Bootcamp seat,
 * Studio License, or SaaS Pro Pipeline subscription.
 */
export interface LicenseCheckoutRequest {
  buyer_email: string;
  buyer_handle: string;
  tier: TierType;
  cohort_batch?: string | null;
  github_org_or_user?: string;
}

export interface LicenseCheckoutResponse {
  id: string;
  buyer_email_masked: string;
  buyer_handle: string;
  tier: TierType;
  amount_cents: number;
  amount_usd: number;
  github_repo_provisioned: boolean;
  license_key_prefix: string;
  cohort_batch: string | null;
  download_bundle_ready: boolean;
  provisioning_message: string;
  created_at: string;
}

export interface TierRevenueBreakdown {
  tier: TierType;
  label: string;
  price_usd: number;
  units_sold: number;
  revenue_usd: number;
}

export interface GameStoryPhase {
  id: string;
  phase_number: number;
  code: string;
  title: string;
  cinematic_id: string;
  setting: string;
  lore_synopsis: string;
  level_mechanics: string[];
  operative_variant: string;
  soundtrack_tempo: string;
  cinematic_camera_prompt: string;
}

export type GameStoryPhaseResponse = GameStoryPhase;

/**
 * Telemetry & Revenue Funnel Metrics across the 4-Tier Platform.
 */
export interface PlatformMetricsResponse {
  total_revenue_usd: number;
  total_revenue_cents: number;
  starter_kits_sold: number;
  cohort_seats_filled: number;
  cohort_seats_capacity: number;
  studio_licenses_sold: number;
  active_saas_pipelines: number;
  total_pipeline_runs: number;
  pipeline_pass_rate_percent: number;
  avg_pipeline_speedup_x: number;
  verified_track_distance_km: number;
  tier_breakdown: TierRevenueBreakdown[];
}
