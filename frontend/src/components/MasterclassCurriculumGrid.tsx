"use client";

import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  GraduationCap,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import type { CurriculumModuleResponse, TierType } from "@shared/index";

interface MasterclassCurriculumGridProps {
  modules: CurriculumModuleResponse[];
  onInspectTemplate: (filename: string) => void;
  onOpenCheckout: (tier: TierType) => void;
}

export function MasterclassCurriculumGrid({
  modules,
  onInspectTemplate,
  onOpenCheckout,
}: MasterclassCurriculumGridProps) {
  const totalMinutes = modules.reduce((acc, m) => acc + m.duration_minutes, 0);
  const totalVideos = modules.reduce((acc, m) => acc + m.video_lessons_count, 0);

  return (
    <section id="curriculum" className="border-b border-[#222638] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-3 py-1 font-mono-code text-xs font-medium text-[#8b5cf6]">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>6-MODULE PRACTITIONER MASTERCLASS &amp; $799 MAVEN COHORT</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              From Zero to 54.89 km Autonomous Game Worlds
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
              Every module pairs high-density practitioner video lessons with a
              production harness in the Boilerplate Vault. Click any module&apos;s
              template pill to inspect the exact source file above.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-[#222638] bg-[#151823] px-3.5 py-2 font-mono-code text-xs text-slate-300">
              <span className="font-bold text-white">{totalVideos}</span> Video
              Lessons &bull;{" "}
              <span className="font-bold text-[#06b6d4]">
                {(totalMinutes / 60).toFixed(1)} hrs
              </span>{" "}
              Deep-Dive Engineering
            </div>

            <button
              type="button"
              onClick={() => onOpenCheckout("COHORT_BOOTCAMP")}
              className="flex items-center gap-1.5 rounded-xl border border-[#8b5cf6]/60 bg-[#8b5cf6]/20 px-4 py-2 text-xs font-bold text-[#c4b5fd] transition hover:bg-[#8b5cf6] hover:text-slate-950"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Reserve Cohort Seat ($799)</span>
            </button>
          </div>
        </div>

        {/* 6-Module Grid */}
        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#222638] bg-[#151823]/90 p-5 transition hover:border-[#38bdf8]/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
            >
              <div>
                {/* Top Module Number & Completion Pill */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-2.5 py-1 font-mono-code text-xs font-bold text-[#06b6d4]">
                    MODULE 0{mod.module_number}
                  </span>
                  <div className="flex items-center gap-2 font-mono-code text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3.5 w-3.5 text-[#f97316]" />
                      {mod.video_lessons_count} lessons
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#06b6d4]" />
                      {mod.duration_minutes}m
                    </span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="mt-3.5 text-base font-bold text-white group-hover:text-[#06b6d4]">
                  {mod.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {mod.subtitle}
                </p>

                {/* Deliverables Checklist */}
                <div className="mt-4 space-y-1.5 border-t border-[#222638] pt-3">
                  <span className="block font-mono-code text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Production Deliverables:
                  </span>
                  {mod.key_deliverables.map((deliv) => (
                    <div
                      key={deliv}
                      className="flex items-start gap-2 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10b981]" />
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer: Template Link + Completion Rate Bar */}
              <div className="mt-5 border-t border-[#222638] pt-3.5">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onInspectTemplate(mod.code_template_filename)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#222638] bg-[#07080c] px-2.5 py-1.5 font-mono-code text-[11px] font-medium text-[#06b6d4] transition hover:border-[#06b6d4] hover:bg-[#06b6d4]/10"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span>{mod.code_template_filename}</span>
                  </button>

                  <div className="text-right font-mono-code text-[11px]">
                    <span className="text-[#10b981] font-bold">
                      {mod.completion_rate_percent}%
                    </span>
                    <span className="ml-1 text-slate-500">pass rate</span>
                  </div>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#07080c]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#06b6d4] to-[#10b981]"
                    style={{ width: `${Math.min(100, mod.completion_rate_percent)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
