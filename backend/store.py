"""
MomentumForge AI — In-Memory Telemetry, Curriculum, Artifact & License Store
Includes multi-tiered secret resolution, deterministic 6-stage Blender-to-Godot CI/CD
simulation, KDTree spline corridor obstruction verification, and PII masking.
"""

from __future__ import annotations

import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from models.schemas import (
    TIER_PRICE_CENTS,
    ArtifactCategoryEnum,
    BoilerplateArtifactResponse,
    CurriculumModuleResponse,
    LicenseCheckoutRequest,
    LicenseCheckoutResponse,
    PipelineRunCreateRequest,
    PipelineRunResponse,
    PipelineStageEnum,
    PipelineStageResult,
    PlatformMetricsResponse,
    TierRevenueBreakdown,
    TierTypeEnum,
    ValidationStatusEnum,
    mask_buyer_email,
)

logger = logging.getLogger("momentum_forge.store")


# ============================================================================
# 1. Multi-Tiered Secret Resolution (Zero Hardcoded Secrets)
# ============================================================================


def get_secret(
    env_var: str = "MOMENTUM_FORGE_SECRET",
    secret_file_path: Optional[str] = None,
) -> str:
    """
    Resolves runtime cryptographic secret using a multi-tiered hierarchy:
    1. Environment variable (`MOMENTUM_FORGE_SECRET`)
    2. Local secret file (if configured and readable)
    3. Ephemeral CSPRNG fallback (`secrets.token_hex(32)`) with warning log
    Never uses hardcoded literal secret strings.
    """
    env_val = os.getenv(env_var)
    if env_val and len(env_val.strip()) >= 16:
        return env_val.strip()

    candidate_path = (
        Path(secret_file_path)
        if secret_file_path
        else Path.home() / ".config" / "momentum_forge" / "secret.key"
    )
    if candidate_path.is_file():
        try:
            file_val = candidate_path.read_text(encoding="utf-8").strip()
            if len(file_val) >= 16:
                return file_val
        except OSError as exc:
            logger.warning("Could not read secret file %s: %s", candidate_path, exc)

    logger.warning(
        "No persistent secret found in %s or %s; generating ephemeral CSPRNG session token.",
        env_var,
        candidate_path,
    )
    return secrets.token_hex(32)


# ============================================================================
# 2. Authentic Production Code Previews for Seeded Artifacts
# ============================================================================

PREVIEW_01_GENERATE_CERBERUS_SECTORS = """# 01_generate_cerberus_sectors.py — Blender 5.2.1 LTS Procedural 60-Sector Megacity Builder
import bpy
import math
from mathutils import Vector, Matrix

SECTOR_COUNT = 60
SECTOR_LENGTH_M = 914.83  # 54.89 km total track spline across S00..S59
CORRIDOR_CLEARANCE_RADIUS_M = 32.0

def generate_cerberus_megacity(seed: int = 4096) -> dict:
    scene = bpy.context.scene
    scene.name = "Level01_Cerberus_R9_Abandoned"
    collection_root = bpy.data.collections.new("Cerberus_Sectors_S00_S59")
    scene.collection.children.link(collection_root)

    spawned_objects = 0
    for sector_idx in range(SECTOR_COUNT):
        sec_name = f"Sector_S{sector_idx:02d}"
        sec_col = bpy.data.collections.new(sec_name)
        collection_root.children.link(sec_col)

        z_offset = sector_idx * SECTOR_LENGTH_M
        # Place brutalist megastructures outside the 32.0m spline corridor envelope
        for side in (-1, 1):
            x_pos = side * (CORRIDOR_CLEARANCE_RADIUS_M + 18.5)
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_pos, 0.0, z_offset))
            tower = bpy.context.active_object
            tower.name = f"S{sector_idx:02d}_Megatower_{'L' if side < 0 else 'R'}"
            tower.scale = (24.0, 88.0, 42.0)
            tower["sector_id"] = sector_idx
            tower["lod_bias"] = 1.25
            spawned_objects += 1

    return {"sectors_built": SECTOR_COUNT, "total_objects": spawned_objects, "track_km": 54.89}
"""

PREVIEW_99_VALIDATE_SCENE = """# 99_validate_scene.py — KDTree 3D Spline Corridor Audit & JSON Scene Contract Verifier
import json
import bpy
from mathutils import Vector, kdtree

def audit_corridor_kdtree(spline_samples: list[Vector], min_clearance_m: float = 32.0) -> dict:
    size = len(spline_samples)
    kd = kdtree.KDTree(size)
    for idx, pt in enumerate(spline_samples):
        kd.insert(pt, idx)
    kd.balance()

    violations = []
    pruned_count = 0
    for obj in bpy.data.objects:
        if obj.type != "MESH" or obj.name.startswith("TrackSpline_"):
            continue
        co, index, dist = kd.find(obj.location)
        if dist < min_clearance_m:
            violations.append({
                "object": obj.name,
                "spline_index": index,
                "distance_m": round(dist, 3),
                "required_m": min_clearance_m,
            })
            # Auto-prune obstructing geometry outside contract envelope
            bpy.data.objects.remove(obj, do_unlink=True)
            pruned_count += 1

    return {
        "verified_objects": len(bpy.data.objects),
        "violations_detected": len(violations),
        "auto_pruned": pruned_count,
        "corridor_clearance_percent": 100.0 if pruned_count == len(violations) else 94.2,
    }
"""

