"""
MomentumForge AI — Comprehensive Unit & Security Test Suite
Tests all FastAPI endpoints, HTTP security headers, strict CORS allow-lists,
multi-tiered secret resolution, PII email masking, KDTree corridor obstruction
simulation, artifact filtering, and Pydantic v2 validation rejections.
"""

from __future__ import annotations

from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from backend.main import ALLOWED_ORIGINS, app
from backend.store import MomentumForgeStore, get_secret, store
from models.schemas import (
    ArtifactCategoryEnum,
    PipelineStageEnum,
    TierTypeEnum,
    ValidationStatusEnum,
    mask_buyer_email,
)


@pytest.fixture(autouse=True)
def reset_store_state() -> None:
    """Reset the singleton store before each test for deterministic isolation."""
    fresh = MomentumForgeStore()
    store._tier_units_sold = dict(fresh._tier_units_sold)
    store.curriculum = list(fresh.curriculum)
    store.artifacts = list(fresh.artifacts)
    store.pipeline_runs = list(fresh.pipeline_runs)
    store.licenses = list(fresh.licenses)


client = TestClient(app)


# ============================================================================
# 1. Security Headers, CORS & Secret Resolution Tests
# ============================================================================


def test_security_headers_injected_on_all_responses() -> None:
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.headers["X-Content-Type-Options"] == "nosniff"
    assert res.headers["X-Frame-Options"] == "DENY"
    assert (
        res.headers["Content-Security-Policy"]
        == "default-src 'self'; frame-ancestors 'none'"
    )
    assert (
        res.headers["Permissions-Policy"]
        == "camera=(), microphone=(), geolocation=()"
    )
    assert res.headers["Cache-Control"] == "no-store"


def test_cors_allows_trusted_localhost_origin() -> None:
    assert "http://localhost:3015" in ALLOWED_ORIGINS
    assert "http://127.0.0.1:3015" in ALLOWED_ORIGINS
    assert "*" not in ALLOWED_ORIGINS

    res = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:3015",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3015"


