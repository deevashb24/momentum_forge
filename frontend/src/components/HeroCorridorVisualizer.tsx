"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CloudRain,
  Cpu,
  Eye,
  Flame,
  Gauge,
  Layers,
  Play,
  Radar,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { TierType } from "@shared/index";

interface HeroCorridorVisualizerProps {
  onOpenCheckout: (tier: TierType) => void;
  onJumpToPipeline: () => void;
  onJumpToVault: () => void;
}

export function HeroCorridorVisualizer({
  onOpenCheckout,
  onJumpToPipeline,
  onJumpToVault,
}: HeroCorridorVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interactive Canvas Toggles
  const [showKdtreeScan, setShowKdtreeScan] = useState(true);
  const [showLightPool, setShowLightPool] = useState(true);
  const [showRainSuppression, setShowRainSuppression] = useState(true);
  const [obstructionInjected, setObstructionInjected] = useState(false);
  const [pruningActive, setPruningActive] = useState(false);
  const [currentSector, setCurrentSector] = useState(18);
  const [roofCovered, setRoofCovered] = useState(false);

  const handleTriggerPrune = () => {
    if (!obstructionInjected) {
      setObstructionInjected(true);
      return;
    }
    setPruningActive(true);
    window.setTimeout(() => {
      setObstructionInjected(false);
      setPruningActive(false);
    }, 950);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Pre-seed deterministic rain particles
    const rainDrops = Array.from({ length: 95 }, (_, idx) => ({
      x: ((idx * 73) % 100) / 100,
      y: ((idx * 41) % 100) / 100,
      speed: 0.014 + (idx % 5) * 0.003,
      length: 10 + (idx % 4) * 4,
    }));

    const render = () => {
      time += 0.025;
      const width = canvas.width;
      const height = canvas.height;

      // Update simulated sector (S00 - S60)
      const sec = Math.floor((time * 2.2) % 60);
      setCurrentSector(sec);
      const isUnderRoof = sec >= 24 && sec <= 38;
      setRoofCovered(isUnderRoof);

      // 1. Background Void
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#07080c");
      bgGrad.addColorStop(0.55, "#0e1017");
      bgGrad.addColorStop(1, "#090b12");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Vanishing point with gentle parkour camera sway
      const vpX = width * 0.5 + Math.sin(time * 0.9) * 28;
      const vpY = height * 0.36 + Math.cos(time * 1.3) * 10;

      // 2. Perspective Megastructure Canyon Walls & Spline Ribs
      const numDepthSlices = 18;
      for (let i = numDepthSlices; i >= 1; i--) {
        const progress = ((i - ((time * 3.2) % 1)) / numDepthSlices);
        if (progress <= 0.02) continue;

        // Perspective scale (0 at horizon, 1 at camera foreground)
        const scale = Math.pow(1 - progress, 1.85);
        const sliceW = width * (0.08 + scale * 1.15);
        const sliceH = height * (0.06 + scale * 0.95);
        const cx = vpX + (width * 0.5 - vpX) * scale;
        const cy = vpY + (height * 0.58 - vpY) * scale;

        // Megastructure Corridor Frame
        ctx.strokeStyle = isUnderRoof
          ? `rgba(139, 92, 246, ${0.12 + scale * 0.35})`
          : `rgba(34, 38, 56, ${0.25 + scale * 0.55})`;
        ctx.lineWidth = 1 + scale * 1.5;
        ctx.strokeRect(cx - sliceW * 0.5, cy - sliceH * 0.5, sliceW, sliceH);

        // 3. KDTree 32m Clearance Sphere Scan Overlay
        if (showKdtreeScan) {
          const radius = sliceW * 0.28;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          if (obstructionInjected && i >= 6 && i <= 9) {
            ctx.strokeStyle = pruningActive
              ? "rgba(6, 182, 212, 0.95)"
              : "rgba(244, 63, 94, 0.85)";
            ctx.lineWidth = 2.2;
          } else {
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + scale * 0.55})`;
            ctx.lineWidth = 1.2;
          }
          ctx.stroke();
        }

        // 4. 6-Fixture Dynamic Light Pool Overlay (Only nearest 6 depth slices get active dynamic lights!)
        if (showLightPool && i <= 6) {
          const lightXLeft = cx - sliceW * 0.46;
          const lightXRight = cx + sliceW * 0.46;
          const lightY = cy - sliceH * 0.18;

          const activeColor = i % 2 === 0 ? "#06b6d4" : "#f97316";
          ctx.fillStyle = activeColor;
          ctx.beginPath();
          ctx.arc(
            i % 2 === 0 ? lightXLeft : lightXRight,
            lightY,
            3 + scale * 4.5,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Volumetric glow halo for pooled active light
          const glow = ctx.createRadialGradient(
            i % 2 === 0 ? lightXLeft : lightXRight,
            lightY,
            1,
            i % 2 === 0 ? lightXLeft : lightXRight,
            lightY,
            24 + scale * 36
          );
          glow.addColorStop(
            0,
            i % 2 === 0 ? "rgba(6, 182, 212, 0.38)" : "rgba(249, 115, 22, 0.38)"
          );
          glow.addColorStop(1, "rgba(7, 8, 12, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(
            i % 2 === 0 ? lightXLeft : lightXRight,
            lightY,
            24 + scale * 36,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      // 5. Primary Parkour Spline Track (S00 -> S60)
      ctx.beginPath();
      ctx.moveTo(width * 0.32, height);
      ctx.quadraticCurveTo(vpX - 18, height * 0.65, vpX, vpY);
      ctx.moveTo(width * 0.68, height);
      ctx.quadraticCurveTo(vpX + 18, height * 0.65, vpX, vpY);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 6. Injected Obstruction Mesh (< 32m Corridor Violation)
      if (obstructionInjected) {
        const obsX = vpX - 24;
        const obsY = vpY + 52;
        ctx.fillStyle = pruningActive
          ? "rgba(6, 182, 212, 0.35)"
          : "rgba(244, 63, 94, 0.32)";
        ctx.strokeStyle = pruningActive ? "#06b6d4" : "#f43f5e";
        ctx.lineWidth = 2;
        ctx.fillRect(obsX - 38, obsY - 45, 76, 95);
        ctx.strokeRect(obsX - 38, obsY - 45, 76, 95);

        // Violation Callout Tag
        ctx.fillStyle = pruningActive ? "#06b6d4" : "#f43f5e";
        ctx.font = "bold 11px monospace";
        ctx.fillText(
          pruningActive
            ? "KDTREE AUTO-PRUNING MESH..."
            : "VIOLATION: Pillar_S18 (11.4m < 32.0m)",
          obsX - 85,
          obsY - 54
        );
      }

      // 7. Camera-Local Rain Particle Suppression Overlay
      if (showRainSuppression) {
        if (!isUnderRoof) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.42)";
          ctx.lineWidth = 1.2;
          rainDrops.forEach((drop) => {
            drop.y = (drop.y + drop.speed) % 1;
            const rx = drop.x * width;
            const ry = drop.y * height;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 3, ry + drop.length);
            ctx.stroke();
          });
        } else {
          // Roof suppression shield bar at top of viewport
          ctx.fillStyle = "rgba(139, 92, 246, 0.16)";
          ctx.fillRect(0, 0, width, 28);
          ctx.fillStyle = "#c4b5fd";
          ctx.font = "11px monospace";
          ctx.fillText(
            "ROOF RAYCAST HIT: RainSuppressionVolume3D Active (0 Indoor Particles Leaked)",
            14,
            18
          );
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [showKdtreeScan, showLightPool, showRainSuppression, obstructionInjected, pruningActive]);

  const benchmarks = [
    {
      label: "Cerberus City Spline",
      value: "54.89 km / 60 Sectors",
      sub: "Streaming glTF 2.0 Ring-Buffer",
      color: "text-[#06b6d4]",
      icon: Radar,
    },
    {
      label: "KDTree Spatial Audit",
      value: "21,009 Objects Verified",
      sub: "100% >= 32.0m Corridor Clearance",
      color: "text-[#10b981]",
      icon: CheckCircle2,
    },
    {
      label: "Godot 4.7 Jolt Physics",
      value: "0.073 ms Physics Tick",
      sub: "34x Faster Than 8.33ms 120Hz Cap",
      color: "text-[#f97316]",
      icon: Gauge,
    },
    {
      label: "Headless CI/CD Suite",
      value: "106/106 GDScript Tests",
      sub: "Automated Zero-Regression Gate",
      color: "text-[#8b5cf6]",
      icon: Cpu,
    },
  ];

  return (
    <section id="hero" className="relative overflow-hidden border-b border-[#222638] py-10 lg:py-14">
      <div className="cyber-grid-bg pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Left Column: Value Proposition + Production Benchmarks + CTAs */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/40 bg-[#f97316]/10 px-3.5 py-1 text-xs font-medium text-[#f97316]">
              <Flame className="h-3.5 w-3.5" />
              <span>
                The &ldquo;Trojan Horse&rdquo; Boilerplate Extracted from MOMENTUM
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:leading-[1.12]">
              Stop Prompt-Guessing 3D Scenes.{" "}
              <span className="bg-gradient-to-r from-[#06b6d4] via-[#38bdf8] to-[#10b981] bg-clip-text text-transparent">
                Ship Verified Worlds.
              </span>
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Skip 300+ hours of broken Blender MCP scripts and frame-killing Godot
              imports. Get the exact{" "}
              <span className="font-mono-code text-xs text-[#06b6d4]">
                mathutils.kdtree
              </span>{" "}
              corridor validators, declarative JSON lighting contracts, 6-fixture
              dynamic light pools, and 106-test headless Godot 4.7 CI/CD harnesses
              proven across{" "}
              <strong className="font-semibold text-white">
                54.89 km of Cerberus City
              </strong>
              .
            </p>

            {/* 4 Production Benchmark Cards */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {benchmarks.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[#222638] bg-[#151823]/90 p-3.5 shadow-sm transition hover:border-[#38bdf8]/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">
                        {item.label}
                      </span>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <p
                      className={`mt-1.5 font-mono-code text-base font-bold ${item.color}`}
                    >
                      {item.value}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {item.sub}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Primary CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => onOpenCheckout("STARTER_KIT")}
                className="flex items-center gap-2 rounded-xl border border-[#38bdf8] bg-gradient-to-r from-[#06b6d4] to-[#0891b2] px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition hover:brightness-110"
              >
                <Sparkles className="h-4 w-4" />
                <span>Get Boilerplate Kit &mdash; $149</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onJumpToPipeline}
                className="flex items-center gap-2 rounded-xl border border-[#222638] bg-[#151823] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#06b6d4] hover:text-[#06b6d4]"
              >
                <Play className="h-4 w-4 text-[#10b981]" />
                <span>Launch CI/CD Runner</span>
              </button>

              <button
                type="button"
                onClick={onJumpToVault}
                className="font-mono-code text-xs text-slate-400 underline-offset-4 hover:text-[#06b6d4] hover:underline"
              >
                Inspect 99_validate_scene.py &rarr;
              </button>
            </div>
          </div>

          {/* Right Column: Interactive HTML5 3D-Perspective Corridor Visualizer */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-[#222638] bg-[#0e1017] shadow-[0_0_50px_rgba(0,0,0,0.75)]">
              {/* Viewport Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222638] bg-[#151823] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                  <span className="font-mono-code text-xs font-semibold text-white">
                    CERBERUS_CITY_R9 // LIVE CORRIDOR TELEMETRY
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono-code text-[11px]">
                  <span className="rounded bg-[#07080c] px-2 py-0.5 text-[#06b6d4]">
                    SECTOR S{String(currentSector).padStart(2, "0")}/S60
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 ${
                      obstructionInjected
                        ? "bg-[#f43f5e]/20 text-[#f43f5e]"
                        : "bg-[#10b981]/20 text-[#10b981]"
                    }`}
                  >
                    {obstructionInjected
                      ? "CLEARANCE: 94.2% (VIOLATION)"
                      : "CLEARANCE: 100.0% (32.0m)"}
                  </span>
                </div>
              </div>

              {/* Interactive HTML5 Canvas */}
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={680}
                  height={380}
                  className="block h-[340px] w-full bg-[#07080c] sm:h-[380px]"
                />

                {/* Floating HUD Overlay Top-Left */}
                <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 rounded-lg border border-[#222638] bg-[#07080c]/85 p-2.5 font-mono-code text-[11px] backdrop-blur-md">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-500">PHYSICS TICK:</span>
                    <span className="font-bold text-[#10b981]">0.073 ms</span>
                    <span className="text-[10px] text-slate-500">(120Hz lock)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-500">ACTIVE LIGHT POOL:</span>
                    <span className="font-bold text-[#f97316]">
                      6 / 6 Nearest Fixtures
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-500">RAIN PARTICLES:</span>
                    <span className="font-bold text-[#06b6d4]">
                      {roofCovered ? "0 (Roof Suppressed)" : "14,000 GPU Local"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Telemetry Overlay Controls */}
              <div className="border-t border-[#222638] bg-[#151823] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowKdtreeScan((v) => !v)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono-code text-xs transition ${
                        showKdtreeScan
                          ? "border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]"
                          : "border-[#222638] bg-[#0e1017] text-slate-400"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>KDTree 32m Scan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowLightPool((v) => !v)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono-code text-xs transition ${
                        showLightPool
                          ? "border-[#f97316]/50 bg-[#f97316]/15 text-[#f97316]"
                          : "border-[#222638] bg-[#0e1017] text-slate-400"
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>6-Light Pool</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRainSuppression((v) => !v)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono-code text-xs transition ${
                        showRainSuppression
                          ? "border-[#06b6d4]/50 bg-[#06b6d4]/15 text-[#06b6d4]"
                          : "border-[#222638] bg-[#0e1017] text-slate-400"
                      }`}
                    >
                      <CloudRain className="h-3.5 w-3.5" />
                      <span>Rain Culling</span>
                    </button>
                  </div>

                  {/* Interactive Obstruction / Prune Trigger */}
                  <button
                    type="button"
                    onClick={handleTriggerPrune}
                    disabled={pruningActive}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono-code text-xs font-semibold transition ${
                      obstructionInjected
                        ? "border-[#f43f5e] bg-[#f43f5e]/20 text-[#f43f5e] hover:bg-[#f43f5e]/30"
                        : "border-[#222638] bg-[#0e1017] text-slate-200 hover:border-[#f43f5e]/60 hover:text-[#f43f5e]"
                    }`}
                  >
                    {obstructionInjected ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>
                          {pruningActive
                            ? "Pruning via KDTree..."
                            : "Run KDTree Auto-Prune"}
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-3.5 w-3.5 text-[#f97316]" />
                        <span>Inject Corridor Obstruction</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
