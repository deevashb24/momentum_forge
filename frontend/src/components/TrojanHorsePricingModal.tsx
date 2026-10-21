"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Check,
  CloudCog,
  GitBranch,
  KeyRound,
  Lock,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type {
  EnrollmentAndLicense,
  LicenseCheckoutRequest,
  LicenseCheckoutResponse,
  TierType,
} from "@shared/index";
import { checkoutLicense } from "@/lib/api";

interface TrojanHorsePricingModalProps {
  enrollments: EnrollmentAndLicense[];
  isModalOpen: boolean;
  selectedTier: TierType;
  onSelectTier: (tier: TierType) => void;
  onCloseModal: () => void;
  onCheckoutSuccess: (receipt: LicenseCheckoutResponse) => void;
}

interface TierCardConfig {
  tier: TierType;
  name: string;
  badge: string;
  priceDisplay: string;
  billingNote: string;
  accentColor: string;
  borderAccent: string;
  description: string;
  features: string[];
}

const TIER_CARDS: TierCardConfig[] = [
  {
    tier: "STARTER_KIT",
    name: "Agentic GameDev Boilerplate Kit",
    badge: "MOST POPULAR // INSTANT REPO",
    priceDisplay: "$149",
    billingNote: "One-time license • Lifetime updates",
    accentColor: "text-[#06b6d4]",
    borderAccent: "border-[#06b6d4]/50",
    description:
      "Complete Blender 5.2 MCP harnesses, KDTree 32m corridor auditor, JSON scene contracts, and Godot 4.7 streaming runtime.",
    features: [
      "99_validate_scene.py KDTree Spatial Auditor",
      "R9_LIGHTING_CONTRACT.json & Rain Contracts",
      "Level01_CerberusCity.gd 6-Light Pool Runtime",
      "106-Assertion Headless GDScript Test Suite",
      "6-Module Self-Paced Practitioner Video Course",
    ],
  },
  {
    tier: "COHORT_BOOTCAMP",
    name: "Live 21-Day Maven Cohort Bootcamp",
    badge: "WINTER 2026 BATCH 04",
    priceDisplay: "$799",
    billingNote: "Live 3-week intensive • 12 seats left",
    accentColor: "text-[#8b5cf6]",
    borderAccent: "border-[#8b5cf6]/50",
    description:
      "Build & ship your own 50+ sector playablevertical slice alongside the creators of MOMENTUM with live code reviews.",
    features: [
      "Everything in the $149 Starter Boilerplate Kit",
      "6 Live Architecture & Shader Labs (Zoom + Discord)",
      "1-on-1 Blender MCP & Godot 4.7 Jolt Profiler Audit",
      "Custom SKILL.md Multi-Camera Visual QA Tuning",
      "Verified Autonomous Game Architect Certificate",
    ],
  },
  {
    tier: "STUDIO_LICENSE",
    name: "AA Studio Enterprise License",
    badge: "UP TO 30 ENGINE SEATS",
    priceDisplay: "$2,499",
    billingNote: "Organization-wide commercial license",
    accentColor: "text-[#f97316]",
    borderAccent: "border-[#f97316]/50",
    description:
      "Turnkey autonomous 3D asset & corridor verification pipeline for AA studios shipping commercial titles.",
    features: [
      "Unlimited Commercial Titles & 30 Developer Seats",
      "Private Self-Hosted Docker Blender+Godot CI Runner",
      "Custom Studio JSON Scene Contract Schema Setup",
      "4-Hour Live Onboarding Workshop for Tech Artists",
      "Priority Slack Engineering Channel Support",
    ],
  },
  {
    tier: "SAAS_PRO_PIPELINE",
    name: "Cloud CI/CD Validation Runner",
    badge: "RECURRING SAAS WEDGE",
    priceDisplay: "$49",
    billingNote: "per month • Automated GitHub App",
    accentColor: "text-[#10b981]",
    borderAccent: "border-[#10b981]/50",
    description:
      "Managed cloud GPU runners that execute headless Blender 5.2 + Godot 4.7 verification on every pull request.",
    features: [
      "Unlimited Headless KDTree & GDScript PR Runs",
      "Automated 4-Camera Visual QA Screenshot Diffs",
      "0.073ms Physics & VRAM Regression PR Blocking",
      "Instant Webhook Alerts to Discord / Linear / Slack",
      "Zero Local GPU Required for CI Verification",
    ],
  },
];

