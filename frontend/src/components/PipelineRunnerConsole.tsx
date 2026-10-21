"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Gauge,
  Layers,
  Play,
  RefreshCw,
  ShieldCheck,
  Terminal,
  XCircle,
} from "lucide-react";
import type {
  PipelineRunCreateRequest,
  PipelineRunResponse,
  PipelineStage,
  ValidationStatus,
} from "@shared/index";
import { triggerPipelineRun } from "@/lib/api";

interface PipelineRunnerConsoleProps {
  runs: PipelineRunResponse[];
  onRunCompleted: (newRun: PipelineRunResponse) => void;
}

const STAGE_LABELS: Record<PipelineStage, { step: string; title: string; tool: string }> = {
  BLENDER_MCP_GEN: {
    step: "01",
    title: "Blender 5.2 MCP Procedural Gen",
    tool: "blender --background --python 01_spawn_sectors.py",
  },
  KDTREE_CORRIDOR_AUDIT: {
    step: "02",
    title: "KDTree 32m Corridor Audit",
    tool: "99_validate_scene.py (mathutils.kdtree)",
  },
  CONTRACT_VALIDATION: {
    step: "03",
    title: "Scene Lighting & Rain Contract",
    tool: "R9_LIGHTING_CONTRACT.json Validator",
  },
  VISUAL_QA_LOOP: {
    step: "04",
    title: "4-Camera Autonomous Visual QA",
    tool: "SKILL_fpp_parkour.md Multi-Angle Probe",
  },
  GLTF_CHUNK_EXPORT: {
    step: "05",
    title: "glTF 2.0 Sector Chunk Exporter",
    tool: "Jolt Static Collider Batch + Draco glTF",
  },
  GODOT_HEADLESS_TEST: {
    step: "06",
    title: "Godot 4.7 Headless Test Suite",
    tool: "godot --headless -s test_level01_r9_abandoned_city.gd",
  },
};

function StatusBadge({ status }: { status: ValidationStatus }) {
  if (status === "PASSED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#10b981]/40 bg-[#10b981]/15 px-2.5 py-0.5 font-mono-code text-[11px] font-semibold text-[#10b981]">
        <CheckCircle2 className="h-3 w-3" />
        PASSED
      </span>
    );
  }
  if (status === "WARNING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#f97316]/40 bg-[#f97316]/15 px-2.5 py-0.5 font-mono-code text-[11px] font-semibold text-[#f97316]">
        <AlertTriangle className="h-3 w-3" />
        WARNING (PRUNED)
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#f43f5e]/40 bg-[#f43f5e]/15 px-2.5 py-0.5 font-mono-code text-[11px] font-semibold text-[#f43f5e]">
        <XCircle className="h-3 w-3" />
        FAILED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#06b6d4]/40 bg-[#06b6d4]/15 px-2.5 py-0.5 font-mono-code text-[11px] font-semibold text-[#06b6d4]">
      <RefreshCw className="h-3 w-3 animate-spin" />
      RUNNING
    </span>
  );
}

