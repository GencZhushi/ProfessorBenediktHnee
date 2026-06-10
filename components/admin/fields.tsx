"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { deleteMedia, uploadMedia } from "@/lib/adminClient";

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

/** Labelled color picker with a synced hex text input. */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-forest-100">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-forest-950/60 p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#1d3a2c"
          className="w-full rounded-lg border border-white/10 bg-forest-950/60 px-3 py-2 text-sm text-white placeholder:text-forest-100/40 focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
        />
      </div>
    </label>
  );
}

/** Labelled select / dropdown. */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-forest-100">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-white/10 bg-forest-950/60 px-3 py-2 text-sm text-white focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-forest-950">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Labelled range slider with a live value readout. */
export function RangeField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-sm font-medium text-forest-100">
        <span>{label}</span>
        <span className="text-forest-100/60">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-accent-500"
      />
    </label>
  );
}

/** Labelled on/off toggle. */
export function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm font-medium text-forest-100">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          value ? "bg-accent-500" : "bg-white/15"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
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

/**
 * A button that permanently deletes an uploaded file from Supabase Storage and
 * clears the field via `onDeleted`. If the URL is an external link or a /public
 * path (not a file we uploaded), it just clears the field. Disabled when empty.
 */
export function DeleteMediaButton({
  url,
  password,
  label = "Delete from storage",
  onDeleted,
}: {
  url: string;
  password: string;
  label?: string;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!url) return;
    if (!window.confirm("Delete this file permanently from Supabase? This cannot be undone.")) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteMedia(url, password);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy || !url}
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 ring-1 ring-red-500/20 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="h-4 w-4" aria-hidden />
        )}
        {busy ? "Deleting…" : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}