export function TrojanHorsePricingModal({
  enrollments,
  isModalOpen,
  selectedTier,
  onSelectTier,
  onCloseModal,
  onCheckoutSuccess,
}: TrojanHorsePricingModalProps) {
  const [buyerEmail, setBuyerEmail] = useState("deevash@hyperion-studio.dev");
  const [buyerHandle, setBuyerHandle] = useState("@deevash_dev");
  const [githubOrg, setGithubOrg] = useState("hyperion-interactive");
  const [cohortBatch, setCohortBatch] = useState("WINTER-2026-COHORT-04");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [latestReceipt, setLatestReceipt] =
    useState<LicenseCheckoutResponse | null>(null);

  useEffect(() => {
    setErrorMsg(null);
  }, [selectedTier, isModalOpen]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!buyerEmail.includes("@")) {
      setErrorMsg("Please enter a valid developer or studio email address.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: LicenseCheckoutRequest = {
        buyer_email: buyerEmail.trim(),
        buyer_handle: buyerHandle.trim() || "@studio_builder",
        tier: selectedTier,
        cohort_batch:
          selectedTier === "COHORT_BOOTCAMP" || selectedTier === "STUDIO_LICENSE"
            ? cohortBatch
            : null,
        github_org_or_user: githubOrg.trim() || "studio-dev",
      };
      const receipt = await checkoutLicense(payload);
      setLatestReceipt(receipt);
      onCheckoutSuccess(receipt);
    } catch {
      setErrorMsg("Unable to complete license provisioning. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="pricing" className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/40 bg-[#f97316]/10 px-3.5 py-1 font-mono-code text-xs font-medium text-[#f97316]">
            <KeyRound className="h-3.5 w-3.5" />
            <span>4-TIER MONETIZATION ENGINE // INSTANT GITHUB PROVISIONING</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Provision the Boilerplate, Join the Cohort, or Automate CI/CD
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">
            All transactions use integer-cent financial precision and automatic PII
            email masking (
            <code className="font-mono-code text-xs text-[#10b981]">
              d***@studio.dev
            </code>
            ) before persistence.
          </p>
        </div>

        {/* 4-Tier Pricing Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {TIER_CARDS.map((card) => {
            const isSelected = selectedTier === card.tier;
            return (
              <div
                key={card.tier}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                  isSelected
                    ? `${card.borderAccent} bg-[#151823] shadow-[0_0_30px_rgba(6,182,212,0.12)]`
                    : "border-[#222638] bg-[#0e1017] hover:border-[#222638]/90"
                }`}
              >
                <div>
                  <span
                    className={`inline-block rounded border border-[#222638] bg-[#07080c] px-2 py-0.5 font-mono-code text-[10px] font-bold ${card.accentColor}`}
                  >
                    {card.badge}
                  </span>

                  <h3 className="mt-3 text-base font-bold text-white">
                    {card.name}
                  </h3>

                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-mono-code text-3xl font-extrabold text-white">
                      {card.priceDisplay}
                    </span>
                    <span className="text-xs text-slate-400">USD</span>
                  </div>
                  <p className="mt-0.5 font-mono-code text-[11px] text-slate-400">
                    {card.billingNote}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                    {card.description}
                  </p>

                  <ul className="mt-4 space-y-2 border-t border-[#222638] pt-3.5">
                    {card.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-xs text-slate-200"
                      >
                        <Check
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${card.accentColor}`}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTier(card.tier)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#38bdf8]/50 bg-[#07080c] px-4 py-2.5 font-mono-code text-xs font-bold text-white transition hover:bg-[#06b6d4] hover:text-slate-950"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Provision {card.priceDisplay} License</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Live Masked Enrollments & License Feed */}
        <div className="mt-10 rounded-2xl border border-[#222638] bg-[#0e1017] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222638] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#10b981]" />
              <h3 className="font-mono-code text-xs font-bold uppercase tracking-wider text-white">
                Recent Verified License Provisionings (PII Masked Feed)
              </h3>
            </div>
            <span className="font-mono-code text-[11px] text-slate-400">
              GET /api/v1/licenses &bull; Zero Raw Email Storage
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {enrollments.slice(0, 4).map((lic) => (
              <div
                key={lic.id}
                className="rounded-xl border border-[#222638] bg-[#151823] p-3 font-mono-code text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#06b6d4]">
                    {lic.buyer_handle}
                  </span>
                  <span className="rounded bg-[#10b981]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#10b981]">
                    ${(lic.amount_cents / 100).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  {lic.buyer_email_masked}
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-[#222638] pt-1.5 text-[10px] text-slate-400">
                  <span>{lic.tier}</span>
                  <span className="text-[#f97316]">{lic.license_key_prefix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Checkout & Instant Key Provisioning Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#38bdf8]/50 bg-[#151823] shadow-[0_0_60px_rgba(6,182,212,0.25)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#222638] bg-[#0e1017] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Lock className="h-4 w-4 text-[#06b6d4]" />
                <h3
                  id="checkout-modal-title"
                  className="font-mono-code text-sm font-bold text-white"
                >
                  Instant License &amp; GitHub Repo Provisioning
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseModal}
                className="rounded-lg border border-[#222638] bg-[#151823] p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {/* Tier Switcher Tabs Inside Modal */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TIER_CARDS.map((t) => (
                  <button
                    key={t.tier}
                    type="button"
                    onClick={() => onSelectTier(t.tier)}
                    className={`rounded-lg border p-2 text-left font-mono-code transition ${
                      selectedTier === t.tier
                        ? "border-[#38bdf8] bg-[#07080c] text-[#06b6d4]"
                        : "border-[#222638] bg-[#0e1017] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-[10px] uppercase">
                      {t.tier.replace("_", " ")}
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-white">
                      {t.priceDisplay}
                    </div>
                  </button>
                ))}
              </div>

              {errorMsg && (
                <div className="mt-4 rounded-lg border border-[#f43f5e]/40 bg-[#f43f5e]/15 p-3 font-mono-code text-xs text-[#f43f5e]">
                  {errorMsg}
                </div>
              )}

              {/* Provisioned License Receipt Banner */}
              {latestReceipt && (
                <div className="mt-4 rounded-xl border border-[#10b981]/50 bg-[#10b981]/10 p-4 font-mono-code text-xs">
                  <div className="flex items-center justify-between text-[#10b981]">
                    <span className="font-bold">
                      ✓ LICENSE KEY ISSUED &amp; REPO PROVISIONED
                    </span>
                    <span>${latestReceipt.amount_usd.toLocaleString()} USD</span>
                  </div>
                  <div className="mt-2 space-y-1 text-slate-200">
                    <div>
                      <span className="text-slate-400">Masked Buyer:</span>{" "}
                      <strong className="text-white">
                        {latestReceipt.buyer_email_masked}
                      </strong>{" "}
                      ({latestReceipt.buyer_handle})
                    </div>
                    <div>
                      <span className="text-slate-400">License Key Prefix:</span>{" "}
                      <strong className="text-[#06b6d4]">
                        {latestReceipt.license_key_prefix}
                      </strong>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {latestReceipt.provisioning_message}
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Form */}
              <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-3.5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono-code text-[11px] font-medium text-slate-300">
                      DEVELOPER / STUDIO EMAIL (AUTO-MASKED)
                    </label>
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#222638] bg-[#07080c] px-3 py-2 font-mono-code text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-code text-[11px] font-medium text-slate-300">
                      DEVELOPER HANDLE
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerHandle}
                      onChange={(e) => setBuyerHandle(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#222638] bg-[#07080c] px-3 py-2 font-mono-code text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono-code text-[11px] font-medium text-slate-300">
                      GITHUB USERNAME OR ORG
                    </label>
                    <div className="relative mt-1">
                      <GitBranch className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={githubOrg}
                        onChange={(e) => setGithubOrg(e.target.value)}
                        className="w-full rounded-lg border border-[#222638] bg-[#07080c] py-2 pl-8 pr-3 font-mono-code text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono-code text-[11px] font-medium text-slate-300">
                      COHORT BATCH TAG
                    </label>
                    <input
                      type="text"
                      value={cohortBatch}
                      onChange={(e) => setCohortBatch(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#222638] bg-[#07080c] px-3 py-2 font-mono-code text-xs text-white focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#222638] pt-4">
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className="rounded-xl border border-[#222638] bg-[#0e1017] px-4 py-2.5 font-mono-code text-xs text-slate-300 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-xl border border-[#38bdf8] bg-gradient-to-r from-[#06b6d4] to-[#0891b2] px-5 py-2.5 font-mono-code text-xs font-bold text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition hover:brightness-110 disabled:opacity-50"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>
                      {submitting
                        ? "Provisioning Key..."
                        : `Complete Checkout & Issue mf_live_ Key`}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
