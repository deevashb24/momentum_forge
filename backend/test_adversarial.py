"""
MomentumForge AI — Adversarial, Fuzzing & Security Edge-Case Test Suite
Validates strict Pydantic v2 rejections, input sanitization, boundary checks,
and resilient error handling across all API routes.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from backend.main import app
from backend.store import MomentumForgeStore, store

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_store_state() -> None:
    fresh = MomentumForgeStore()
    store._tier_units_sold = dict(fresh._tier_units_sold)
    store.curriculum = list(fresh.curriculum)
    store.artifacts = list(fresh.artifacts)
    store.pipeline_runs = list(fresh.pipeline_runs)
    store.licenses = list(fresh.licenses)


# ============================================================================
# 1. Input Fuzzing & Injection Defense Tests
# ============================================================================


@pytest.mark.parametrize(
    "malicious_handle",
    [
        "<script>alert(1)</script>",
        "'; DROP TABLE curriculum_modules; --",
        "../../etc/passwd",
        "{{7*7}}",
        "handle with spaces and \x00 null bytes",
    ],
)
def test_license_checkout_rejects_injection_in_buyer_handle(malicious_handle: str) -> None:
    payload = {
        "buyer_email": "test@studio.dev",
        "buyer_handle": malicious_handle,
        "tier": "STARTER_KIT",
    }
    res = client.post("/api/v1/licenses/checkout", json=payload)
    assert res.status_code == 422


@pytest.mark.parametrize(
    "malicious_email",
    [
        "plainaddress",
        "@missingusername.com",
        "username@.com",
        "user@domain..com",
        "<script>@evil.com",
        "user@evil.com; DROP TABLE users;",
    ],
)
def test_license_checkout_rejects_malformed_email(malicious_email: str) -> None:
    payload = {
        "buyer_email": malicious_email,
        "buyer_handle": "clean_handle",
        "tier": "STARTER_KIT",
    }
    res = client.post("/api/v1/licenses/checkout", json=payload)
    assert res.status_code == 422


# ============================================================================
# 2. Pipeline Run Parameter Boundary & Inverted Sector Rejection
# ============================================================================


def test_pipeline_run_rejects_inverted_sector_range() -> None:
    payload = {
        "project_name": "Test Cerberus Inverted",
        "sector_start": 40,
        "sector_end": 10,  # Invalid: end < start
    }
    res = client.post("/api/v1/pipeline/runs", json=payload)
    assert res.status_code == 422


@pytest.mark.parametrize(
    "bad_clearance",
    [-10.0, 0.0, 5.0, 150.0],  # Must be between 8.0 and 120.0
)
def test_pipeline_run_rejects_out_of_bounds_clearance(bad_clearance: float) -> None:
    payload = {
        "project_name": "Test Bounds",
        "sector_start": 0,
        "sector_end": 10,
        "corridor_min_clearance_m": bad_clearance,
    }
    res = client.post("/api/v1/pipeline/runs", json=payload)
    assert res.status_code == 422


def test_pipeline_run_extra_fields_forbidden() -> None:
    payload = {
        "project_name": "Strict Extra Fields Test",
        "sector_start": 0,
        "sector_end": 5,
        "unauthorized_admin_param": True,  # ConfigDict(extra="forbid")
    }
    res = client.post("/api/v1/pipeline/runs", json=payload)
    assert res.status_code == 422


# ============================================================================
# 3. 404 & Non-Existent Entity Handling
# ============================================================================


def test_non_existent_artifact_returns_404() -> None:
    fake_id = str(uuid4())
    res = client.get(f"/api/v1/artifacts/{fake_id}")
    assert res.status_code == 404
    data = res.json()
    assert "detail" in data


def test_invalid_uuid_artifact_returns_422() -> None:
    res = client.get("/api/v1/artifacts/not-a-valid-uuid")
    assert res.status_code == 422


# ============================================================================
# 4. KDTree Obstruction Simulation Integrity
# ============================================================================


def test_kdtree_obstruction_injection_triggers_warning_status() -> None:
    payload = {
        "project_name": "Obstruction Stress Test",
        "sector_start": 0,
        "sector_end": 20,
        "inject_corridor_obstruction": True,
        "corridor_min_clearance_m": 32.0,
    }
    res = client.post("/api/v1/pipeline/runs", json=payload)
    assert res.status_code == 201
    run = res.json()
    assert run["status"] == "WARNING"
    # Clearance percentage should drop below 100%
    assert run["corridor_clearance_percent"] < 100.0

    # Verify stage results highlight the KDTree violation
    kdtree_stage = next(
        s for s in run["stage_results"] if s["stage"] == "KDTREE_CORRIDOR_AUDIT"
    )
    assert kdtree_stage["status"] == "WARNING"
    assert "obstruction" in kdtree_stage["summary"].lower()


# ============================================================================
# 5. Financial Integer-Cents Precision & Revenue Consistency
# ============================================================================


def test_revenue_funnel_math_consistency() -> None:
    initial_metrics = client.get("/api/v1/metrics").json()
    initial_cents = initial_metrics["total_revenue_cents"]
    initial_kits = initial_metrics["starter_kits_sold"]

    # Execute a Starter Kit purchase ($149.00 = 14900 cents)
    checkout_payload = {
        "buyer_email": "studio.lead@quantum-games.io",
        "buyer_handle": "quantum_lead",
        "tier": "STARTER_KIT",
    }
    checkout_res = client.post("/api/v1/licenses/checkout", json=checkout_payload)
    assert checkout_res.status_code == 201
    receipt = checkout_res.json()
    assert receipt["amount_cents"] == 14900
    assert receipt["amount_usd"] == 149.00
    assert receipt["buyer_email_masked"] == "s***@quantum-games.io"
    assert receipt["license_key_prefix"].startswith("mf_live_")

    # Metrics should accurately increment
    updated_metrics = client.get("/api/v1/metrics").json()
    assert updated_metrics["total_revenue_cents"] == initial_cents + 14900
    assert updated_metrics["starter_kits_sold"] == initial_kits + 1
