"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { useAuth } from "@/components/auth/auth-context";
import { RotateCw, LogOut } from "lucide-react";

export default function UserProfilePage() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "New passwords do not match.", isError: true });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ text: "New password must be at least 8 characters.", isError: true });
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ text: data.error || "Failed to update password.", isError: true });
      }
    } catch (err) {
      setMessage({ text: (err as Error).message, isError: true });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans">
      <DashboardHeader
        title="Profile"
        description="Account credentials and security settings"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section className="space-y-4">
            <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                Account Credentials
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Active identity and authentication session
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="py-2 border-b border-[#e7e7e5] dark:border-white/[0.06]">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Email Address</span>
                <span className="text-[#111111] dark:text-white font-medium">{user?.email || "—"}</span>
              </div>
              <div className="py-2 border-b border-[#e7e7e5] dark:border-white/[0.06]">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">User ID</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 select-all break-all">{user?.id || "—"}</span>
              </div>
              <div className="py-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Session State</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active (HTTP-Only Secure Cookie)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1.5 rounded-md border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs transition-colors flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <div className="pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] dark:text-white">
                Change Password
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Update account password credentials
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full bg-[#fafaf9] dark:bg-[#09090b] border border-[#e7e7e5] dark:border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#111111] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-3.5 py-1.5 bg-[#111111] dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-black font-medium rounded-md text-xs transition-colors flex items-center gap-1.5"
                >
                  {isUpdating && <RotateCw className="h-3 w-3 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
