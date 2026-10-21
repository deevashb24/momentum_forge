"""
MomentumForge AI — Pydantic v2 Validation Models & Schemas
Strict input constraints, regex validation, and PII masking for FastAPI.
"""

from __future__ import annotations

import re
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


# ============================================================================
# 1. Domain Enumerations
# ============================================================================


class TierTypeEnum(str, Enum):
    STARTER_KIT = "STARTER_KIT"
    COHORT_BOOTCAMP = "COHORT_BOOTCAMP"
    STUDIO_LICENSE = "STUDIO_LICENSE"
    SAAS_PRO_PIPELINE = "SAAS_PRO_PIPELINE"


class PipelineStageEnum(str, Enum):
    BLENDER_MCP_GEN = "BLENDER_MCP_GEN"
    KDTREE_CORRIDOR_AUDIT = "KDTREE_CORRIDOR_AUDIT"
    CONTRACT_VALIDATION = "CONTRACT_VALIDATION"
    VISUAL_QA_LOOP = "VISUAL_QA_LOOP"
    GLTF_CHUNK_EXPORT = "GLTF_CHUNK_EXPORT"
    GODOT_HEADLESS_TEST = "GODOT_HEADLESS_TEST"


class ValidationStatusEnum(str, Enum):
    PASSED = "PASSED"
    WARNING = "WARNING"
    FAILED = "FAILED"
    RUNNING = "RUNNING"


class ArtifactCategoryEnum(str, Enum):
    BPY_HARNESS = "BPY_HARNESS"
    JSON_CONTRACT = "JSON_CONTRACT"
    AGENT_SKILL = "AGENT_SKILL"
    GODOT_RUNTIME = "GODOT_RUNTIME"
    GDSCRIPT_TEST = "GDSCRIPT_TEST"


# ============================================================================
# 2. Tier Pricing Constants (Integer Cents Precision)
# ============================================================================

TIER_PRICE_CENTS: Dict[TierTypeEnum, int] = {
    TierTypeEnum.STARTER_KIT: 14900,         # $149.00
    TierTypeEnum.COHORT_BOOTCAMP: 79900,     # $799.00
    TierTypeEnum.STUDIO_LICENSE: 249900,     # $2,499.00
    TierTypeEnum.SAAS_PRO_PIPELINE: 4900,    # $49.00 / mo
}


def mask_buyer_email(email: str) -> str:
    """
    Masks an email address to protect PII in persistence & UI responses.
    Example: 'deevash@studio.dev' -> 'd***@studio.dev'
    """
    cleaned = email.strip().lower()
    if "@" not in cleaned:
        return "***@redacted.local"
    local_part, domain_part = cleaned.split("@", 1)
    first_char = local_part[0] if local_part else "u"
    return f"{first_char}***@{domain_part}"


# ============================================================================
# 3. Curriculum & Boilerplate Models
# ============================================================================


class CurriculumModuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    module_number: int = Field(..., ge=1, le=24, description="Sequential 1-indexed module number")
    slug: str = Field(
        ...,
        min_length=3,
        max_length=120,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="URL-safe kebab-case module identifier",
    )
    title: str = Field(..., min_length=3, max_length=180)
    subtitle: str = Field(..., min_length=5, max_length=320)
    duration_minutes: int = Field(..., ge=10, le=600)
    video_lessons_count: int = Field(..., ge=1, le=50)
    key_deliverables: List[str] = Field(..., min_length=1, max_length=12)
    code_template_filename: str = Field(..., min_length=3, max_length=160)
    completion_rate_percent: float = Field(..., ge=0.0, le=100.0)
    created_at: datetime


class BoilerplateArtifactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    filename: str = Field(
        ...,
        min_length=3,
        max_length=180,
        pattern=r"^[a-zA-Z0-9_.\-/]+$",
        description="Relative artifact filename or path inside the kit",
    )
    category: ArtifactCategoryEnum
    description: str = Field(..., min_length=10, max_length=1000)
    lines_of_code: int = Field(..., ge=1, le=100000)
    version: str = Field(
        ...,
        min_length=3,
        max_length=32,
        pattern=r"^v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?$",
    )
    source_preview: str = Field(..., min_length=10, max_length=25000)
    download_count: int = Field(..., ge=0)
    created_at: datetime


class GameStoryPhaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    phase_number: int = Field(..., ge=0, le=10)
    code: str = Field(..., min_length=3, max_length=64)
    title: str = Field(..., min_length=3, max_length=160)
    cinematic_id: str = Field(..., min_length=2, max_length=64)
    setting: str = Field(..., min_length=3, max_length=200)
    lore_synopsis: str = Field(..., min_length=10, max_length=1500)
    level_mechanics: List[str] = Field(..., min_length=1, max_length=10)
    operative_variant: str = Field(..., min_length=3, max_length=120)
    soundtrack_tempo: str = Field(..., min_length=3, max_length=120)
    cinematic_camera_prompt: str = Field(..., min_length=10, max_length=2000)


# ============================================================================
# 4. Blender-to-Godot CI/CD Pipeline Models
# ============================================================================


class PipelineStageResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    stage: PipelineStageEnum
    status: ValidationStatusEnum
    duration_ms: int = Field(..., ge=0, le=3600000)
    summary: str = Field(..., min_length=3, max_length=500)
    metrics: Dict[str, Union[str, int, float, bool]] = Field(default_factory=dict)


class PipelineRunCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project_name: str = Field(
        ...,
        min_length=3,
        max_length=140,
        pattern=r"^[a-zA-Z0-9_\-\s.:/()]+$",
        description="Project or scene build identifier",
    )
    sector_start: int = Field(
        default=0,
        ge=0,
        le=200,
        description="Start spline sector index (e.g. 0 for S00)",
    )
    sector_end: int = Field(
        default=60,
        ge=1,
        le=200,
        description="End spline sector index (e.g. 60 for S60)",
    )
    corridor_min_clearance_m: float = Field(
        default=32.0,
        ge=8.0,
        le=120.0,
        description="Minimum KDTree 3D spline corridor radius in meters",
    )
    max_pooled_lights: int = Field(
        default=8,
        ge=1,
        le=64,
        description="Maximum active dynamic lights allowed in Godot light pool",
    )
    target_rain_particles: int = Field(
        default=14000,
        ge=0,
        le=100000,
        description="GPUParticles3D rain/snow emitter particle budget",
    )
    inject_corridor_obstruction: bool = Field(
        default=False,
        description="Simulate a corridor geometry violation to test CI/CD auto-rejection vs auto-prune",
    )
    triggered_by: str = Field(
        default="antigravity-agent-ci",
        min_length=2,
        max_length=120,
        pattern=r"^[a-zA-Z0-9_.\-@/]+$",
    )

    @model_validator(mode="after")
    def validate_sector_bounds(self) -> "PipelineRunCreateRequest":
        if self.sector_end < self.sector_start:
            raise ValueError("sector_end must be greater than or equal to sector_start")
        return self


class PipelineRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_name: str = Field(..., min_length=3, max_length=140)
    sector_range: str = Field(..., min_length=3, max_length=80)
    total_objects_verified: int = Field(..., ge=0)
    corridor_clearance_percent: float = Field(..., ge=0.0, le=100.0)
    active_lights_pooled: int = Field(..., ge=0, le=128)
    rain_particles_count: int = Field(..., ge=0, le=200000)
    godot_tests_passed: int = Field(..., ge=0)
    godot_tests_total: int = Field(..., ge=1)
    physics_tick_ms: float = Field(..., ge=0.0, le=1000.0)
    peak_memory_mb: float = Field(..., ge=0.0, le=65536.0)
    status: ValidationStatusEnum
    stage_results: List[PipelineStageResult] = Field(..., min_length=1, max_length=10)
    triggered_by: str = Field(..., min_length=2, max_length=120)
    created_at: datetime