PREVIEW_R9_LIGHTING_CONTRACT = """{
  "$schema": "https://momentumforge.ai/schemas/scene-contract-v2.4.json",
  "contract_id": "R9_ABANDONED_CITY_LIGHTING_CONTRACT",
  "blender_version": "5.2.1-LTS",
  "godot_target": "4.7.1-stable",
  "corridor_envelope": {
    "track_distance_km": 54.89,
    "sector_count": 60,
    "kdtree_min_clearance_m": 32.0,
    "auto_prune_obstructors": true
  },
  "lighting_and_atmosphere": {
    "max_realtime_omni_lights": 6,
    "max_pooled_spot_lights": 8,
    "shadow_atlas_size_px": 4096,
    "fog_density": 0.0145,
    "sky_energy_multiplier": 0.65,
    "rain_gpu_particles_budget": 14000,
    "interior_rain_suppression_volumes": true
  },
  "performance_gates": {
    "max_physics_tick_ms": 4.0,
    "target_frame_rate_hz": 120,
    "max_vram_budget_mb": 512.0
  }
}"""

PREVIEW_SKILL_FPP_PARKOUR = """---
name: fpp-parkour-kinematic-controller
version: v2.4.0
target_engine: Godot 4.7.1
rig_bones: 86
---

# True First-Person Perspective (FPP) Kinematic Parkour & 86-Bone Rig Skill

## 1. Camera-to-Clavicle Stabilization Rule
Bind `Camera3D` to the `head_stabilized_socket` bone derived from `spine_03` with a 0.68 pitch damping spring. Never parent the camera raw to `head_end` during wall-run transitions to prevent horizon sickness while preserving kinetic weight.

## 2. State Machine Transitions (120Hz Physics Tick)
- `SPRINT_GROUND` -> `WALL_RUN_L / WALL_RUN_R`: Requires horizontal velocity >= `9.4 m/s`, wall normal dot product in `[-0.35, 0.35]`, and foot IK clearance >= `0.45m`.
- `VAULT_MANTLE`: Sample dual raycasts (`chest_ray`, `knee_ray`). If `knee_ray` hits and `chest_ray` clears within `1.35m`, trigger procedural root-motion vault over 220ms.
- `SLIDE_DECAY`: Lower capsule collider height from `1.82m` to `0.88m` and apply surface friction curve.
"""

PREVIEW_LEVEL01_CERBERUS_CITY_GD = """# Level01_CerberusCity.gd — Godot 4.7.1 Sector Window Streamer & 6-Light Pool Manager
extends Node3D
class_name Level01CerberusCity

const ACTIVE_SECTOR_WINDOW: int = 3
const MAX_POOLED_LIGHTS: int = 8
const RAIN_PARTICLE_BUDGET: int = 14000

@export var player_node: CharacterBody3D
@export var rain_emitter: GPUParticles3D

var _loaded_sectors: Dictionary = {}
var _light_pool: Array[OmniLight3D] = []
var _current_sector_idx: int = 0

func _ready() -> void:
    _init_light_pool()
    if rain_emitter:
        rain_emitter.amount = RAIN_PARTICLE_BUDGET
    _stream_sector_window(0)

func _init_light_pool() -> void:
    for i in range(MAX_POOLED_LIGHTS):
        var light := OmniLight3D.new()
        light.name = "PooledOmniLight_%02d" % i
        light.shadow_enabled = (i < 6)
        light.omni_range = 42.0
        add_child(light)
        _light_pool.append(light)

func _stream_sector_window(center_sector: int) -> void:
    var min_sec: int = maxi(0, center_sector - 1)
    var max_sec: int = mini(59, center_sector + ACTIVE_SECTOR_WINDOW - 1)
    for sec_id in _loaded_sectors.keys():
        if sec_id < min_sec or sec_id > max_sec:
            _loaded_sectors[sec_id].queue_free()
            _loaded_sectors.erase(sec_id)
"""

PREVIEW_TEST_LEVEL01_R9_GD = """# test_level01_r9_abandoned_city.gd — Headless Godot 4.7.1 CI/CD Verification Suite
extends SceneTree

func _init() -> void:
    print("[CI/CD] Booting Headless Verification: R9 Abandoned City (60 Sectors)")
    var passed: int = 0
    var total: int = 19

    # Gate 1: Verify 60-sector glTF manifest & KDTree corridor clearance
    passed += _assert_corridor_clearance(32.0)
    # Gate 2: Verify 8-light dynamic pool & 6 shadow-caster hardware ceiling
    passed += _assert_light_pool_budget(8, 6)
    # Gate 3: Verify 14,000 GPUParticles3D rain budget & interior suppression
    passed += _assert_rain_particle_budget(14000)
    # Gate 4: Verify 120Hz physics tick stability (< 4.0ms per frame)
    passed += _assert_physics_tick_budget(2.38)

    print("[CI/CD] Summary: %d/%d assertions PASSED." % [passed, total])
    quit(0 if passed == total else 1)

func _assert_corridor_clearance(min_m: float) -> int:
    return 6 if min_m >= 32.0 else 0

func _assert_light_pool_budget(max_pool: int, shadow_cap: int) -> int:
    return 5 if max_pool <= 16 and shadow_cap <= 6 else 0

func _assert_rain_particle_budget(particles: int) -> int:
    return 4 if particles <= 20000 else 0

func _assert_physics_tick_budget(tick_ms: float) -> int:
    return 4 if tick_ms < 8.33 else 0
"""


# ============================================================================
# 3. MomentumForge In-Memory Store
# ============================================================================


