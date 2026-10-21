"use client";

import React from "react";
import {
  Building2,
  CloudCog,
  DollarSign,
  PackageCheck,
  Users,
  Zap,
} from "lucide-react";
import type { PlatformMetricsResponse, TierType } from "@shared/index";

interface RevenueFunnelBarProps {
  metrics: PlatformMetricsResponse;
  onSelectTierCheckout: (tier: TierType) => void;
}

export function RevenueFunnelBar({
  metrics,
  onSelectTierCheckout,
}: RevenueFunnelBarProps) {
  return (
    <section
      aria-label="Creator & SaaS Revenue Telemetry"
      className="border-b border-[#222638] bg-[#0e1017]/90"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {/* Total Platform Revenue */}
          <div className="flex flex-col justify-between rounded-lg border border-[#222638] bg-[#151823]/90 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Total Platform Rev</span>
              <DollarSign className="h-3.5 w-3.5 text-[#10b981]" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono-code text-base font-bold text-[#10b981]">
                ${metrics.total_revenue_usd.toLocaleString()}
              </span>
              <span className="font-mono-code text-[10px] text-slate-400">
                USD
              </span>
            </div>
          </div>

          {/* Starter Kits Sold ($149) */}
          <button
            type="button"
            onClick={() => onSelectTierCheckout("STARTER_KIT")}
            className="flex flex-col justify-between rounded-lg border border-[#222638] bg-[#151823]/90 p-2.5 text-left transition hover:border-[#06b6d4]"
          >
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Starter Kits ($149)</span>
              <PackageCheck className="h-3.5 w-3.5 text-[#06b6d4]" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-mono-code text-base font-bold text-white">
                {metrics.starter_kits_sold}
              </span>
              <span className="font-mono-code text-[10px] text-[#06b6d4]">
                ${(metrics.starter_kits_sold * 149).toLocaleString()}
              </span>
            </div>
          </button>

          {/* Cohort Bootcamp Seats ($799) */}
          <button
            type="button"
            onClick={() => onSelectTierCheckout("COHORT_BOOTCAMP")}
            className="flex flex-col justify-between rounded-lg border border-[#222638] bg-[#151823]/90 p-2.5 text-left transition hover:border-[#8b5cf6]"
          >
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Cohort Seats ($799)</span>
              <Users className="h-3.5 w-3.5 text-[#8b5cf6]" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-mono-code text-base font-bold text-white">
                {metrics.cohort_seats_filled}/{metrics.cohort_seats_capacity}
              </span>
              <span className="font-mono-code text-[10px] text-[#8b5cf6]">
                Batch 04 Live
              </span>
            </div>
          </button>

          {/* Studio Enterprise Licenses ($2,499) */}
          <button
            type="button"
            onClick={() => onSelectTierCheckout("STUDIO_LICENSE")}
            className="flex flex-col justify-between rounded-lg border border-[#222638] bg-[#151823]/90 p-2.5 text-left transition hover:border-[#f97316]"
          >
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Studio Licenses ($2.5k)</span>
              <Building2 className="h-3.5 w-3.5 text-[#f97316]" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-mono-code text-base font-bold text-white">
                {metrics.studio_licenses_sold}
              </span>
              <span className="font-mono-code text-[10px] text-[#f97316]">
                AA Teams
              </span>
            </div>
          </button>

          {/* Active Pro SaaS Pipelines ($49/mo) */}
          <button
            type="button"
            onClick={() => onSelectTierCheckout("SAAS_PRO_PIPELINE")}
            className="flex flex-col justify-between rounded-lg border border-[#222638] bg-[#151823]/90 p-2.5 text-left transition hover:border-[#10b981]"
          >
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Pro SaaS ($49/mo)</span>
              <CloudCog className="h-3.5 w-3.5 text-[#10b981]" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-mono-code text-base font-bold text-white">
                {metrics.active_saas_pipelines}
              </span>
              <span className="font-mono-code text-[10px] text-[#10b981]">
                Active CI/CD
              </span>
            </div>
          </button>

          {/* Pipeline Pass Rate & Speedup */}
          <div className="flex flex-col justify-between rounded-lg border border-[#222638] bg-[#151823]/90 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>CI/CD Pass / Speedup</span>
              <Zap className="h-3.5 w-3.5 text-[#06b6d4]" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-mono-code text-base font-bold text-[#06b6d4]">
                {metrics.pipeline_pass_rate_percent}%
              </span>
              <span className="font-mono-code text-[10px] text-slate-300">
                {metrics.avg_pipeline_speedup_x}x faster
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