# ============================================================================
# 5. License & Cohort Enrollment Checkout Models
# ============================================================================

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")
MASKED_EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9]\*{3}@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")


class LicenseCheckoutRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    buyer_email: str = Field(
        ...,
        min_length=5,
        max_length=160,
        description="Buyer email address (immediately masked prior to database persistence)",
    )
    buyer_handle: str = Field(
        ...,
        min_length=2,
        max_length=80,
        pattern=r"^@?[a-zA-Z0-9_\-.]+$",
        description="GitHub or studio developer handle",
    )
    tier: TierTypeEnum
    cohort_batch: Optional[str] = Field(
        default=None,
        max_length=64,
        pattern=r"^[a-zA-Z0-9_\-\s]+$",
        description="Optional cohort identifier (e.g., 'WINTER-2026-COHORT-04')",
    )
    github_org_or_user: Optional[str] = Field(
        default=None,
        max_length=80,
        pattern=r"^[a-zA-Z0-9\-]+$",
    )

    @field_validator("buyer_email")
    @classmethod
    def validate_email_syntax(cls, v: str) -> str:
        cleaned = v.strip()
        if ".." in cleaned:
            raise ValueError("Invalid email address format: consecutive dots are forbidden")
        if not EMAIL_REGEX.match(cleaned) and not MASKED_EMAIL_REGEX.match(cleaned):
            raise ValueError("Invalid email address format")
        return cleaned


class LicenseCheckoutResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    buyer_email_masked: str = Field(
        ...,
        min_length=6,
        max_length=160,
        pattern=r"^[a-zA-Z0-9]\*{3}@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$",
    )
    buyer_handle: str = Field(..., min_length=2, max_length=80)
    tier: TierTypeEnum
    amount_cents: int = Field(..., ge=0, description="Transaction amount in integer USD cents")
    amount_usd: float = Field(..., ge=0.0)
    github_repo_provisioned: bool
    license_key_prefix: str = Field(
        ...,
        min_length=8,
        max_length=64,
        pattern=r"^mf_live_[a-f0-9]{8}\.\.\.$",
    )
    cohort_batch: Optional[str] = None
    download_bundle_ready: bool = True
    provisioning_message: str
    created_at: datetime


# ============================================================================
# 6. Platform Revenue & Telemetry Metrics Models
# ============================================================================


class TierRevenueBreakdown(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tier: TierTypeEnum
    label: str = Field(..., min_length=3, max_length=80)
    price_usd: float = Field(..., ge=0.0)
    units_sold: int = Field(..., ge=0)
    revenue_usd: float = Field(..., ge=0.0)


class PlatformMetricsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_revenue_usd: float = Field(..., ge=0.0, description="Total platform revenue in USD")
    total_revenue_cents: int = Field(..., ge=0, description="Total platform revenue in integer cents")
    starter_kits_sold: int = Field(..., ge=0, description="Tier 1 ($149) Boilerplate & Starter Kits sold")
    cohort_seats_filled: int = Field(..., ge=0, description="Tier 2 ($799) Cohort Bootcamp seats filled")
    cohort_seats_capacity: int = Field(..., ge=1, description="Maximum Cohort Bootcamp seat capacity")
    studio_licenses_sold: int = Field(..., ge=0, description="Tier 3 ($2,499) Studio Enterprise Licenses sold")
    active_saas_pipelines: int = Field(..., ge=0, description="Tier 4 ($49/mo) Active SaaS Pro CI/CD subscriptions")
    total_pipeline_runs: int = Field(..., ge=0)
    pipeline_pass_rate_percent: float = Field(..., ge=0.0, le=100.0)
    avg_pipeline_speedup_x: float = Field(..., ge=1.0, description="Average production speedup multiplier (e.g. 14.2x)")
    verified_track_distance_km: float = Field(..., ge=0.0, description="Reference benchmark spline length (54.89 km)")
    tier_breakdown: List[TierRevenueBreakdown] = Field(default_factory=list)
