"""
MomentumForge AI — Production FastAPI Backend
Enforces strict security headers, explicit CORS allow-list, multi-tiered secret
resolution, Pydantic v2 input validation, and 127.0.0.1 loopback binding.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List, Optional, Union
from uuid import UUID

import uvicorn
from fastapi import FastAPI, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.store import get_secret, store
from models.schemas import (
    ArtifactCategoryEnum,
    BoilerplateArtifactResponse,
    CurriculumModuleResponse,
    LicenseCheckoutRequest,
    LicenseCheckoutResponse,
    PipelineRunCreateRequest,
    PipelineRunResponse,
    PlatformMetricsResponse,
)

# ============================================================================
# 1. FastAPI Application & Strict CORS Configuration
# ============================================================================

ALLOWED_ORIGINS: List[str] = [
    "http://localhost:3015",
    "http://127.0.0.1:3015",
]

app = FastAPI(
    title="MomentumForge AI API",
    description=(
        "Autonomous Blender 5.2 MCP to Godot 4.7.1 Agentic GameDev Boilerplate, "
        "Masterclass & CI/CD Verification Platform."
    ),
    version="2.4.2",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
)


# ============================================================================
# 2. HTTP Security Headers Middleware
# ============================================================================


@app.middleware("http")
async def inject_security_headers(request: Request, call_next) -> Response:
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; frame-ancestors 'none'"
    )
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=()"
    )
    response.headers["Cache-Control"] = "no-store"
    return response


# ============================================================================
# 3. Health & Telemetry Endpoints
# ============================================================================


class HealthCheckResponse(BaseModel):
    status: str
    service: str
    version: str
    blender_mcp_version: str
    godot_engine_version: str
    active_pipelines: int
    secret_configured: bool
    timestamp: datetime


@app.get(
    "/api/v1/health",
    response_model=HealthCheckResponse,
    tags=["System"],
    summary="Verify service health and active engine versions",
)
def get_health() -> HealthCheckResponse:
    metrics = store.get_platform_metrics()
    return HealthCheckResponse(
        status="ONLINE",
        service="momentum-forge-api",
        version="2.4.2",
        blender_mcp_version="5.2.1 LTS",
        godot_engine_version="4.7.1",
        active_pipelines=metrics.active_saas_pipelines,
        secret_configured=bool(store.runtime_secret and len(store.runtime_secret) >= 16),
        timestamp=datetime.now(timezone.utc),
    )


@app.get(
    "/api/v1/metrics",
    response_model=PlatformMetricsResponse,
    tags=["Telemetry & Revenue"],
    summary="Retrieve real-time 4-tier revenue funnel & CI/CD pipeline telemetry",
)
def get_metrics() -> PlatformMetricsResponse:
    return store.get_platform_metrics()


# ============================================================================
# 4. Curriculum & Boilerplate Artifact Endpoints
# ============================================================================


@app.get(
    "/api/v1/curriculum",
    response_model=List[CurriculumModuleResponse],
    tags=["Masterclass Curriculum"],
    summary="List all 6 practitioner modules of the MOMENTUM Agentic GameDev Masterclass",
)
def list_curriculum_modules() -> List[CurriculumModuleResponse]:
    return store.get_curriculum()


@app.get(
    "/api/v1/artifacts",
    response_model=List[BoilerplateArtifactResponse],
    tags=["Boilerplate Artifacts"],
    summary="List and filter production Blender/Godot boilerplate files",
)
def list_artifacts(
    category: Optional[ArtifactCategoryEnum] = Query(
        default=None,
        description="Optional filter by artifact category (BPY_HARNESS, JSON_CONTRACT, AGENT_SKILL, GODOT_RUNTIME, GDSCRIPT_TEST)",
    ),
    search: Optional[str] = Query(
        default=None,
        max_length=120,
        description="Optional case-insensitive search query matching filename, description, or code preview",
    ),
) -> List[BoilerplateArtifactResponse]:
    return store.get_artifacts(category=category, search=search)


@app.get(
    "/api/v1/artifacts/{artifact_id}",
    response_model=BoilerplateArtifactResponse,
    tags=["Boilerplate Artifacts"],
    summary="Inspect a single boilerplate artifact and increment its download counter",
)
def get_artifact(artifact_id: UUID) -> BoilerplateArtifactResponse:
    artifact = store.get_artifact_by_id_and_increment(artifact_id)
    if artifact is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Boilerplate artifact '{artifact_id}' not found.",
        )
    return artifact


# ============================================================================
# 5. Blender-to-Godot CI/CD Pipeline Simulator Endpoints
# ============================================================================


@app.get(
    "/api/v1/pipeline/runs",
    response_model=List[PipelineRunResponse],
    tags=["CI/CD Pipeline"],
    summary="List recent Blender-to-Godot CI/CD verification runs (newest first)",
)
def list_pipeline_runs() -> List[PipelineRunResponse]:
    return store.get_pipeline_runs()


@app.post(
    "/api/v1/pipeline/runs",
    response_model=PipelineRunResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["CI/CD Pipeline"],
    summary="Trigger a deterministic 6-stage Blender 5.2 MCP to Godot 4.7.1 CI/CD verification run",
)
def create_pipeline_run(payload: PipelineRunCreateRequest) -> PipelineRunResponse:
    return store.create_pipeline_run(payload)


# ============================================================================
# 6. License & Cohort Enrollment Checkout Endpoints
# ============================================================================


@app.get(
    "/api/v1/licenses",
    response_model=List[LicenseCheckoutResponse],
    tags=["Licenses & Checkout"],
    summary="List recent PII-masked license checkouts and cohort enrollments",
)
def list_licenses() -> List[LicenseCheckoutResponse]:
    return store.get_licenses()


@app.post(
    "/api/v1/licenses/checkout",
    response_model=LicenseCheckoutResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Licenses & Checkout"],
    summary="Provision a Boilerplate License, Cohort Bootcamp seat, Studio License, or SaaS Pro Pipeline",
)
def create_license_checkout(
    payload: LicenseCheckoutRequest,
) -> LicenseCheckoutResponse:
    return store.create_license_checkout(payload)


# ============================================================================
# 7. Local Loopback Entrypoint (Never bind to 0.0.0.0)
# ============================================================================

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8015,
        reload=False,
    )
