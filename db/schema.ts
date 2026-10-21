import {
  pgTable,
  pgEnum,
  uuid,
  integer,
  varchar,
  text,
  numeric,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ============================================================================
// 1. PostgreSQL Enums
// ============================================================================

export const tierTypeEnum = pgEnum('tier_type', [
  'STARTER_KIT',
  'COHORT_BOOTCAMP',
  'STUDIO_LICENSE',
  'SAAS_PRO_PIPELINE',
]);

export const pipelineStageEnum = pgEnum('pipeline_stage', [
  'BLENDER_MCP_GEN',
  'KDTREE_CORRIDOR_AUDIT',
  'CONTRACT_VALIDATION',
  'VISUAL_QA_LOOP',
  'GLTF_CHUNK_EXPORT',
  'GODOT_HEADLESS_TEST',
]);

export const validationStatusEnum = pgEnum('validation_status', [
  'PASSED',
  'WARNING',
  'FAILED',
  'RUNNING',
]);

export const artifactCategoryEnum = pgEnum('artifact_category', [
  'BPY_HARNESS',
  'JSON_CONTRACT',
  'AGENT_SKILL',
  'GODOT_RUNTIME',
  'GDSCRIPT_TEST',
]);

// ============================================================================
// 2. JSONB Structural Types for Drizzle Columns
// ============================================================================

export interface PipelineStageResultRecord {
  stage:
    | 'BLENDER_MCP_GEN'
    | 'KDTREE_CORRIDOR_AUDIT'
    | 'CONTRACT_VALIDATION'
    | 'VISUAL_QA_LOOP'
    | 'GLTF_CHUNK_EXPORT'
    | 'GODOT_HEADLESS_TEST';
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'RUNNING';
  duration_ms: number;
  summary: string;
  metrics: Record<string, string | number | boolean>;
}

// ============================================================================
// 3. Database Tables
// ============================================================================

/**
 * Curriculum Modules for the 8-Week Agentic GameDev Masterclass & Bootcamp.
 */
export const curriculum_modules = pgTable(
  'curriculum_modules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    module_number: integer('module_number').notNull(),
    slug: varchar('slug', { length: 120 }).notNull(),
    title: varchar('title', { length: 180 }).notNull(),
    subtitle: varchar('subtitle', { length: 320 }).notNull(),
    duration_minutes: integer('duration_minutes').notNull(),
    video_lessons_count: integer('video_lessons_count').notNull(),
    key_deliverables: jsonb('key_deliverables').$type<string[]>().notNull(),
    code_template_filename: varchar('code_template_filename', { length: 160 }).notNull(),
    completion_rate_percent: numeric('completion_rate_percent', {
      precision: 5,
      scale: 2,
    }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    moduleNumberUniqueIdx: uniqueIndex('curriculum_modules_number_uq').on(table.module_number),
    slugUniqueIdx: uniqueIndex('curriculum_modules_slug_uq').on(table.slug),
  })
);

/**
 * Production Boilerplate Artifacts (BPY Harnesses, JSON Contracts, Agent Skills, Godot Runtime & Tests).
 */
export const boilerplate_artifacts = pgTable(
  'boilerplate_artifacts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    filename: varchar('filename', { length: 180 }).notNull(),
    category: artifactCategoryEnum('category').notNull(),
    description: text('description').notNull(),
    lines_of_code: integer('lines_of_code').notNull(),
    version: varchar('version', { length: 32 }).notNull(),
    source_preview: text('source_preview').notNull(),
    download_count: integer('download_count').default(0).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    filenameUniqueIdx: uniqueIndex('boilerplate_artifacts_filename_uq').on(table.filename),
    categoryIdx: index('boilerplate_artifacts_category_idx').on(table.category),
  })
);

/**
 * Autonomous Blender-to-Godot CI/CD Pipeline Validation Runs.
 * Tracks KDTree corridor audits, contract validations, visual QA loops, and headless Godot 4.x test runs.
 */
export const pipeline_runs = pgTable(
  'pipeline_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    project_name: varchar('project_name', { length: 140 }).notNull(),
    sector_range: varchar('sector_range', { length: 80 }).notNull(),
    total_objects_verified: integer('total_objects_verified').notNull(),
    corridor_clearance_percent: numeric('corridor_clearance_percent', {
      precision: 5,
      scale: 2,
    }).notNull(),
    active_lights_pooled: integer('active_lights_pooled').notNull(),
    rain_particles_count: integer('rain_particles_count').notNull(),
    godot_tests_passed: integer('godot_tests_passed').notNull(),
    godot_tests_total: integer('godot_tests_total').notNull(),
    physics_tick_ms: numeric('physics_tick_ms', { precision: 6, scale: 3 }).notNull(),
    peak_memory_mb: numeric('peak_memory_mb', { precision: 6, scale: 1 }).notNull(),
    status: validationStatusEnum('status').notNull(),
    stage_results: jsonb('stage_results').$type<PipelineStageResultRecord[]>().notNull(),
    triggered_by: varchar('triggered_by', { length: 120 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index('pipeline_runs_status_idx').on(table.status),
    createdAtIdx: index('pipeline_runs_created_at_idx').on(table.created_at),
  })
);

/**
 * Enrollments & Commercial Licenses across the 4-Tier Revenue Funnel.
 * Strictly stores masked PII (`buyer_email_masked`) and integer cent precision (`amount_cents`).
 */
export const enrollments_and_licenses = pgTable(
  'enrollments_and_licenses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    buyer_email_masked: varchar('buyer_email_masked', { length: 160 }).notNull(),
    buyer_handle: varchar('buyer_handle', { length: 80 }).notNull(),
    tier: tierTypeEnum('tier').notNull(),
    amount_cents: integer('amount_cents').notNull(),
    github_repo_provisioned: boolean('github_repo_provisioned').default(true).notNull(),
    license_key_prefix: varchar('license_key_prefix', { length: 64 }).notNull(),
    cohort_batch: varchar('cohort_batch', { length: 64 }),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tierIdx: index('enrollments_and_licenses_tier_idx').on(table.tier),
    createdAtIdx: index('enrollments_and_licenses_created_at_idx').on(table.created_at),
  })
);

// ============================================================================
// 4. Inferred Drizzle Row Types
// ============================================================================

export type CurriculumModuleRow = typeof curriculum_modules.$inferSelect;
export type NewCurriculumModuleRow = typeof curriculum_modules.$inferInsert;

export type BoilerplateArtifactRow = typeof boilerplate_artifacts.$inferSelect;
export type NewBoilerplateArtifactRow = typeof boilerplate_artifacts.$inferInsert;

export type PipelineRunRow = typeof pipeline_runs.$inferSelect;
export type NewPipelineRunRow = typeof pipeline_runs.$inferInsert;

export type EnrollmentAndLicenseRow = typeof enrollments_and_licenses.$inferSelect;
export type NewEnrollmentAndLicenseRow = typeof enrollments_and_licenses.$inferInsert;
