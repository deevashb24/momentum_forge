"use client";

import React from "react";
import {
  Activity,
  Boxes,
  Code2,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import type { PlatformMetricsResponse, TierType } from "@shared/index";

interface HeaderProps {
  metrics: PlatformMetricsResponse;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  onOpenCheckout: (defaultTier?: TierType) => void;
}

export function Header({
  metrics,
  activeSection,
  onSelectSection,
  onOpenCheckout,
}: HeaderProps) {
  const navItems = [
    { id: "hero", label: "3D Telemetry", icon: Boxes },
    { id: "story", label: "Story Arc", icon: Sparkles },
    { id: "vault", label: "Boilerplate Vault", icon: Code2 },
    { id: "pipeline", label: "CI/CD Runner", icon: Terminal },
    { id: "curriculum", label: "Masterclass", icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#222638] bg-[#07080c]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Identity + Live Engine Status Badge */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onSelectSection("hero")}
            className="group flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#38bdf8]/40 bg-gradient-to-br from-[#06b6d4]/25 via-[#151823] to-[#f97316]/25 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition group-hover:border-[#38bdf8]">
              <Cpu className="h-5 w-5 text-[#06b6d4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">
                  MomentumForge
                </span>
                <span className="rounded border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-1.5 py-0.5 font-mono-code text-[10px] font-semibold text-[#06b6d4]">
                  AI v2.4
                </span>
              </div>
              <p className="font-mono-code text-[11px] text-slate-400">
                Autonomous Blender-to-Godot Engine
              </p>
            </div>
          </button>

          {/* Live Engine Pipeline Status Badge */}
          <div className="hidden items-center gap-2 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-3 py-1 xl:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
            </span>
            <span className="font-mono-code text-[11px] font-medium tracking-tight text-[#10b981]">
              BLENDER 5.2.1 MCP &rarr; GODOT 4.7.1 CI/CD ONLINE
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden items-center gap-1 rounded-lg border border-[#222638] bg-[#0e1017] p-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "border border-[#38bdf8]/40 bg-[#151823] text-[#06b6d4] shadow-sm"
                    : "text-slate-400 hover:bg-[#151823]/60 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live Telemetry Pill + Checkout CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-lg border border-[#222638] bg-[#0e1017] px-3 py-1.5 sm:flex">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#10b981]" />
              <span className="font-mono-code text-xs font-semibold text-white">
                ${metrics.total_revenue_usd.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                REV
              </span>
            </div>
            <div className="h-3.5 w-[1px] bg-[#222638]" />
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#06b6d4]" />
              <span className="font-mono-code text-xs font-semibold text-[#06b6d4]">
                {metrics.starter_kits_sold}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                Kits Sold
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenCheckout("STARTER_KIT")}
            className="flex items-center gap-2 rounded-lg border border-[#38bdf8]/60 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Provision Kit / License</span>
          </button>
        </div>
      </div>
    </header>
  );
}