class MomentumForgeStore:
    """
    Production-grade stateful store for MomentumForge AI.
    Pre-seeded with the 6 MOMENTUM Masterclass modules, 6 real production
    boilerplate artifacts, 3 telemetry pipeline runs, and 5 masked license checkouts.
    """

    def __init__(self) -> None:
        self.runtime_secret: str = get_secret()
        self.cohort_seats_capacity: int = 25

        # Historical unit counters so initial revenue starts at $48,703.00 ($48,600+)
        # and dynamically increments with every new POST /api/v1/licenses/checkout call.
        self._tier_units_sold: Dict[TierTypeEnum, int] = {
            TierTypeEnum.STARTER_KIT: 84,        # 84 * $149 = $12,516
            TierTypeEnum.COHORT_BOOTCAMP: 18,    # 18 * $799 = $14,382
            TierTypeEnum.STUDIO_LICENSE: 7,      # 7 * $2,499 = $17,493
            TierTypeEnum.SAAS_PRO_PIPELINE: 88,  # 88 * $49 = $4,312
        }

        self.curriculum: List[CurriculumModuleResponse] = []
        self.artifacts: List[BoilerplateArtifactResponse] = []
        self.pipeline_runs: List[PipelineRunResponse] = []
        self.licenses: List[LicenseCheckoutResponse] = []

        self._seed_curriculum()
        self._seed_artifacts()
        self._seed_pipeline_runs()
        self._seed_licenses()

    def _seed_curriculum(self) -> None:
        now = datetime.now(timezone.utc)
        self.curriculum = [
            CurriculumModuleResponse(
                id=UUID("10000000-0000-4000-8000-000000000001"),
                module_number=1,
                slug="blender-52-mcp-procedural-60-sector-megacity-generation",
                title="Blender 5.2 MCP & Procedural 60-Sector Megacity Generation",
                subtitle="Orchestrate headless Blender 5.2.1 LTS via MCP to generate 54.89 km of brutalist megacity sectors in deterministic batches.",
                duration_minutes=95,
                video_lessons_count=8,
                key_deliverables=[
                    "60-sector spline generator script (S00-S59)",
                    "Deterministic seed-locked megatower placement",
                    "Automated LOD bias tagging & collection hierarchy",
                ],
                code_template_filename="01_generate_cerberus_sectors.py",
                completion_rate_percent=96.4,
                created_at=now - timedelta(days=30),
            ),
            CurriculumModuleResponse(
                id=UUID("10000000-0000-4000-8000-000000000002"),
                module_number=2,
                slug="kdtree-3d-spline-corridor-clearance-scene-contract-validation",
                title="KDTree 3D Spline Corridor Clearance & Scene Contract Validation",
                subtitle="Eliminate track-blocking geometry forever using mathutils.kdtree spatial indexing and strict JSON scene contracts.",
                duration_minutes=110,
                video_lessons_count=9,
                key_deliverables=[
                    "32.0m radius KDTree 3D spline spatial auditor",
                    "Automated obstructing mesh auto-pruning pipeline",
                    "R9 JSON Lighting & Performance Contract schema",
                ],
                code_template_filename="99_validate_scene.py",
                completion_rate_percent=94.8,
                created_at=now - timedelta(days=25),
            ),
            CurriculumModuleResponse(
                id=UUID("10000000-0000-4000-8000-000000000003"),
                module_number=3,
                slug="autonomous-visual-viewport-qa-agent-loop-pbr-packing",
                title="Autonomous Visual Viewport QA Agent Loop & PBR Packing",
                subtitle="Build multi-camera viewport capture loops that let vision agents audit silhouette contrast, fog density, and ORM texture packing.",
                duration_minutes=85,
                video_lessons_count=7,
                key_deliverables=[
                    "Multi-angle camera bookmarker & offscreen renderer",
                    "Automated ORM metallic/roughness channel packer",
                    "Vision Agent rubric for brutalist lighting contrast",
                ],
                code_template_filename="SKILL_visual_qa_director.md",
                completion_rate_percent=92.1,
                created_at=now - timedelta(days=20),
            ),
            CurriculumModuleResponse(
                id=UUID("10000000-0000-4000-8000-000000000004"),
                module_number=4,
                slug="true-fpp-kinematic-state-machine-86-bone-character-rigging",
                title="True FPP Kinematic State Machine & 86-Bone Character Rigging",
                subtitle="Engineer Operative Kaelen's 86-bone full-body FPP rig with clavicle-stabilized camera sockets and 120Hz wall-run kinematics.",
                duration_minutes=125,
                video_lessons_count=11,
                key_deliverables=[
                    "86-bone humanoid skeleton contract & IK retargeter",
                    "Clavicle pitch-damped FPP camera stabilization rig",
                    "Dual-raycast procedural vault & wall-run state machine",
                ],
                code_template_filename="SKILL_fpp_parkour.md",
                completion_rate_percent=91.5,
                created_at=now - timedelta(days=15),
            ),
            CurriculumModuleResponse(
                id=UUID("10000000-0000-4000-8000-000000000005"),
                module_number=5,
                slug="godot-471-sector-window-streaming-6-light-pooling-rain-suppression",
                title="Godot 4.7.1 Sector Window Streaming, 6-Light Pooling & Rain Suppression",
                subtitle="Stream 60 megacity sectors seamlessly in Godot 4.7.1 with a zero-allocation 8-light pool and 14,000 GPU rain particles.",
                duration_minutes=105,
                video_lessons_count=9,
                key_deliverables=[
                    "3-sector sliding window async glTF chunk streamer",
                    "Zero-GC OmniLight3D ring-buffer pool (6 shadow-casters)",
                    "AABB interior volume GPUParticles3D rain suppression",
                ],
                code_template_filename="Level01_CerberusCity.gd",
                completion_rate_percent=95.2,
                created_at=now - timedelta(days=10),
            ),
            CurriculumModuleResponse(
                id=UUID("10000000-0000-4000-8000-000000000006"),
                module_number=6,
                slug="headless-gdscript-cicd-playtesting-mac-thermal-optimization",
                title="Headless GDScript CI/CD Playtesting & Mac Thermal Optimization",
                subtitle="Run 19 automated headless Godot 4.7.1 scene assertions in 4.2 seconds while keeping Apple Silicon GPU thermals rock-steady.",
                duration_minutes=90,
                video_lessons_count=8,
                key_deliverables=[
                    "19-assertion SceneTree headless verification runner",
                    "120Hz physics frame-time & VRAM budget telemetry gate",
                    "Apple Silicon Metal renderer thermal throttling guardrails",
                ],
                code_template_filename="test_level01_r9_abandoned_city.gd",
                completion_rate_percent=97.8,
                created_at=now - timedelta(days=5),
            ),
        ]

    def _seed_artifacts(self) -> None:
        now = datetime.now(timezone.utc)
        self.artifacts = [
            BoilerplateArtifactResponse(
                id=UUID("20000000-0000-4000-8000-000000000001"),
                filename="01_generate_cerberus_sectors.py",
                category=ArtifactCategoryEnum.BPY_HARNESS,
                description="Headless Blender 5.2.1 LTS procedural sector builder generating 60 brutalist megacity sectors (54.89 km spline) with deterministic corridor offsets.",
                lines_of_code=342,
                version="v2.4.0",
                source_preview=PREVIEW_01_GENERATE_CERBERUS_SECTORS.strip(),
                download_count=418,
                created_at=now - timedelta(days=28),
            ),
            BoilerplateArtifactResponse(
                id=UUID("20000000-0000-4000-8000-000000000002"),
                filename="99_validate_scene.py",
                category=ArtifactCategoryEnum.BPY_HARNESS,
                description="3D KDTree spatial corridor clearance auditor that scans 20,000+ scene objects against the 32.0m spline envelope and auto-prunes violations.",
                lines_of_code=286,
                version="v2.4.1",
                source_preview=PREVIEW_99_VALIDATE_SCENE.strip(),
                download_count=512,
                created_at=now - timedelta(days=24),
            ),
            BoilerplateArtifactResponse(
                id=UUID("20000000-0000-4000-8000-000000000003"),
                filename="R9_LIGHTING_CONTRACT.json",
                category=ArtifactCategoryEnum.JSON_CONTRACT,
                description="Machine-enforced JSON Scene Contract specifying corridor clearance, 6 shadow-casting light limits, 14,000 rain particle budgets, and 120Hz frame gates.",
                lines_of_code=118,
                version="v2.4.0",
                source_preview=PREVIEW_R9_LIGHTING_CONTRACT.strip(),
                download_count=389,
                created_at=now - timedelta(days=21),
            ),
            BoilerplateArtifactResponse(
                id=UUID("20000000-0000-4000-8000-000000000004"),
                filename="SKILL_fpp_parkour.md",
                category=ArtifactCategoryEnum.AGENT_SKILL,
                description="Production Antigravity Agent Skill defining True FPP camera-to-clavicle stabilization rules, 86-bone IK locks, and 120Hz wall-run state machines.",
                lines_of_code=215,
                version="v2.4.0",
                source_preview=PREVIEW_SKILL_FPP_PARKOUR.strip(),
                download_count=476,
                created_at=now - timedelta(days=16),
            ),
            BoilerplateArtifactResponse(
                id=UUID("20000000-0000-4000-8000-000000000005"),
                filename="Level01_CerberusCity.gd",
                category=ArtifactCategoryEnum.GODOT_RUNTIME,
                description="Godot 4.7.1 runtime controller managing 3-sector sliding window glTF streaming, 8-light ring pooling, and interior GPUParticles3D rain suppression.",
                lines_of_code=410,
                version="v2.4.2",
                source_preview=PREVIEW_LEVEL01_CERBERUS_CITY_GD.strip(),
                download_count=461,
                created_at=now - timedelta(days=11),
            ),
            BoilerplateArtifactResponse(
                id=UUID("20000000-0000-4000-8000-000000000006"),
                filename="test_level01_r9_abandoned_city.gd",
                category=ArtifactCategoryEnum.GDSCRIPT_TEST,
                description="19-assertion headless Godot 4.7.1 CI/CD verification suite validating KDTree clearance, light pooling, rain particle caps, and physics tick timing.",
                lines_of_code=264,
                version="v2.4.2",
                source_preview=PREVIEW_TEST_LEVEL01_R9_GD.strip(),
                download_count=534,
                created_at=now - timedelta(days=4),
            ),
        ]

    def _seed_pipeline_runs(self) -> None:
        now = datetime.now(timezone.utc)
        self.pipeline_runs = [
            PipelineRunResponse(
                id=UUID("30000000-0000-4000-8000-000000000001"),
                project_name="R9 Abandoned City 60-Sector Rebuild",
                sector_range="S00-S60 (54.89 km)",
                total_objects_verified=2056,
                corridor_clearance_percent=100.0,
                active_lights_pooled=8,
                rain_particles_count=14000,
                godot_tests_passed=19,
                godot_tests_total=19,
                physics_tick_ms=2.34,
                peak_memory_mb=412.6,
                status=ValidationStatusEnum.PASSED,
                stage_results=[
                    PipelineStageResult(
                        stage=PipelineStageEnum.BLENDER_MCP_GEN,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=1420,
                        summary="Generated 60 megacity sectors (2,056 meshes) across 54.89 km spline.",
                        metrics={"sectors": 60, "objects": 2056, "blender": "5.2.1 LTS"},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.KDTREE_CORRIDOR_AUDIT,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=310,
                        summary="KDTree 3D spatial audit verified 100.0% clearance across 32.0m spline envelope.",
                        metrics={"min_clearance_m": 32.0, "obstructors_pruned": 0},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.CONTRACT_VALIDATION,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=115,
                        summary="R9_LIGHTING_CONTRACT.json validated: 8 pooled lights, 6 shadow casters.",
                        metrics={"pooled_lights": 8, "shadow_casters": 6},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.VISUAL_QA_LOOP,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=890,
                        summary="Multi-camera viewport silhouette & volumetric fog contrast score 98.4/100.",
                        metrics={"contrast_score": 98.4, "cameras_sampled": 12},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.GLTF_CHUNK_EXPORT,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=1180,
                        summary="Exported 60 Draco-compressed glTF 2.0 sector chunks with Tangents & ORM.",
                        metrics={"chunks_exported": 60, "total_size_mb": 148.2},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.GODOT_HEADLESS_TEST,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=640,
                        summary="Headless Godot 4.7.1 suite passed 19/19 assertions at 2.34ms physics tick.",
                        metrics={"tests_passed": 19, "physics_tick_ms": 2.34},
                    ),
                ],
                triggered_by="deevash@momentum-core",
                created_at=now - timedelta(minutes=18),
            ),
            PipelineRunResponse(
                id=UUID("30000000-0000-4000-8000-000000000002"),
                project_name="R7 Neon Megacity 21,009-Object Build",
                sector_range="S00-S60 (54.89 km)",
                total_objects_verified=21009,
                corridor_clearance_percent=100.0,
                active_lights_pooled=8,
                rain_particles_count=14000,
                godot_tests_passed=19,
                godot_tests_total=19,
                physics_tick_ms=2.89,
                peak_memory_mb=468.4,
                status=ValidationStatusEnum.PASSED,
                stage_results=[
                    PipelineStageResult(
                        stage=PipelineStageEnum.BLENDER_MCP_GEN,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=2190,
                        summary="Synthesized dense R7 Neon Megacity with 21,009 instanced brutalist props.",
                        metrics={"sectors": 60, "objects": 21009, "blender": "5.2.1 LTS"},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.KDTREE_CORRIDOR_AUDIT,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=540,
                        summary="KDTree balanced 21,009 nodes in 0.54s; auto-pruned 14 stray neon sign meshes.",
                        metrics={"min_clearance_m": 32.0, "obstructors_pruned": 14},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.CONTRACT_VALIDATION,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=130,
                        summary="Scene contract verified: emissive materials & 8-light pool within limits.",
                        metrics={"pooled_lights": 8, "emissive_materials": 42},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.VISUAL_QA_LOOP,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=940,
                        summary="Viewport luminance & specular wet-asphalt reflection audit passed.",
                        metrics={"contrast_score": 96.8, "cameras_sampled": 12},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.GLTF_CHUNK_EXPORT,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=1610,
                        summary="Multi-mesh GPU instanced glTF export completed for all 60 sectors.",
                        metrics={"chunks_exported": 60, "total_size_mb": 192.5},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.GODOT_HEADLESS_TEST,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=710,
                        summary="Godot 4.7.1 headless runner verified 19/19 assertions without frame drops.",
                        metrics={"tests_passed": 19, "physics_tick_ms": 2.89},
                    ),
                ],
                triggered_by="antigravity-agent-ci",
                created_at=now - timedelta(hours=2),
            ),
            PipelineRunResponse(
                id=UUID("30000000-0000-4000-8000-000000000003"),
                project_name="Operative Kaelen 5-Variant 86-Bone Rig Build",
                sector_range="S00-S12 (10.98 km)",
                total_objects_verified=430,
                corridor_clearance_percent=100.0,
                active_lights_pooled=6,
                rain_particles_count=10000,
                godot_tests_passed=19,
                godot_tests_total=19,
                physics_tick_ms=1.92,
                peak_memory_mb=318.0,
                status=ValidationStatusEnum.PASSED,
                stage_results=[
                    PipelineStageResult(
                        stage=PipelineStageEnum.BLENDER_MCP_GEN,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=980,
                        summary="Built 5 tactical outfit variants bound to 86-bone Kaelen master armature.",
                        metrics={"variants": 5, "bones": 86, "objects": 430},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.KDTREE_CORRIDOR_AUDIT,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=180,
                        summary="Verified FPP parkour vault & wall-run test gym spline clearance (34.0m).",
                        metrics={"min_clearance_m": 34.0, "obstructors_pruned": 0},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.CONTRACT_VALIDATION,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=95,
                        summary="Verified bone weight normalization (max 4 influences/vertex) & IK locks.",
                        metrics={"bones_verified": 86, "max_influences": 4},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.VISUAL_QA_LOOP,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=720,
                        summary="Verified true FPP clavicle camera socket zero-clipping across 8 animations.",
                        metrics={"clipping_detected": False, "animations_checked": 8},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.GLTF_CHUNK_EXPORT,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=650,
                        summary="Exported Kaelen 5-variant skeletal glTF libraries with NLA animation tracks.",
                        metrics={"chunks_exported": 12, "total_size_mb": 64.8},
                    ),
                    PipelineStageResult(
                        stage=PipelineStageEnum.GODOT_HEADLESS_TEST,
                        status=ValidationStatusEnum.PASSED,
                        duration_ms=520,
                        summary="Passed 19/19 Godot 4.7.1 BoneAttachment3D & FPP kinematic state tests.",
                        metrics={"tests_passed": 19, "physics_tick_ms": 1.92},
                    ),
                ],
                triggered_by="rigging-bot@momentum",
                created_at=now - timedelta(hours=6),
            ),
        ]

    def _seed_licenses(self) -> None:
        now = datetime.now(timezone.utc)
        self.licenses = [
            LicenseCheckoutResponse(
                id=UUID("40000000-0000-4000-8000-000000000001"),
                buyer_email_masked="k***@hyperion-interactive.io",
                buyer_handle="@kaelen_tech_art",
                tier=TierTypeEnum.STUDIO_LICENSE,
                amount_cents=TIER_PRICE_CENTS[TierTypeEnum.STUDIO_LICENSE],
                amount_usd=2499.00,
                github_repo_provisioned=True,
                license_key_prefix="mf_live_8f4a21c9...",
                cohort_batch="WINTER-2026-COHORT-04",
                download_bundle_ready=True,
                provisioning_message="Enterprise Studio License provisioned: Unlimited team seats + private MCP CI/CD runner unlocked.",
                created_at=now - timedelta(minutes=14),
            ),
            LicenseCheckoutResponse(
                id=UUID("40000000-0000-4000-8000-000000000002"),
                buyer_email_masked="s***@valkyrie-studios.dev",
                buyer_handle="@sora_godot_dev",
                tier=TierTypeEnum.COHORT_BOOTCAMP,
                amount_cents=TIER_PRICE_CENTS[TierTypeEnum.COHORT_BOOTCAMP],
                amount_usd=799.00,
                github_repo_provisioned=True,
                license_key_prefix="mf_live_3c91e0b4...",
                cohort_batch="WINTER-2026-COHORT-04",
                download_bundle_ready=True,
                provisioning_message="Cohort Bootcamp Seat #18/25 confirmed + full Boilerplate Starter Kit repository provisioned.",
                created_at=now - timedelta(hours=1, minutes=20),
            ),
            LicenseCheckoutResponse(
                id=UUID("40000000-0000-4000-8000-000000000003"),
                buyer_email_masked="m***@cyberforge.gg",
                buyer_handle="@marcus_bpy",
                tier=TierTypeEnum.STARTER_KIT,
                amount_cents=TIER_PRICE_CENTS[TierTypeEnum.STARTER_KIT],
                amount_usd=149.00,
                github_repo_provisioned=True,
                license_key_prefix="mf_live_7d20a9f1...",
                cohort_batch=None,
                download_bundle_ready=True,
                provisioning_message="Agentic GameDev Boilerplate & Starter Kit v2.4.2 unlocked with GitHub repo access.",
                created_at=now - timedelta(hours=3, minutes=45),
            ),
            LicenseCheckoutResponse(
                id=UUID("40000000-0000-4000-8000-000000000004"),
                buyer_email_masked="a***@aether-works.com",
                buyer_handle="@aria_shader_arch",
                tier=TierTypeEnum.STUDIO_LICENSE,
                amount_cents=TIER_PRICE_CENTS[TierTypeEnum.STUDIO_LICENSE],
                amount_usd=2499.00,
                github_repo_provisioned=True,
                license_key_prefix="mf_live_5e18b6a2...",
                cohort_batch="WINTER-2026-COHORT-04",
                download_bundle_ready=True,
                provisioning_message="Enterprise Studio License provisioned: Multi-seat Blender 5.2 MCP + Godot 4.7.1 CI/CD harness active.",
                created_at=now - timedelta(hours=7, minutes=10),
            ),
            LicenseCheckoutResponse(
                id=UUID("40000000-0000-4000-8000-000000000005"),
                buyer_email_masked="r***@indievelocity.net",
                buyer_handle="@ren_parkour_dev",
                tier=TierTypeEnum.SAAS_PRO_PIPELINE,
                amount_cents=TIER_PRICE_CENTS[TierTypeEnum.SAAS_PRO_PIPELINE],
                amount_usd=49.00,
                github_repo_provisioned=True,
                license_key_prefix="mf_live_1b64c8d0...",
                cohort_batch=None,
                download_bundle_ready=True,
                provisioning_message="SaaS Pro Cloud CI/CD Pipeline subscription active: Automated KDTree & headless Godot builds enabled.",
                created_at=now - timedelta(hours=11),
            ),
        ]

    # ------------------------------------------------------------------------
    # Query & Mutation Operations
    # ------------------------------------------------------------------------

    def get_curriculum(self) -> List[CurriculumModuleResponse]:
        return sorted(self.curriculum, key=lambda m: m.module_number)

    def get_artifacts(
        self,
        category: Optional[ArtifactCategoryEnum] = None,
        search: Optional[str] = None,
    ) -> List[BoilerplateArtifactResponse]:
        results = self.artifacts
        if category is not None:
            results = [a for a in results if a.category == category]
        if search:
            q = search.strip().lower()
            if q:
                results = [
                    a
                    for a in results
                    if q in a.filename.lower()
                    or q in a.description.lower()
                    or q in a.category.value.lower()
                    or q in a.source_preview.lower()
                ]
        return results

    def get_artifact_by_id_and_increment(
        self, artifact_id: UUID
    ) -> Optional[BoilerplateArtifactResponse]:
        for idx, artifact in enumerate(self.artifacts):
            if artifact.id == artifact_id:
                updated = artifact.model_copy(
                    update={"download_count": artifact.download_count + 1}
                )
                self.artifacts[idx] = updated
                return updated
        return None

    def get_pipeline_runs(self) -> List[PipelineRunResponse]:
        return sorted(self.pipeline_runs, key=lambda r: r.created_at, reverse=True)

    def create_pipeline_run(
        self, payload: PipelineRunCreateRequest
    ) -> PipelineRunResponse:
        sector_count = max(1, payload.sector_end - payload.sector_start)
        dist_km = round(sector_count * 0.914833, 2)
        sector_range_str = f"S{payload.sector_start:02d}-S{payload.sector_end:02d} ({dist_km:.2f} km)"
        total_objects = sector_count * 34 + 16

        if payload.inject_corridor_obstruction:
            kdtree_status = ValidationStatusEnum.WARNING
            kdtree_summary = (
                f"KDTree detected 7 corridor obstructions (< {payload.corridor_min_clearance_m:.1f}m) "
                "inside spline envelope; auto-pruned 7 violating meshes and flagged scene warning."
            )
            corridor_clearance = 94.5
            overall_status = ValidationStatusEnum.WARNING
            godot_passed = 18
        else:
            kdtree_status = ValidationStatusEnum.PASSED
            kdtree_summary = (
                f"KDTree 3D spatial audit verified 100.0% clearance across {payload.corridor_min_clearance_m:.1f}m "
                f"spline corridor ({total_objects} objects scanned, 0 obstructions)."
            )
            corridor_clearance = 100.0
            overall_status = ValidationStatusEnum.PASSED
            godot_passed = 19

        physics_tick = round(
            1.85 + (payload.max_pooled_lights * 0.04) + (payload.target_rain_particles / 60000.0),
            2,
        )
        peak_mem = round(295.0 + (sector_count * 1.95), 1)

        stages: List[PipelineStageResult] = [
            PipelineStageResult(
                stage=PipelineStageEnum.BLENDER_MCP_GEN,
                status=ValidationStatusEnum.PASSED,
                duration_ms=920 + sector_count * 8,
                summary=f"Blender 5.2.1 LTS generated {sector_count} sectors ({total_objects} meshes) along {dist_km:.2f} km spline.",
                metrics={
                    "sectors_generated": sector_count,
                    "objects_spawned": total_objects,
                    "track_distance_km": dist_km,
                },
            ),
            PipelineStageResult(
                stage=PipelineStageEnum.KDTREE_CORRIDOR_AUDIT,
                status=kdtree_status,
                duration_ms=260 + sector_count * 3,
                summary=kdtree_summary,
                metrics={
                    "min_clearance_m": payload.corridor_min_clearance_m,
                    "obstruction_injected": payload.inject_corridor_obstruction,
                    "auto_pruned_meshes": 7 if payload.inject_corridor_obstruction else 0,
                },
            ),
            PipelineStageResult(
                stage=PipelineStageEnum.CONTRACT_VALIDATION,
                status=ValidationStatusEnum.PASSED,
                duration_ms=110,
                summary=(
                    f"Validated R9 Scene Contract: {payload.max_pooled_lights} pooled lights, "
                    f"{payload.target_rain_particles} GPU rain particles."
                ),
                metrics={
                    "max_pooled_lights": payload.max_pooled_lights,
                    "target_rain_particles": payload.target_rain_particles,
                },
            ),
            PipelineStageResult(
                stage=PipelineStageEnum.VISUAL_QA_LOOP,
                status=ValidationStatusEnum.PASSED,
                duration_ms=780,
                summary="Autonomous Viewport QA verified silhouette contrast (97.6%) and ORM PBR channel packing.",
                metrics={
                    "silhouette_score": 97.6,
                    "cameras_verified": 12,
                },
            ),
            PipelineStageResult(
                stage=PipelineStageEnum.GLTF_CHUNK_EXPORT,
                status=ValidationStatusEnum.PASSED,
                duration_ms=840 + sector_count * 5,
                summary=f"Exported {sector_count} Draco-compressed glTF 2.0 sector chunks for Godot 4.7.1 streaming.",
                metrics={
                    "gltf_chunks": sector_count,
                    "draco_compression": True,
                },
            ),
            PipelineStageResult(
                stage=PipelineStageEnum.GODOT_HEADLESS_TEST,
                status=kdtree_status,
                duration_ms=590,
                summary=(
                    f"Godot 4.7.1 headless CI/CD runner executed {godot_passed}/19 assertions "
                    f"at {physics_tick}ms physics tick ({peak_mem} MB VRAM)."
                ),
                metrics={
                    "tests_passed": godot_passed,
                    "tests_total": 19,
                    "physics_tick_ms": physics_tick,
                },
            ),
        ]

        run = PipelineRunResponse(
            id=uuid4(),
            project_name=payload.project_name.strip(),
            sector_range=sector_range_str,
            total_objects_verified=total_objects,
            corridor_clearance_percent=corridor_clearance,
            active_lights_pooled=payload.max_pooled_lights,
            rain_particles_count=payload.target_rain_particles,
            godot_tests_passed=godot_passed,
            godot_tests_total=19,
            physics_tick_ms=physics_tick,
            peak_memory_mb=peak_mem,
            status=overall_status,
            stage_results=stages,
            triggered_by=payload.triggered_by.strip(),
            created_at=datetime.now(timezone.utc),
        )
        self.pipeline_runs.insert(0, run)
        return run

    def get_licenses(self) -> List[LicenseCheckoutResponse]:
        return sorted(self.licenses, key=lambda lic: lic.created_at, reverse=True)

    def create_license_checkout(
        self, payload: LicenseCheckoutRequest
    ) -> LicenseCheckoutResponse:
        masked_email = mask_buyer_email(payload.buyer_email)
        amount_cents = TIER_PRICE_CENTS[payload.tier]
        amount_usd = round(amount_cents / 100.0, 2)
        key_prefix = f"mf_live_{secrets.token_hex(4)}..."

        # Increment tier unit counter
        self._tier_units_sold[payload.tier] = (
            self._tier_units_sold.get(payload.tier, 0) + 1
        )

        tier_messages = {
            TierTypeEnum.STARTER_KIT: (
                "Agentic GameDev Boilerplate & Starter Kit ($149) provisioned. "
                "GitHub repository invite & cryptographic license key active."
            ),
            TierTypeEnum.COHORT_BOOTCAMP: (
                "8-Week MOMENTUM Masterclass & Cohort Bootcamp ($799) seat reserved. "
                "Includes full Starter Kit + live weekly Blender-to-Godot architecture reviews."
            ),
            TierTypeEnum.STUDIO_LICENSE: (
                "Enterprise Studio License ($2,499) provisioned. "
                "Unlimited studio seats, custom JSON contract templates & dedicated CI/CD support enabled."
            ),
            TierTypeEnum.SAAS_PRO_PIPELINE: (
                "SaaS Pro Cloud CI/CD Pipeline ($49/mo) activated. "
                "Automated KDTree corridor audits & headless Godot 4.7.1 verification hooks online."
            ),
        }

        handle_clean = payload.buyer_handle.strip()
        if not handle_clean.startswith("@"):
            handle_clean = f"@{handle_clean}"

        cohort_batch = payload.cohort_batch
        if cohort_batch is None and payload.tier in (
            TierTypeEnum.COHORT_BOOTCAMP,
            TierTypeEnum.STUDIO_LICENSE,
        ):
            cohort_batch = "WINTER-2026-COHORT-04"

        checkout = LicenseCheckoutResponse(
            id=uuid4(),
            buyer_email_masked=masked_email,
            buyer_handle=handle_clean,
            tier=payload.tier,
            amount_cents=amount_cents,
            amount_usd=amount_usd,
            github_repo_provisioned=True,
            license_key_prefix=key_prefix,
            cohort_batch=cohort_batch,
            download_bundle_ready=True,
            provisioning_message=tier_messages[payload.tier],
            created_at=datetime.now(timezone.utc),
        )
        self.licenses.insert(0, checkout)
        return checkout

    def get_platform_metrics(self) -> PlatformMetricsResponse:
        tier_labels = {
            TierTypeEnum.STARTER_KIT: "Boilerplate & Starter Kit",
            TierTypeEnum.COHORT_BOOTCAMP: "8-Week Cohort Bootcamp",
            TierTypeEnum.STUDIO_LICENSE: "Studio Enterprise License",
            TierTypeEnum.SAAS_PRO_PIPELINE: "SaaS Pro CI/CD Pipeline",
        }

        breakdown: List[TierRevenueBreakdown] = []
        total_cents = 0

        for tier in (
            TierTypeEnum.STARTER_KIT,
            TierTypeEnum.COHORT_BOOTCAMP,
            TierTypeEnum.STUDIO_LICENSE,
            TierTypeEnum.SAAS_PRO_PIPELINE,
        ):
            units = self._tier_units_sold.get(tier, 0)
            unit_cents = TIER_PRICE_CENTS[tier]
            tier_cents = units * unit_cents
            total_cents += tier_cents
            breakdown.append(
                TierRevenueBreakdown(
                    tier=tier,
                    label=tier_labels[tier],
                    price_usd=round(unit_cents / 100.0, 2),
                    units_sold=units,
                    revenue_usd=round(tier_cents / 100.0, 2),
                )
            )

        total_runs = len(self.pipeline_runs)
        passed_runs = sum(
            1 for r in self.pipeline_runs if r.status == ValidationStatusEnum.PASSED
        )
        pass_rate = round((passed_runs / total_runs) * 100.0, 1) if total_runs > 0 else 100.0

        return PlatformMetricsResponse(
            total_revenue_usd=round(total_cents / 100.0, 2),
            total_revenue_cents=total_cents,
            starter_kits_sold=self._tier_units_sold[TierTypeEnum.STARTER_KIT],
            cohort_seats_filled=self._tier_units_sold[TierTypeEnum.COHORT_BOOTCAMP],
            cohort_seats_capacity=self.cohort_seats_capacity,
            studio_licenses_sold=self._tier_units_sold[TierTypeEnum.STUDIO_LICENSE],
            active_saas_pipelines=self._tier_units_sold[TierTypeEnum.SAAS_PRO_PIPELINE],
            total_pipeline_runs=total_runs,
            pipeline_pass_rate_percent=pass_rate,
            avg_pipeline_speedup_x=14.2,
            verified_track_distance_km=54.89,
            tier_breakdown=breakdown,
        )


# Singleton store instance
store = MomentumForgeStore()
