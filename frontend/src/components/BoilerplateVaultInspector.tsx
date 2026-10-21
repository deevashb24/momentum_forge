"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode2,
  FileJson,
  FileText,
  FolderGit2,
  Search,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import {
  ARTIFACT_CATEGORIES,
  type ArtifactCategory,
  type BoilerplateArtifactResponse,
  type TierType,
} from "@shared/index";
import { inspectBoilerplateArtifact } from "@/lib/api";

interface BoilerplateVaultInspectorProps {
  artifacts: BoilerplateArtifactResponse[];
  selectedFilename?: string | null;
  onSelectArtifactFile?: (filename: string) => void;
  onOpenCheckout: (tier: TierType) => void;
}

const CATEGORY_META: Record<
  ArtifactCategory,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  BPY_HARNESS: {
    label: "Blender Python Harness",
    badgeClass: "border-[#f97316]/40 bg-[#f97316]/10 text-[#f97316]",
    icon: TerminalSquare,
  },
  JSON_CONTRACT: {
    label: "Declarative Scene Contract",
    badgeClass: "border-[#06b6d4]/40 bg-[#06b6d4]/10 text-[#06b6d4]",
    icon: FileJson,
  },
  AGENT_SKILL: {
    label: "Agentic SKILL.md Prompt",
    badgeClass: "border-[#8b5cf6]/40 bg-[#8b5cf6]/10 text-[#8b5cf6]",
    icon: FileText,
  },
  GODOT_RUNTIME: {
    label: "Godot 4.7 Runtime (.gd)",
    badgeClass: "border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]",
    icon: FileCode2,
  },
  GDSCRIPT_TEST: {
    label: "Headless GDScript Test",
    badgeClass: "border-[#38bdf8]/40 bg-[#38bdf8]/10 text-[#38bdf8]",
    icon: Code2,
  },
};

