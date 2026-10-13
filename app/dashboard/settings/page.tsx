"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { CodeBlock } from "@/components/ui/code-block";
import { useAuth } from "@/components/auth/auth-context";
import {
  Check,
  Copy,
  RotateCw,
  Plus,
  Trash2,
} from "lucide-react";

export default function WorkspaceSettingsPage() {
  const { project, projects, switchProject, createProject, refreshSession } = useAuth();
  const [workspaceName, setWorkspaceName] = useState(project?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const [newProjectInput, setNewProjectInput] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName.trim() }),
      });
      if (res.ok) {
        setMessage({ text: "Workspace updated successfully." });
        refreshSession();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to update workspace.", isError: true });
      }
    } catch (err) {
      setMessage({ text: (err as Error).message, isError: true });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyProjectId = async () => {
    if (!project?.id) return;
    try {
      await navigator.clipboard.writeText(project.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
    }
  };

  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectInput.trim()) return;
    setIsCreatingProject(true);
    try {
      const created = await createProject(newProjectInput.trim());
      if (created) {
        setNewProjectInput("");
        setMessage({ text: `Created project "${created.name}".` });
      } else {
        setMessage({ text: "Failed to create project.", isError: true });
      }
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"? All endpoints, events, and deliveries in this project will be removed.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/projects?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to delete project.", isError: true });
      }
    } catch (err) {
      setMessage({ text: (err as Error).message, isError: true });
    }
  };

  const nodeVerificationSnippet = `import crypto from "node:crypto";

export function verifyRelaySignature(payload, signatureHeader, secret) {
  const elements = signatureHeader.split(",");
  const timestamp = elements.find(el => el.startsWith("t="))?.slice(2);
  const receivedSig = elements.find(el => el.startsWith("v1="))?.slice(3);

  if (!timestamp || !receivedSig) return false;

  const signedPayload = \`\${timestamp}.\${payload}\`;
  const computedSig = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computedSig, "hex"),
    Buffer.from(receivedSig, "hex")
  );
}`;

  return (
    <div className="flex-1 flex flex-col font-sans">
      <DashboardHeader
        title="Settings"
        description="Configuration and webhook dispatch policies"
      />

      <main className="p-6 sm:p-8 space-y-10 max-w-7xl w-full mx-auto">
        {message && (
          <div
            className={`p-3 rounded-md text-xs border ${message.isError
                ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"
                : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              }`}
          >
            {message.text}
          </div>
        )}

        <section className="space-y-4">
          <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                Projects ({projects.length})
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Switch workspaces or create additional isolated environments
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 divide-y divide-[#e7e7e5] dark:divide-white/[0.06]">
              {projects.map((p) => {
                const isActive = p.id === project?.id;
                return (
                  <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#111111] dark:text-white truncate">
                          {p.name}
                        </span>
                        {isActive && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 block truncate">
                        {p.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => switchProject(p.id)}
                          className="h-7 px-2.5 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                          Switch
                        </button>
                      )}
                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(p.id, p.name)}
                          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <form onSubmit={handleCreateNewProject} className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Create New Project
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjectInput}
                    onChange={(e) => setNewProjectInput(e.target.value)}
                    placeholder="e.g. Staging Webhooks"
                    className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingProject}
                  className="w-full h-8 rounded-md bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Project</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4 border-t border-[#e7e7e5] dark:border-white/[0.08]">
          <section className="space-y-4">
            <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                Active Project Details
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Rename the currently selected workspace
              </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder={project?.name || "Workspace"}
                  required
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Project ID
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-300 select-all">
                    {project?.id || "—"}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyProjectId}
                    className="p-2 rounded-md border border-[#e7e7e5] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-[#18181c] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    title="Copy ID"
                  >
                    {copiedId ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-3.5 py-1.5 bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-black font-medium rounded-md text-xs transition-colors flex items-center gap-1.5"
                >
                  {isUpdating && <RotateCw className="h-3 w-3 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                Engine Parameters
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Configured pipeline guarantees and retry thresholds
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#e7e7e5] dark:border-white/[0.06]">
                <span className="text-zinc-500 dark:text-zinc-400">Max Delivery Attempts</span>
                <span className="text-[#111111] dark:text-white font-medium">5 attempts</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#e7e7e5] dark:border-white/[0.06]">
                <span className="text-zinc-500 dark:text-zinc-400">Backoff Strategy</span>
                <span className="text-[#111111] dark:text-white font-medium">Exponential with Full Jitter</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#e7e7e5] dark:border-white/[0.06]">
                <span className="text-zinc-500 dark:text-zinc-400">Dispatch Timeout</span>
                <span className="text-[#111111] dark:text-white font-medium">10,000 ms</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#e7e7e5] dark:border-white/[0.06]">
                <span className="text-zinc-500 dark:text-zinc-400">Payload Upper Limit</span>
                <span className="text-[#111111] dark:text-white font-medium">256 KB</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500 dark:text-zinc-400">SSRF / DNS Defense</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active (RFC 1918 / Cloud Meta blocked)</span>
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-3 pt-6 border-t border-[#e7e7e5] dark:border-white/[0.08]">
          <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
            Verifying Webhook Signatures
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Relay signs all outgoing HTTP requests using HMAC-SHA256. Recipients should verify the <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.08] font-mono text-[11px] text-[#111111] dark:text-white">Relay-Signature</code> header before processing payloads:
          </p>
          <CodeBlock
            code={nodeVerificationSnippet}
            language="javascript"
            title="Node.js Verification Reference"
          />
        </section>
      </main>
    </div>
  );
}
