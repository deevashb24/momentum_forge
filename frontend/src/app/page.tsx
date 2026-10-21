"use client";

import React, { useEffect, useState } from "react";
import type {
  BoilerplateArtifactResponse,
  CurriculumModuleResponse,
  EnrollmentAndLicense,
  GameStoryPhase,
  LicenseCheckoutResponse,
  PipelineRunResponse,
  PlatformMetricsResponse,
  TierType,
} from "@shared/index";
import {
  FALLBACK_ARTIFACTS,
  FALLBACK_CURRICULUM,
  FALLBACK_ENROLLMENTS,
  FALLBACK_METRICS,
  FALLBACK_PIPELINE_RUNS,
  FALLBACK_STORY_PHASES,
  fetchBoilerplateArtifacts,
  fetchCurriculumModules,
  fetchEnrollments,
  fetchPipelineRuns,
  fetchPlatformMetrics,
  fetchStoryPhases,
} from "@/lib/api";
import { Header } from "@/components/Header";
import { RevenueFunnelBar } from "@/components/RevenueFunnelBar";
import { HeroCorridorVisualizer } from "@/components/HeroCorridorVisualizer";
import { StoryPhasesViewer } from "@/components/StoryPhasesViewer";
import { BoilerplateVaultInspector } from "@/components/BoilerplateVaultInspector";
import { PipelineRunnerConsole } from "@/components/PipelineRunnerConsole";
import { MasterclassCurriculumGrid } from "@/components/MasterclassCurriculumGrid";
import { TrojanHorsePricingModal } from "@/components/TrojanHorsePricingModal";