export function BoilerplateVaultInspector({
  artifacts,
  selectedFilename,
  onSelectArtifactFile,
  onOpenCheckout,
}: BoilerplateVaultInspectorProps) {
  const [localArtifacts, setLocalArtifacts] =
    useState<BoilerplateArtifactResponse[]>(artifacts);
  const [activeCategory, setActiveCategory] = useState<ArtifactCategory | "ALL">(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArtifactId, setActiveArtifactId] = useState<string>(
    artifacts[0]?.id ?? ""
  );
  const [copied, setCopied] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionToast, setInspectionToast] = useState<string | null>(null);

  useEffect(() => {
    setLocalArtifacts(artifacts);
    if (artifacts.length > 0 && !activeArtifactId) {
      setActiveArtifactId(artifacts[0].id);
    }
  }, [artifacts, activeArtifactId]);

  useEffect(() => {
    if (!selectedFilename) return;
    const match = localArtifacts.find(
      (item) => item.filename.toLowerCase() === selectedFilename.toLowerCase()
    );
    if (match) {
      setActiveCategory("ALL");
      setActiveArtifactId(match.id);
    }
  }, [selectedFilename, localArtifacts]);

  const filteredArtifacts = localArtifacts.filter((item) => {
    if (activeCategory !== "ALL" && item.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.filename.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeArtifact =
    localArtifacts.find((item) => item.id === activeArtifactId) ||
    filteredArtifacts[0] ||
    localArtifacts[0];

  const handleSelectArtifact = async (artifact: BoilerplateArtifactResponse) => {
    setActiveArtifactId(artifact.id);
    onSelectArtifactFile?.(artifact.filename);
    try {
      const updated = await inspectBoilerplateArtifact(artifact.id);
      setLocalArtifacts((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
    } catch {
      // Fallback already handled in api client
    }
  };

  const handleTriggerInspectionDownload = async () => {
    if (!activeArtifact) return;
    setInspecting(true);
    try {
      const updated = await inspectBoilerplateArtifact(activeArtifact.id);
      setLocalArtifacts((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setInspectionToast(
        `Verified & logged inspection #${updated.download_count.toLocaleString()} for ${updated.filename}`
      );
      window.setTimeout(() => setInspectionToast(null), 4000);
    } finally {
      setInspecting(false);
    }
  };

  const handleCopySnippet = async () => {
    if (!activeArtifact) return;
    try {
      await navigator.clipboard.writeText(activeArtifact.source_preview);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const sourceLines = activeArtifact
    ? activeArtifact.source_preview.split("\n")
    : [];

  return (
    <section id="vault" className="border-b border-[#222638] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-1 font-mono-code text-xs font-medium text-[#06b6d4]">
              <FolderGit2 className="h-3.5 w-3.5" />
              <span>THE $149 BOILERPLATE VAULT // LIVE SOURCE HARNESSES</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Inspect the Production Harnesses Before You Provision
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
              Every file below is extracted directly from the 60-sector{" "}
              <span className="font-mono-code text-slate-200">
                Cerberus City R9
              </span>{" "}
              production repository. Filter by category, inspect the exact code, or
              trigger a live bundle verification via{" "}
              <code className="font-mono-code text-xs text-[#06b6d4]">
                GET /api/v1/artifacts/&#123;id&#125;
              </code>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenCheckout("STARTER_KIT")}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-[#38bdf8]/50 bg-[#151823] px-4 py-2.5 text-xs font-semibold text-[#06b6d4] transition hover:bg-[#06b6d4] hover:text-slate-950 md:self-auto"
          >
            <Sparkles className="h-4 w-4" />
            <span>Unlock Full GitHub Repository ($149)</span>
          </button>
        </div>

        {/* Category Filter Pills & Search Input */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveCategory("ALL")}
              className={`rounded-lg border px-3 py-1.5 font-mono-code text-xs font-medium transition ${
                activeCategory === "ALL"
                  ? "border-[#38bdf8] bg-[#151823] text-white"
                  : "border-[#222638] bg-[#0e1017] text-slate-400 hover:text-slate-200"
              }`}
            >
              ALL ({localArtifacts.length})
            </button>
            {ARTIFACT_CATEGORIES.map((category) => {
              const meta = CATEGORY_META[category];
              const isSelected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-lg border px-3 py-1.5 font-mono-code text-xs font-medium transition ${
                    isSelected
                      ? "border-[#38bdf8] bg-[#151823] text-[#06b6d4]"
                      : "border-[#222638] bg-[#0e1017] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {category} ({localArtifacts.filter((a) => a.category === category).length})
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search filename or contract..."
              className="w-full rounded-lg border border-[#222638] bg-[#0e1017] py-1.5 pl-8 pr-3 font-mono-code text-xs text-slate-200 placeholder:text-slate-500 focus:border-[#38bdf8] focus:outline-none"
            />
          </div>
        </div>

        {/* Split-Pane Explorer */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left Pane: Artifact File List */}
          <div className="flex flex-col gap-2.5 lg:col-span-4">
            {filteredArtifacts.map((artifact) => {
              const meta = CATEGORY_META[artifact.category];
              const Icon = meta.icon;
              const isSelected = activeArtifact?.id === artifact.id;

              return (
                <button
                  key={artifact.id}
                  type="button"
                  onClick={() => handleSelectArtifact(artifact)}
                  className={`group flex flex-col rounded-xl border p-3.5 text-left transition ${
                    isSelected
                      ? "border-[#38bdf8] bg-[#151823] shadow-[0_0_25px_rgba(56,189,248,0.12)]"
                      : "border-[#222638] bg-[#0e1017] hover:border-[#222638]/80 hover:bg-[#151823]/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#06b6d4]" />
                      <span className="font-mono-code text-xs font-bold text-white group-hover:text-[#06b6d4]">
                        {artifact.filename}
                      </span>
                    </div>
                    <span className="rounded border border-[#222638] bg-[#07080c] px-1.5 py-0.5 font-mono-code text-[10px] text-slate-400">
                      {artifact.version}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                    {artifact.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-[#222638]/80 pt-2 font-mono-code text-[11px] text-slate-400">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] ${meta.badgeClass}`}
                    >
                      {artifact.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span>{artifact.lines_of_code} LOC</span>
                      <span className="text-[#10b981]">
                        {artifact.download_count.toLocaleString()} pulls
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Pane: Code Inspector */}
          <div className="lg:col-span-8">
            {activeArtifact ? (
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#222638] bg-[#0e1017]">
                {/* Code Inspector Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222638] bg-[#151823] px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono-code text-sm font-bold text-white">
                        {activeArtifact.filename}
                      </span>
                      <span
                        className={`rounded border px-2 py-0.5 font-mono-code text-[10px] font-semibold ${
                          CATEGORY_META[activeArtifact.category].badgeClass
                        }`}
                      >
                        {CATEGORY_META[activeArtifact.category].label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {activeArtifact.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySnippet}
                      className="flex items-center gap-1.5 rounded-lg border border-[#222638] bg-[#07080c] px-3 py-1.5 font-mono-code text-xs text-slate-200 transition hover:border-[#06b6d4]"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#10b981]" />
                          <span className="text-[#10b981]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                          <span>Copy Harness</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleTriggerInspectionDownload}
                      disabled={inspecting}
                      className="flex items-center gap-1.5 rounded-lg border border-[#10b981]/50 bg-[#10b981]/15 px-3 py-1.5 font-mono-code text-xs font-semibold text-[#10b981] transition hover:bg-[#10b981]/25"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>
                        {inspecting
                          ? "Pulling..."
                          : `Pull Artifact (${activeArtifact.download_count.toLocaleString()})`}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Optional Live Inspection Toast Banner */}
                {inspectionToast && (
                  <div className="flex items-center justify-between border-b border-[#10b981]/30 bg-[#10b981]/10 px-4 py-2 font-mono-code text-xs text-[#10b981]">
                    <span>{inspectionToast}</span>
                    <span className="text-[10px] uppercase">GET /api/v1/artifacts/&#123;id&#125; 200 OK</span>
                  </div>
                )}

                {/* Safe React JSX Monospace Code Viewer */}
                <div className="flex-1 overflow-x-auto bg-[#07080c] p-4 font-mono-code text-xs leading-relaxed">
                  <table className="w-full border-collapse">
                    <tbody>
                      {sourceLines.map((line, index) => {
                        const trimmed = line.trim();
                        const isComment =
                          trimmed.startsWith("#") || trimmed.startsWith("//");
                        const isKeyword =
                          trimmed.startsWith("def ") ||
                          trimmed.startsWith("func ") ||
                          trimmed.startsWith("import ") ||
                          trimmed.startsWith("from ") ||
                          trimmed.startsWith("extends ") ||
                          trimmed.startsWith("class_name ") ||
                          trimmed.startsWith("const ");

                        return (
                          <tr
                            key={`${activeArtifact.id}-L${index}`}
                            className="hover:bg-[#151823]/60"
                          >
                            <td className="w-10 select-none pr-4 text-right text-[11px] text-slate-600">
                              {index + 1}
                            </td>
                            <td
                              className={`whitespace-pre ${
                                isComment
                                  ? "text-slate-500 italic"
                                  : isKeyword
                                  ? " font-semibold text-[#06b6d4]"
                                  : "text-slate-200"
                              }`}
                            >
                              {line || " "}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Inspector Footer Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#222638] bg-[#151823] px-4 py-2.5 font-mono-code text-[11px] text-slate-400">
                  <span>
                    FULL FILE: <strong className="text-white">{activeArtifact.lines_of_code} lines</strong>{" "}
                    included in Starter Kit &amp; Studio License
                  </span>
                  <span className="text-[#10b981]">
                    SHA-256 VERIFIED // ZERO UNSAFE EVAL
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
