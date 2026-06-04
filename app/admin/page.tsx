"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { fetchSettings, type SiteSettings } from "@/lib/settings";
import { checkPassword } from "@/lib/adminClient";
import AdminPanel from "@/components/admin/AdminPanel";

const STORAGE_KEY = "benedikt-admin-pw";
const ADMIN_NAME = "Prof. Dr. phil. Hans-Peter Benedikt";

type Phase = "login" | "loading" | "ready";

export default function AdminPage() {
  const [phase, setPhase] = useState<Phase>("login");
  const [password, setPassword] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Try to resume a session stored from a previous visit.
  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (saved) signIn(saved, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(pw: string, fromForm: boolean) {
    if (fromForm) setSubmitting(true);
    setError(null);
    try {
      const ok = await checkPassword(pw);
      if (!ok) {
        if (fromForm) setError("Wrong password. Please try again.");
        sessionStorage.removeItem(STORAGE_KEY);
        setSubmitting(false);
        return;
      }
      setPhase("loading");
      const loaded = await fetchSettings();
      setSettings(loaded);
      setPassword(pw);
      sessionStorage.setItem(STORAGE_KEY, pw);
      setPhase("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setPassword("");
    setInput("");
    setSettings(null);
    setPhase("login");
  }

  if (phase === "ready" && settings) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-forest-800 to-forest-900">
        <AdminPanel password={password} initialSettings={settings} onLogout={logout} />
      </main>
    );
  }

  if (phase === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-forest-800 to-forest-900 text-forest-100">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> Loading…
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-forest-800 to-forest-900 px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn(input, true);
        }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/20 text-accent-300">
            <Lock className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="font-serif text-xl font-bold text-white">Admin sign in</h1>
          <p className="mt-1 text-sm text-forest-100/70">{ADMIN_NAME}</p>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-forest-100">Password</span>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter admin password"
            className="w-full rounded-lg border border-white/10 bg-forest-950/60 px-3 py-2.5 text-sm text-white placeholder:text-forest-100/40 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={submitting || input.length === 0}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-forest-950 transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {submitting ? "Checking…" : "Sign in"}
        </button>

        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-forest-100/60 transition-colors hover:text-forest-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to site
        </Link>
      </form>
    </main>
  );
}