export default function MomentumForgePage() {
  const [metrics, setMetrics] =
    useState<PlatformMetricsResponse>(FALLBACK_METRICS);
  const [artifacts, setArtifacts] =
    useState<BoilerplateArtifactResponse[]>(FALLBACK_ARTIFACTS);
  const [runs, setRuns] = useState<PipelineRunResponse[]>(
    FALLBACK_PIPELINE_RUNS
  );
  const [modules, setModules] =
    useState<CurriculumModuleResponse[]>(FALLBACK_CURRICULUM);
  const [storyPhases, setStoryPhases] =
    useState<GameStoryPhase[]>(FALLBACK_STORY_PHASES);
  const [enrollments, setEnrollments] =
    useState<EnrollmentAndLicense[]>(FALLBACK_ENROLLMENTS);

  const [activeSection, setActiveSection] = useState<string>("hero");
  const [selectedVaultFilename, setSelectedVaultFilename] = useState<
    string | null
  >(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierType>("STARTER_KIT");

  useEffect(() => {
    let mounted = true;
    async function loadInitialTelemetry() {
      const [m, a, r, c, s, e] = await Promise.all([
        fetchPlatformMetrics(),
        fetchBoilerplateArtifacts(),
        fetchPipelineRuns(),
        fetchCurriculumModules(),
        fetchStoryPhases(),
        fetchEnrollments(),
      ]);
      if (!mounted) return;
      setMetrics(m);
      setArtifacts(a);
      setRuns(r);
      setModules(c);
      setStoryPhases(s);
      setEnrollments(e);
    }
    loadInitialTelemetry();
    return () => {
      mounted = false;
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenCheckout = (tier: TierType = "STARTER_KIT") => {
    setSelectedTier(tier);
    setIsCheckoutModalOpen(true);
  };

  const handleInspectTemplateFromCurriculum = (filename: string) => {
    setSelectedVaultFilename(filename);
    scrollToSection("vault");
  };

  const handlePipelineRunCompleted = (newRun: PipelineRunResponse) => {
    setRuns((prev) => [newRun, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      total_pipeline_runs: prev.total_pipeline_runs + 1,
    }));
  };

  const handleCheckoutSuccess = (receipt: LicenseCheckoutResponse) => {
    const newEnrollment: EnrollmentAndLicense = {
      id: receipt.id,
      buyer_email_masked: receipt.buyer_email_masked,
      buyer_handle: receipt.buyer_handle,
      tier: receipt.tier,
      amount_cents: receipt.amount_cents,
      github_repo_provisioned: receipt.github_repo_provisioned,
      license_key_prefix: receipt.license_key_prefix,
      cohort_batch: receipt.cohort_batch,
      created_at: receipt.created_at,
    };

    setEnrollments((prev) => [newEnrollment, ...prev]);

    // Update live revenue & unit counters immediately, then refresh from backend
    setMetrics((prev) => ({
      ...prev,
      total_revenue_cents: prev.total_revenue_cents + receipt.amount_cents,
      total_revenue_usd:
        prev.total_revenue_usd + Math.round(receipt.amount_cents / 100),
      starter_kits_sold:
        receipt.tier === "STARTER_KIT"
          ? prev.starter_kits_sold + 1
          : prev.starter_kits_sold,
      cohort_seats_filled:
        receipt.tier === "COHORT_BOOTCAMP"
          ? prev.cohort_seats_filled + 1
          : prev.cohort_seats_filled,
      studio_licenses_sold:
        receipt.tier === "STUDIO_LICENSE"
          ? prev.studio_licenses_sold + 1
          : prev.studio_licenses_sold,
      active_saas_pipelines:
        receipt.tier === "SAAS_PRO_PIPELINE"
          ? prev.active_saas_pipelines + 1
          : prev.active_saas_pipelines,
    }));

    fetchPlatformMetrics().then((freshMetrics) => {
      if (freshMetrics) setMetrics(freshMetrics);
    });
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100">
      {/* Top Sticky Engine Header */}
      <Header
        metrics={metrics}
        activeSection={activeSection}
        onSelectSection={scrollToSection}
        onOpenCheckout={handleOpenCheckout}
      />

      {/* High-Density Creator + SaaS Revenue Telemetry Bar */}
      <RevenueFunnelBar
        metrics={metrics}
        onSelectTierCheckout={handleOpenCheckout}
      />

      {/* Main Content */}
      <main>
        {/* Split-Screen Hero + Interactive 3D-Perspective Corridor Canvas */}
        <HeroCorridorVisualizer
          onOpenCheckout={handleOpenCheckout}
          onJumpToPipeline={() => scrollToSection("pipeline")}
          onJumpToVault={() => {
            setSelectedVaultFilename("99_validate_scene.py");
            scrollToSection("vault");
          }}
        />

        {/* AAA Cinematic Narrative Arc & 5 Story Phases Viewer */}
        <StoryPhasesViewer
          storyPhases={storyPhases}
          onInspectModuleTemplate={handleInspectTemplateFromCurriculum}
        />

        {/* Interactive Split-Pane Boilerplate Vault Code Explorer */}
        <BoilerplateVaultInspector
          artifacts={artifacts}
          selectedFilename={selectedVaultFilename}
          onSelectArtifactFile={(fname) => setSelectedVaultFilename(fname)}
          onOpenCheckout={handleOpenCheckout}
        />

        {/* 6-Stage Autonomous Blender-to-Godot CI/CD Pipeline Runner */}
        <PipelineRunnerConsole
          runs={runs}
          onRunCompleted={handlePipelineRunCompleted}
        />

        {/* 6-Module Practitioner Masterclass Curriculum Grid */}
        <MasterclassCurriculumGrid
          modules={modules}
          onInspectTemplate={handleInspectTemplateFromCurriculum}
          onOpenCheckout={handleOpenCheckout}
        />

        {/* 4-Tier Pricing Section + Instant License Provisioning Modal */}
        <TrojanHorsePricingModal
          enrollments={enrollments}
          isModalOpen={isCheckoutModalOpen}
          selectedTier={selectedTier}
          onSelectTier={(tier) => {
            setSelectedTier(tier);
            setIsCheckoutModalOpen(true);
          }}
          onCloseModal={() => setIsCheckoutModalOpen(false)}
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222638] bg-[#0e1017] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="font-mono-code text-xs text-slate-400">
            <span className="font-bold text-white">MomentumForge AI</span>{" "}
            &bull; Extracted from the 54.89 km Cerberus City R9 Production
            Pipeline
          </div>
          <div className="flex flex-wrap items-center gap-4 font-mono-code text-xs text-slate-400">
            <span className="text-[#10b981]">
              100% React JSX Auto-Escaped
            </span>
            <span>&bull;</span>
            <span className="text-[#06b6d4]">Zero Raw PII Storage</span>
            <span>&bull;</span>
            <span>Blender 5.2.1 MCP &rarr; Godot 4.7.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