export function PipelineRunnerConsole({
  runs,
  onRunCompleted,
}: PipelineRunnerConsoleProps) {
  const [selectedRunId, setSelectedRunId] = useState<string>(runs[0]?.id ?? "");
  const [isExecuting, setIsExecuting] = useState(false);

  // Configurable Form State
  const [projectName, setProjectName] = useState(
    "MOMENTUM // Cerberus City Sector Verification"
  );
  const [sectorStart, setSectorStart] = useState(0);
  const [sectorEnd, setSectorEnd] = useState(60);
  const [minClearanceM, setMinClearanceM] = useState(32.0);
  const [maxPooledLights, setMaxPooledLights] = useState(6);
  const [injectObstruction, setInjectObstruction] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const activeRun =
    runs.find((r) => r.id === selectedRunId) || runs[0];

  const handleLaunchPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (sectorEnd < sectorStart) {
      setErrorBanner("End sector index must be greater than or equal to start sector.");
      return;
    }

    setIsExecuting(true);
    try {
      const payload: PipelineRunCreateRequest = {
        project_name: projectName.trim() || "MOMENTUM // Sector Build",
        sector_start: Number(sectorStart),
        sector_end: Number(sectorEnd),
        corridor_min_clearance_m: Number(minClearanceM),
        max_pooled_lights: Number(maxPooledLights),
        target_rain_particles: 14000,
        inject_corridor_obstruction: injectObstruction,
        triggered_by: "studio-web-console",
      };
      const createdRun = await triggerPipelineRun(payload);
      onRunCompleted(createdRun);
      setSelectedRunId(createdRun.id);
    } catch {
      setErrorBanner("Pipeline execution encountered an unexpected network error.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <section id="pipeline" className="border-b border-[#222638] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/40 bg-[#10b981]/10 px-3 py-1 font-mono-code text-xs font-medium text-[#10b981]">
              <Terminal className="h-3.5 w-3.5" />
              <span>THE $49/MO CLOUD CI/CD WEDGE // HEADLESS VERIFICATION RUNNER</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              6-Stage Autonomous Blender-to-Godot CI/CD Pipeline
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
              Configure your spline sector range, KDTree radial clearance invariant,
              and dynamic light pool cap. Trigger a live verification run against{" "}
              <code className="font-mono-code text-xs text-[#06b6d4]">
                POST /api/v1/pipeline/runs
              </code>
              .
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (4 cols): Pipeline Trigger Form + Run History */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            <form
              onSubmit={handleLaunchPipeline}
              className="rounded-2xl border border-[#222638] bg-[#151823] p-5 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-[#222638] pb-3">
                <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-white">
                  Configure CI/CD Run
                </span>
                <span className="font-mono-code text-[11px] text-[#06b6d4]">
                  Blender 5.2 &rarr; Godot 4.7
                </span>
              </div>

              {errorBanner && (
                <div className="mt-3 rounded-lg border border-[#f43f5e]/40 bg-[#f43f5e]/15 p-2.5 font-mono-code text-xs text-[#f43f5e]">
                  {errorBanner}
                </div>
              )}

              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="block font-mono-code text-[11px] font-medium text-slate-300">
                    PROJECT / SCENE IDENTIFIER
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-[#222638] bg-[#07080c] px-3 py-2 font-mono-code text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-code text-[11px] font-medium text-slate-300">
                      START SECTOR (S00)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={199}
                      value={sectorStart}
                      onChange={(e) => setSectorStart(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-[#222638] bg-[#07080c] px-3 py-2 font-mono-code text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-code text-[11px] font-medium text-slate-300">
                      END SECTOR (S60)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={sectorEnd}
                      onChange={(e) => setSectorEnd(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-[#222638] bg-[#07080c] px-3 py-2 font-mono-code text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-code text-[11px] font-medium text-slate-300">
                      MIN CLEARANCE (M)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={8}
                      max={120}
                      value={minClearanceM}
                      onChange={(e) => setMinClearanceM(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-[#222638] bg-[#07080c] px-3 py-2 font-mono-code text-xs text-[#10b981] focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-code text-[11px] font-medium text-slate-300">
                      MAX POOLED LIGHTS
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={64}
                      value={maxPooledLights}
                      onChange={(e) => setMaxPooledLights(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-[#222638] bg-[#07080c] px-3 py-2 font-mono-code text-xs text-[#f97316] focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Inject Corridor Obstruction Checkbox */}
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#222638] bg-[#0e1017] p-3 transition hover:border-[#f43f5e]/50">
                  <input
                    type="checkbox"
                    checked={injectObstruction}
                    onChange={(e) => setInjectObstruction(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#222638] bg-[#07080c] text-[#f43f5e]"
                  />
                  <div>
                    <span className="block font-mono-code text-xs font-semibold text-slate-200">
                      Inject Corridor Obstruction (&lt; {minClearanceM}m)
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">
                      Simulates an offending megastructure pillar inside the parkour
                      corridor to test KDTree detection &amp; auto-pruning.
                    </span>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isExecuting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#10b981]/60 bg-gradient-to-r from-[#10b981] to-[#059669] px-4 py-3 font-mono-code text-xs font-bold text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.3)] transition hover:brightness-110 disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>EXECUTING 6-STAGE PIPELINE...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>EXECUTE CI/CD PIPELINE RUN</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Recent Pipeline Runs Selector */}
            <div className="rounded-2xl border border-[#222638] bg-[#0e1017] p-4">
              <h3 className="font-mono-code text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent CI/CD Runs ({runs.length})
              </h3>
              <div className="mt-3 space-y-2">
                {runs.slice(0, 5).map((run) => {
                  const isSelected = activeRun?.id === run.id;
                  return (
                    <button
                      key={run.id}
                      type="button"
                      onClick={() => setSelectedRunId(run.id)}
                      className={`flex w-full flex-col rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-[#38bdf8] bg-[#151823]"
                          : "border-[#222638] bg-[#07080c] hover:bg-[#151823]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-mono-code text-xs font-bold text-white">
                          {run.project_name}
                        </span>
                        <StatusBadge status={run.status} />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between font-mono-code text-[11px] text-slate-400">
                        <span>{run.sector_range}</span>
                        <span className="text-[#06b6d4]">
                          {run.godot_tests_passed}/{run.godot_tests_total} tests &bull;{" "}
                          {run.physics_tick_ms} ms
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (8 cols): Active Run Telemetry & 6-Stage Execution Breakdown */}
          <div className="lg:col-span-8">
            {activeRun ? (
              <div className="flex h-full flex-col justify-between rounded-2xl border border-[#222638] bg-[#0e1017] p-5">
                <div>
                  {/* Run Summary Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222638] pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-mono-code text-base font-bold text-white">
                          {activeRun.project_name}
                        </h3>
                        <StatusBadge status={activeRun.status} />
                      </div>
                      <p className="mt-1 font-mono-code text-xs text-slate-400">
                        Sector Range:{" "}
                        <span className="text-white">{activeRun.sector_range}</span>{" "}
                        &bull; Triggered by:{" "}
                        <span className="text-[#06b6d4]">{activeRun.triggered_by}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-[#222638] bg-[#07080c] px-3 py-1.5 font-mono-code text-xs">
                      <Clock className="h-3.5 w-3.5 text-[#06b6d4]" />
                      <span className="text-slate-300">Total Time:</span>
                      <span className="font-bold text-white">
                        {(
                          activeRun.stage_results.reduce(
                            (acc, s) => acc + s.duration_ms,
                            0
                          ) / 1000
                        ).toFixed(2)}
                        s
                      </span>
                    </div>
                  </div>

                  {/* 4 Key Telemetry KPIs for this Run */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-[#222638] bg-[#151823] p-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Objects Indexed</span>
                        <Layers className="h-3.5 w-3.5 text-[#06b6d4]" />
                      </div>
                      <p className="mt-1 font-mono-code text-base font-bold text-white">
                        {activeRun.total_objects_verified.toLocaleString()}
                      </p>
                      <span className="font-mono-code text-[10px] text-[#10b981]">
                        {activeRun.corridor_clearance_percent}% Clearance
                      </span>
                    </div>

                    <div className="rounded-xl border border-[#222638] bg-[#151823] p-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Light Pool / Rain</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-[#f97316]" />
                      </div>
                      <p className="mt-1 font-mono-code text-base font-bold text-[#f97316]">
                        {activeRun.active_lights_pooled} Fixtures
                      </p>
                      <span className="font-mono-code text-[10px] text-slate-400">
                        {activeRun.rain_particles_count.toLocaleString()} GPU drops
                      </span>
                    </div>

                    <div className="rounded-xl border border-[#222638] bg-[#151823] p-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Godot Test Suite</span>
                        <Cpu className="h-3.5 w-3.5 text-[#8b5cf6]" />
                      </div>
                      <p className="mt-1 font-mono-code text-base font-bold text-white">
                        {activeRun.godot_tests_passed}/{activeRun.godot_tests_total}
                      </p>
                      <span className="font-mono-code text-[10px] text-[#8b5cf6]">
                        Headless Assertions
                      </span>
                    </div>

                    <div className="rounded-xl border border-[#222638] bg-[#151823] p-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Physics / Memory</span>
                        <Gauge className="h-3.5 w-3.5 text-[#10b981]" />
                      </div>
                      <p className="mt-1 font-mono-code text-base font-bold text-[#10b981]">
                        {activeRun.physics_tick_ms} ms
                      </p>
                      <span className="font-mono-code text-[10px] text-slate-400">
                        Peak {activeRun.peak_memory_mb} MB
                      </span>
                    </div>
                  </div>

                  {/* 6-Stage Execution Timeline */}
                  <div className="mt-5 space-y-2.5">
                    {activeRun.stage_results.map((stageItem) => {
                      const meta = STAGE_LABELS[stageItem.stage] || {
                        step: "00",
                        title: stageItem.stage,
                        tool: "ci-runner",
                      };
                      return (
                        <div
                          key={stageItem.stage}
                          className="rounded-xl border border-[#222638] bg-[#07080c] p-3.5 transition hover:border-[#38bdf8]/40"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#222638] bg-[#151823] font-mono-code text-xs font-bold text-[#06b6d4]">
                                {meta.step}
                              </span>
                              <div>
                                <span className="font-mono-code text-xs font-bold text-white">
                                  {meta.title}
                                </span>
                                <span className="ml-2 hidden font-mono-code text-[11px] text-slate-500 sm:inline">
                                  [{meta.tool}]
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="font-mono-code text-xs text-slate-400">
                                {stageItem.duration_ms} ms
                              </span>
                              <StatusBadge status={stageItem.status} />
                            </div>
                          </div>

                          <p className="mt-2 text-xs text-slate-300">
                            {stageItem.summary}
                          </p>

                          {/* Stage Metrics Pills */}
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {Object.entries(stageItem.metrics).map(([k, v]) => (
                              <span
                                key={k}
                                className="rounded border border-[#222638] bg-[#151823] px-2 py-0.5 font-mono-code text-[10px] text-slate-300"
                              >
                                <span className="text-slate-500">{k}:</span>{" "}
                                <strong className="text-[#06b6d4]">
                                  {String(v)}
                                </strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
