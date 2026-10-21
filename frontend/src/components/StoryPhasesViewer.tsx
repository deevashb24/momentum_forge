"use client";

import React, { useState } from "react";
import {
  Camera,
  Check,
  ChevronRight,
  Compass,
  Copy,
  Film,
  Layers,
  Music2,
  Play,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import type { GameStoryPhase } from "@shared/index";

interface StoryPhasesViewerProps {
  storyPhases: GameStoryPhase[];
  onInspectModuleTemplate?: (filename: string) => void;
}

export function StoryPhasesViewer({
  storyPhases,
  onInspectModuleTemplate,
}: StoryPhasesViewerProps) {
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number>(1); // Default to Cerberus Megacity (Phase 1)
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const activePhase = storyPhases[selectedPhaseIdx] ?? storyPhases[0];

  const handleCopyPrompt = (phaseId: string, promptText: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(promptText);
      setCopiedPromptId(phaseId);
      setTimeout(() => setCopiedPromptId(null), 2500);
    }
  };

  const phaseColors: Record<
    number,
    { border: string; bg: string; text: string; glow: string; badge: string }
  > = {
    0: {
      border: "border-[#f97316]/50",
      bg: "bg-[#f97316]/10",
      text: "text-[#f97316]",
      glow: "rgba(249,115,22,0.15)",
      badge: "bg-[#f97316]/20 text-[#f97316] border-[#f97316]/40",
    },
    1: {
      border: "border-[#06b6d4]/50",
      bg: "bg-[#06b6d4]/10",
      text: "text-[#06b6d4]",
      glow: "rgba(6,182,212,0.15)",
      badge: "bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/40",
    },
    2: {
      border: "border-[#8b5cf6]/50",
      bg: "bg-[#8b5cf6]/10",
      text: "text-[#8b5cf6]",
      glow: "rgba(139,92,246,0.15)",
      badge: "bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/40",
    },
    3: {
      border: "border-[#eab308]/50",
      bg: "bg-[#eab308]/10",
      text: "text-[#eab308]",
      glow: "rgba(234,179,8,0.15)",
      badge: "bg-[#eab308]/20 text-[#eab308] border-[#eab308]/40",
    },
    4: {
      border: "border-[#10b981]/50",
      bg: "bg-[#10b981]/10",
      text: "text-[#10b981]",
      glow: "rgba(16,185,129,0.15)",
      badge: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40",
    },
  };

  const currentTheme =
    phaseColors[activePhase?.phase_number ?? 1] ?? phaseColors[1];

  return (
    <section id="story" className="border-b border-[#222638] bg-[#07080c] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-3 py-1 font-mono-code text-xs font-semibold text-[#8b5cf6]">
              <Sparkles className="h-3.5 w-3.5" />
              AAA CINEMATIC NARRATIVE ARC & LEVEL PHASES
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              MOMENTUM // Cerberus City Story Progression
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              The 5 complete narrative acts, level physics mechanics, 86-bone
              Operative Kaelen rig variants, and procedural camera harnesses.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono-code text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#06b6d4]" />
              5 Story Phases
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#10b981]" />
              54.89 km Arc
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f97316]" />
              Draco glTF Ready
            </span>
          </div>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {storyPhases.map((phase, idx) => {
            const isSelected = selectedPhaseIdx === idx;
            const theme = phaseColors[phase.phase_number] ?? phaseColors[1];
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedPhaseIdx(idx)}
                className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? `border-white/40 ${theme.bg} shadow-lg`
                    : "border-[#222638] bg-[#0e1017] hover:border-slate-600 hover:bg-[#151823]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono-code text-[11px] font-bold ${
                      isSelected ? theme.text : "text-slate-400"
                    }`}
                  >
                    PHASE 0{phase.phase_number}
                  </span>
                  <span className="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 font-mono-code text-[10px] text-slate-300">
                    {phase.cinematic_id}
                  </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-200 line-clamp-1">
                  {phase.title.split(":")[0]}
                </div>
                <div className="mt-1 font-mono-code text-[10px] text-slate-400 line-clamp-1">
                  {phase.setting.split("(")[0]}
                </div>
                {isSelected && (
                  <div
                    className="absolute -bottom-1 left-4 right-4 h-0.5 rounded-full"
                    style={{ backgroundColor: theme.text.replace("text-", "") }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Phase Main Display */}
        {activePhase && (
          <div
            className="rounded-2xl border border-[#222638] bg-[#0e1017] p-6 shadow-2xl transition-all lg:p-8"
            style={{
              boxShadow: `0 0 40px ${currentTheme.glow}`,
            }}
          >
            {/* Top Phase Header Bar */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#222638] pb-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`rounded-md border px-2.5 py-0.5 font-mono-code text-xs font-bold ${currentTheme.badge}`}
                  >
                    {activePhase.code}
                  </span>
                  <span className="rounded border border-slate-700 bg-[#151823] px-2.5 py-0.5 font-mono-code text-xs text-slate-300">
                    REEL: {activePhase.cinematic_id}
                  </span>
                  <span className="flex items-center gap-1 font-mono-code text-xs text-slate-400">
                    <Compass className="h-3.5 w-3.5 text-slate-400" />
                    {activePhase.setting}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {activePhase.title}
                </h3>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyPrompt(
                      activePhase.id,
                      activePhase.cinematic_camera_prompt
                    )
                  }
                  className="flex items-center gap-2 rounded-lg border border-[#222638] bg-[#151823] px-3.5 py-2 font-mono-code text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-[#1c2130]"
                >
                  {copiedPromptId === activePhase.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#10b981]" />
                      <span className="text-[#10b981]">Prompt Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copy Camera Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Two-Column Phase Deep-Dive */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Lore Synopsis & Cinematic Reel (7 cols) */}
              <div className="space-y-6 lg:col-span-7">
                {/* Lore Synopsis Card */}
                <div className="rounded-xl border border-[#222638] bg-[#151823]/60 p-5">
                  <div className="mb-2 flex items-center gap-2 font-mono-code text-xs font-semibold text-slate-400">
                    <Film className="h-4 w-4 text-[#06b6d4]" />
                    NARRATIVE LORE SYNOPSIS
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {activePhase.lore_synopsis}
                  </p>
                </div>

                {/* Cinematic Camera Rig & Sora/Midjourney Prompt */}
                <div className="rounded-xl border border-[#222638] bg-[#07080c] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono-code text-xs font-semibold text-[#f97316]">
                      <Camera className="h-4 w-4" />
                      CINEMATIC CAMERA RIG & AI PROMPT SPECIFICATION
                    </div>
                    <span className="font-mono-code text-[10px] text-slate-500">
                      Sora / Runway Gen-3 / Midjourney v6.1 / Blender
                    </span>
                  </div>
                  <div className="rounded-lg border border-[#222638] bg-[#0e1017] p-3.5 font-mono-code text-xs leading-relaxed text-slate-300 select-all">
                    {activePhase.cinematic_camera_prompt}
                  </div>
                </div>
              </div>

              {/* Right Column: Mechanics, Character Rig & Audio (5 cols) */}
              <div className="space-y-5 lg:col-span-5">
                {/* Operative Kaelen Rig Variant */}
                <div className="rounded-xl border border-[#222638] bg-[#151823]/60 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono-code text-xs font-semibold text-slate-300">
                      <Shield className="h-4 w-4 text-[#10b981]" />
                      OPERATIVE RIG VARIANT
                    </div>
                    <span className="rounded bg-[#10b981]/10 px-2 py-0.5 font-mono-code text-[10px] font-semibold text-[#10b981]">
                      86 BONES
                    </span>
                  </div>
                  <div className="font-mono-code text-xs font-bold text-white">
                    {activePhase.operative_variant}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Rigged in Blender 5.2.1 LTS with root-motion compensation,
                    ik_foot_l/r constraints, and secondary canister inertia.
                  </p>
                </div>

                {/* Dynamic Soundtrack Tempo */}
                <div className="rounded-xl border border-[#222638] bg-[#151823]/60 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono-code text-xs font-semibold text-slate-300">
                      <Music2 className="h-4 w-4 text-[#8b5cf6]" />
                      AUDIO TEMPO & SOUNDTRACK
                    </div>
                    <span className="rounded bg-[#8b5cf6]/10 px-2 py-0.5 font-mono-code text-[10px] font-semibold text-[#8b5cf6]">
                      DYNAMIC MIX
                    </span>
                  </div>
                  <div className="font-mono-code text-xs font-bold text-white">
                    {activePhase.soundtrack_tempo}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    GDScript AudioServer bus routing with high-pass resonance
                    filters triggered by wall-run velocity and freefall delta.
                  </p>
                </div>

                {/* Level Mechanics Grid */}
                <div className="rounded-xl border border-[#222638] bg-[#151823]/60 p-5">
                  <div className="mb-3 flex items-center gap-2 font-mono-code text-xs font-semibold text-slate-300">
                    <Zap className="h-4 w-4 text-[#eab308]" />
                    ACTIVE LEVEL PHYSICS MECHANICS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activePhase.level_mechanics.map((mech, mIdx) => (
                      <span
                        key={mIdx}
                        className="rounded-lg border border-[#222638] bg-[#0e1017] px-2.5 py-1 font-mono-code text-xs text-slate-300"
                      >
                        &bull; {mech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Callout */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#222638] pt-5">
              <div className="flex items-center gap-2 font-mono-code text-xs text-slate-400">
                <span className="text-white font-semibold">
                  Phase 0{activePhase.phase_number} Complete:
                </span>{" "}
                All assets verified against Godot 4.7.1 scene contracts and
                0.073ms physics budget.
              </div>

              {onInspectModuleTemplate && (
                <button
                  type="button"
                  onClick={() =>
                    onInspectModuleTemplate(
                      activePhase.phase_number === 0
                        ? "SKILL_fpp_parkour.md"
                        : activePhase.phase_number === 1
                        ? "01_generate_cerberus_sectors.py"
                        : activePhase.phase_number === 2
                        ? "99_validate_scene.py"
                        : activePhase.phase_number === 3
                        ? "Level01_CerberusCity.gd"
                        : "test_level01_r9_abandoned_city.gd"
                    )
                  }
                  className="inline-flex items-center gap-1.5 font-mono-code text-xs font-semibold text-[#06b6d4] hover:underline"
                >
                  <span>Inspect Phase Code Template in Vault</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