def test_cors_rejects_untrusted_external_origin() -> None:
    res = client.options(
        "/api/v1/health",
        headers={
            "Origin": "https://malicious-site.example.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert res.headers.get("access-control-allow-origin") is None


def test_multi_tiered_secret_resolution_env_file_and_csprng(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    # Tier 1: Environment variable
    monkeypatch.setenv("MOMENTUM_FORGE_SECRET", "env_secret_token_9876543210_secure")
    assert get_secret() == "env_secret_token_9876543210_secure"

    # Tier 2: Secret file fallback when env var is unset
    monkeypatch.delenv("MOMENTUM_FORGE_SECRET", raising=False)
    secret_file = tmp_path / "secret.key"
    secret_file.write_text("file_based_secret_token_1234567890\n", encoding="utf-8")
    assert (
        get_secret(secret_file_path=str(secret_file))
        == "file_based_secret_token_1234567890"
    )

    # Tier 3: Ephemeral CSPRNG fallback when neither env var nor file exists
    missing_file = tmp_path / "nonexistent.key"
    fallback_secret = get_secret(secret_file_path=str(missing_file))
    assert len(fallback_secret) == 64  # 32 bytes hex


# ============================================================================
# 2. Health & Platform Telemetry Metrics Tests
# ============================================================================


def test_get_health_endpoint() -> None:
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ONLINE"
    assert data["blender_mcp_version"] == "5.2.1 LTS"
    assert data["godot_engine_version"] == "4.7.1"
    assert data["active_pipelines"] == 88
    assert data["secret_configured"] is True


def test_get_platform_metrics_initial_state() -> None:
    res = client.get("/api/v1/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["total_revenue_usd"] >= 48600.0
    assert data["total_revenue_cents"] == int(round(data["total_revenue_usd"] * 100))
    assert data["starter_kits_sold"] == 84
    assert data["cohort_seats_filled"] == 18
    assert data["cohort_seats_capacity"] == 25
    assert data["studio_licenses_sold"] == 7
    assert data["active_saas_pipelines"] == 88
    assert data["total_pipeline_runs"] == 3
    assert data["pipeline_pass_rate_percent"] == 100.0
    assert data["avg_pipeline_speedup_x"] == 14.2
    assert data["verified_track_distance_km"] == 54.89
    assert len(data["tier_breakdown"]) == 4


# ============================================================================
# 3. Masterclass Curriculum Tests
# ============================================================================


def test_get_curriculum_returns_all_six_modules_in_order() -> None:
    res = client.get("/api/v1/curriculum")
    assert res.status_code == 200
    modules = res.json()
    assert len(modules) == 6
    assert [m["module_number"] for m in modules] == [1, 2, 3, 4, 5, 6]

    filenames = [m["code_template_filename"] for m in modules]
    assert "01_generate_cerberus_sectors.py" in filenames
    assert "99_validate_scene.py" in filenames
    assert "SKILL_visual_qa_director.md" in filenames
    assert "SKILL_fpp_parkour.md" in filenames
    assert "Level01_CerberusCity.gd" in filenames
    assert "test_level01_r9_abandoned_city.gd" in filenames


# ============================================================================
# 4. Boilerplate Artifacts & Filtering Tests
# ============================================================================


def test_get_artifacts_unfiltered_returns_all_six() -> None:
    res = client.get("/api/v1/artifacts")
    assert res.status_code == 200
    artifacts = res.json()
    assert len(artifacts) == 6


def test_get_artifacts_filter_by_category() -> None:
    res = client.get(
        "/api/v1/artifacts",
        params={"category": ArtifactCategoryEnum.BPY_HARNESS.value},
    )
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 2
    assert all(item["category"] == "BPY_HARNESS" for item in items)


def test_get_artifacts_filter_by_search_query() -> None:
    res = client.get("/api/v1/artifacts", params={"search": "KDTree"})
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert any(item["filename"] == "99_validate_scene.py" for item in items)


def test_get_single_artifact_increments_download_count() -> None:
    target_id = "20000000-0000-4000-8000-000000000001"
    list_res = client.get("/api/v1/artifacts")
    initial_count = next(
        a["download_count"] for a in list_res.json() if a["id"] == target_id
    )

    detail_res = client.get(f"/api/v1/artifacts/{target_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["download_count"] == initial_count + 1


def test_get_single_artifact_not_found_returns_404() -> None:
    res = client.get(f"/api/v1/artifacts/{uuid4()}")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


# ============================================================================
# 5. Blender-to-Godot CI/CD Pipeline Simulator Tests
# ============================================================================


def test_get_pipeline_runs_returns_seeded_runs_newest_first() -> None:
    res = client.get("/api/v1/pipeline/runs")
    assert res.status_code == 200
    runs = res.json()
    assert len(runs) == 3
    assert runs[0]["project_name"] == "R9 Abandoned City 60-Sector Rebuild"
    assert len(runs[0]["stage_results"]) == 6


def test_create_pipeline_run_clean_passes_all_six_stages() -> None:
    payload = {
        "project_name": "Cerberus Sector S00-S30 Night Build",
        "sector_start": 0,
        "sector_end": 30,
        "corridor_min_clearance_m": 32.0,
        "max_pooled_lights": 8,
        "target_rain_particles": 14000,
        "inject_corridor_obstruction": False,
        "triggered_by": "ci-runner@momentum",
    }
    res = client.post("/api/v1/pipeline/runs", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["project_name"] == "Cerberus Sector S00-S30 Night Build"
    assert data["status"] == ValidationStatusEnum.PASSED.value
    assert data["corridor_clearance_percent"] == 100.0
    assert data["godot_tests_passed"] == 19
    assert data["godot_tests_total"] == 19
    assert len(data["stage_results"]) == 6

    stage_names = [s["stage"] for s in data["stage_results"]]
    assert stage_names == [
        PipelineStageEnum.BLENDER_MCP_GEN.value,
        PipelineStageEnum.KDTREE_CORRIDOR_AUDIT.value,
        PipelineStageEnum.CONTRACT_VALIDATION.value,
        PipelineStageEnum.VISUAL_QA_LOOP.value,
        PipelineStageEnum.GLTF_CHUNK_EXPORT.value,
        PipelineStageEnum.GODOT_HEADLESS_TEST.value,
    ]


def test_create_pipeline_run_with_corridor_obstruction_flags_warning() -> None:
    payload = {
        "project_name": "Obstructed Corridor Stress Build",
        "sector_start": 0,
        "sector_end": 60,
        "corridor_min_clearance_m": 36.0,
        "max_pooled_lights": 8,
        "target_rain_particles": 14000,
        "inject_corridor_obstruction": True,
        "triggered_by": "qa-chaos-agent",
    }
    res = client.post("/api/v1/pipeline/runs", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == ValidationStatusEnum.WARNING.value
    assert data["corridor_clearance_percent"] < 100.0

    kdtree_stage = next(
        s
        for s in data["stage_results"]
        if s["stage"] == PipelineStageEnum.KDTREE_CORRIDOR_AUDIT.value
    )
    assert kdtree_stage["status"] == ValidationStatusEnum.WARNING.value
    assert kdtree_stage["metrics"]["auto_pruned_meshes"] == 7


def test_create_pipeline_run_rejects_invalid_sector_bounds() -> None:
    payload = {
        "project_name": "Invalid Sector Range Build",
        "sector_start": 50,
        "sector_end": 10,
    }
    res = client.post("/api/v1/pipeline/runs", json=payload)
    assert res.status_code == 422


def test_create_pipeline_run_rejects_extra_fields() -> None:
    payload = {
        "project_name": "Valid Name",
        "sector_start": 0,
        "sector_end": 10,
        "malicious_field": "drop table",
    }
    res = client.post("/api/v1/pipeline/runs", json=payload)
    assert res.status_code == 422


# ============================================================================
# 6. License Checkout, PII Email Masking & Dynamic Revenue Tests
# ============================================================================


def test_mask_buyer_email_utility() -> None:
    assert mask_buyer_email("deevash@studio.dev") == "d***@studio.dev"
    assert mask_buyer_email("  Kaelen.Voss@Hyperion.io ") == "k***@hyperion.io"
    assert mask_buyer_email("invalid-no-at-sign") == "***@redacted.local"


def test_get_licenses_returns_masked_seed_entries() -> None:
    res = client.get("/api/v1/licenses")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 5
    for lic in items:
        assert "***@" in lic["buyer_email_masked"]
        assert lic["license_key_prefix"].startswith("mf_live_")


def test_create_license_checkout_masks_pii_and_updates_metrics() -> None:
    metrics_before = client.get("/api/v1/metrics").json()
    initial_cents = metrics_before["total_revenue_cents"]
    initial_studio_units = metrics_before["studio_licenses_sold"]

    checkout_payload = {
        "buyer_email": "lead.architect@neura-interactive.com",
        "buyer_handle": "neura_lead",
        "tier": TierTypeEnum.STUDIO_LICENSE.value,
        "cohort_batch": "WINTER-2026-COHORT-04",
        "github_org_or_user": "neura-interactive",
    }
    res = client.post("/api/v1/licenses/checkout", json=checkout_payload)
    assert res.status_code == 201
    data = res.json()

    # Verify PII email masking
    assert data["buyer_email_masked"] == "l***@neura-interactive.com"
    assert "lead.architect" not in data["buyer_email_masked"]
    assert data["buyer_handle"] == "@neura_lead"
    assert data["amount_cents"] == 249900
    assert data["amount_usd"] == 2499.00
    assert data["github_repo_provisioned"] is True
    assert data["license_key_prefix"].startswith("mf_live_")

    # Verify revenue & unit counter updated in metrics
    metrics_after = client.get("/api/v1/metrics").json()
    assert metrics_after["total_revenue_cents"] == initial_cents + 249900
    assert metrics_after["studio_licenses_sold"] == initial_studio_units + 1


def test_create_license_checkout_rejects_invalid_email() -> None:
    res = client.post(
        "/api/v1/licenses/checkout",
        json={
            "buyer_email": "not-an-email-address",
            "buyer_handle": "@valid_handle",
            "tier": TierTypeEnum.STARTER_KIT.value,
        },
    )
    assert res.status_code == 422


def test_create_license_checkout_rejects_shell_injection_in_handle() -> None:
    res = client.post(
        "/api/v1/licenses/checkout",
        json={
            "buyer_email": "dev@studio.io",
            "buyer_handle": "bad_handle; rm -rf /",
            "tier": TierTypeEnum.STARTER_KIT.value,
        },
    )
    assert res.status_code == 422


def test_create_license_checkout_starter_kit_and_saas_tiers() -> None:
    res_kit = client.post(
        "/api/v1/licenses/checkout",
        json={
            "buyer_email": "indie@godot.org",
            "buyer_handle": "@indie_maker",
            "tier": TierTypeEnum.STARTER_KIT.value,
        },
    )
    assert res_kit.status_code == 201
    assert res_kit.json()["amount_cents"] == 14900
    assert res_kit.json()["cohort_batch"] is None

    res_saas = client.post(
        "/api/v1/licenses/checkout",
        json={
            "buyer_email": "ops@cloud-ci.dev",
            "buyer_handle": "@ops_pipeline",
            "tier": TierTypeEnum.SAAS_PRO_PIPELINE.value,
        },
    )
    assert res_saas.status_code == 201
    assert res_saas.json()["amount_cents"] == 4900


def test_create_license_checkout_cohort_bootcamp_assigns_default_batch() -> None:
    res = client.post(
        "/api/v1/licenses/checkout",
        json={
            "buyer_email": "student@academy.edu",
            "buyer_handle": "student_01",
            "tier": TierTypeEnum.COHORT_BOOTCAMP.value,
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["amount_cents"] == 79900
    assert data["cohort_batch"] == "WINTER-2026-COHORT-04"


def test_get_artifacts_filter_json_contract_and_gdscript() -> None:
    res_contract = client.get(
        "/api/v1/artifacts",
        params={"category": ArtifactCategoryEnum.JSON_CONTRACT.value},
    )
    assert res_contract.status_code == 200
    contracts = res_contract.json()
    assert len(contracts) == 1
    assert contracts[0]["filename"] == "R9_LIGHTING_CONTRACT.json"


def test_create_pipeline_run_rejects_out_of_bounds_corridor_clearance() -> None:
    res = client.post(
        "/api/v1/pipeline/runs",
        json={
            "project_name": "Too Narrow Corridor Build",
            "sector_start": 0,
            "sector_end": 10,
            "corridor_min_clearance_m": 2.0,  # Minimum allowed is 8.0m
        },
    )
    assert res.status_code == 422

