"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadMedia } from "@/lib/adminClient";

/** Labelled single-line text input. */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-forest-100">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-forest-950/60 px-3 py-2 text-sm text-white placeholder:text-forest-100/40 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
      />
      {hint && <span className="mt-1 block text-xs text-forest-100/50">{hint}</span>}
    </label>
  );
}

/** Labelled multi-line text input. */
export function TextArea({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-forest-100">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-forest-950/60 px-3 py-2 text-sm text-white placeholder:text-forest-100/40 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
      />
    </label>
  );
}

/** Labelled number input. */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-forest-100">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-forest-950/60 px-3 py-2 text-sm text-white focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
        />
        {suffix && <span className="text-xs text-forest-100/50">{suffix}</span>}
      </div>
    </label>
  );
}

/**
 * A button that uploads a chosen image/video to Supabase Storage and returns
 * the resulting public URL via `onUploaded`.
 */
export function UploadButton({
  kind,
  label,
  onUploaded,
}: {
  kind: "image" | "video";
  label: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadMedia(file, kind);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={kind === "image" ? "image/*" : "video/*"}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-3 py-2 text-sm font-semibold text-forest-950 transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Upload className="h-4 w-4" aria-hidden />
        )}
        {busy ? "Uploading…" : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}
