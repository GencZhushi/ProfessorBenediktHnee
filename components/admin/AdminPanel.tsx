"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  type LanguageOption,
  type SiteSettings,
  newId,
} from "@/lib/settings";
import { saveConfig } from "@/lib/adminClient";
import { NumberField, TextArea, TextField, UploadButton } from "@/components/admin/fields";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function AdminPanel({
  password,
  initialSettings,
  onLogout,
}: {
  password: string;
  initialSettings: SiteSettings;
  onLogout: () => void;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string>("");

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaveState("idle");
  }

  function updateOption(id: string, patch: Partial<LanguageOption>) {
    setSettings((s) => ({
      ...s,
      languageOptions: s.languageOptions.map((o) =>
        o.id === id ? { ...o, ...patch } : o,
      ),
    }));
    setSaveState("idle");
  }

  function addOption() {
    setSettings((s) => ({
      ...s,
      languageOptions: [
        ...s.languageOptions,
        { id: newId(), label: "New language", locale: "", video: "", chatUrl: "" },
      ],
    }));
    setSaveState("idle");
  }

  function removeOption(id: string) {
    setSettings((s) => ({
      ...s,
      languageOptions: s.languageOptions.filter((o) => o.id !== id),
    }));
    setSaveState("idle");
  }

  function moveOption(id: string, dir: -1 | 1) {
    setSettings((s) => {
      const list = [...s.languageOptions];
      const i = list.findIndex((o) => o.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return s;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...s, languageOptions: list };
    });
    setSaveState("idle");
  }

  async function handleSave() {
    setSaveState("saving");
    setMessage("");
    try {
      await saveConfig(password, settings);
      setSaveState("saved");
      setMessage("Saved. Your changes are now live.");
    } catch (err) {
      setSaveState("error");
      setMessage(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Admin panel</h1>
          <p className="text-sm text-forest-100/70">
            Signed in as Prof. Dr. phil. Hans-Peter Benedikt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-forest-100 ring-1 ring-white/10 transition-colors hover:bg-white/10"
          >
            View site <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-forest-100 ring-1 ring-white/10 transition-colors hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Log out
          </button>
        </div>
      </header>

      {/* General text */}
      <Section title="Page text">
        <TextField
          label="Professor name"
          value={settings.professorName}
          onChange={(v) => update("professorName", v)}
        />
        <TextField
          label="Assistant name (big highlighted text)"
          value={settings.assistantName}
          onChange={(v) => update("assistantName", v)}
        />
        <TextArea
          label="Heading line (above the assistant name)"
          value={settings.headingPrefix}
          onChange={(v) => update("headingPrefix", v)}
        />
        <TextField
          label="University / footer line (leave empty to hide)"
          value={settings.universityName}
          onChange={(v) => update("universityName", v)}
        />
      </Section>

      {/* Photo */}
      <Section title="Professor photo">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="relative shrink-0 overflow-hidden rounded-xl bg-forest-950/60 ring-1 ring-white/10"
            style={{
              width: 120,
              aspectRatio: `${settings.photoAspectW} / ${settings.photoAspectH}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.professorPhoto}
              alt="Current professor photo"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-3">
            <UploadButton
              kind="image"
              label="Upload new photo"
              onUploaded={(url) => update("professorPhoto", url)}
            />
            <TextField
              label="…or paste an image URL"
              value={settings.professorPhoto}
              onChange={(v) => update("professorPhoto", v)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            label="Displayed width"
            value={settings.photoWidth}
            onChange={(v) => update("photoWidth", v)}
            min={120}
            max={640}
            suffix="px"
          />
          <NumberField
            label="Frame width"
            value={settings.photoAspectW}
            onChange={(v) => update("photoAspectW", v)}
            min={1}
          />
          <NumberField
            label="Frame height"
            value={settings.photoAspectH}
            onChange={(v) => update("photoAspectH", v)}
            min={1}
          />
        </div>
        <p className="text-xs text-forest-100/50">
          Your photo is 400×700, so the frame is set to 400 × 700. Increase the
          displayed width to make the photo bigger.
        </p>
      </Section>

      {/* Chat links */}
      <Section title="Chat / GPT links">
        <TextField
          label="Default chat link (used by buttons without their own link)"
          value={settings.customGptUrl}
          onChange={(v) => update("customGptUrl", v)}
          placeholder="https://chatgpt.com/g/…"
        />
        <TextField
          label="Chat button label"
          value={settings.chatButtonLabel}
          onChange={(v) => update("chatButtonLabel", v)}
        />
      </Section>

      {/* Language buttons */}
      <Section
        title="Language buttons"
        action={
          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-2 text-sm font-semibold text-forest-950 transition-colors hover:bg-accent-400"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add language
          </button>
        }
      >
        {settings.languageOptions.length === 0 && (
          <p className="text-sm text-forest-100/60">
            No buttons yet — add one with the button above.
          </p>
        )}

        <div className="space-y-5">
          {settings.languageOptions.map((option, index) => (
            <div
              key={option.id}
              className="rounded-xl border border-white/10 bg-forest-950/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-forest-100/50">
                  Button {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <IconBtn
                    label="Move up"
                    disabled={index === 0}
                    onClick={() => moveOption(option.id, -1)}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </IconBtn>
                  <IconBtn
                    label="Move down"
                    disabled={index === settings.languageOptions.length - 1}
                    onClick={() => moveOption(option.id, 1)}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </IconBtn>
                  <IconBtn label="Delete" danger onClick={() => removeOption(option.id)}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </IconBtn>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Button text"
                  value={option.label}
                  onChange={(v) => updateOption(option.id, { label: v })}
                />
                <TextField
                  label="Language code (e.g. en, de)"
                  value={option.locale}
                  onChange={(v) => updateOption(option.id, { locale: v })}
                />
              </div>

              <div className="mt-3 space-y-2">
                <TextField
                  label="Video (uploaded file, direct .mp4, or YouTube/Vimeo link)"
                  value={option.video}
                  onChange={(v) => updateOption(option.id, { video: v })}
                  placeholder="https://…"
                />
                <UploadButton
                  kind="video"
                  label="Upload video"
                  onUploaded={(url) => updateOption(option.id, { video: url })}
                />
              </div>

              <div className="mt-3">
                <TextField
                  label="Chat link for THIS button (optional — uses default if empty)"
                  value={option.chatUrl ?? ""}
                  onChange={(v) => updateOption(option.id, { chatUrl: v })}
                  placeholder="Leave empty to use the default chat link"
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-forest-900/95 px-4 py-3 backdrop-blur">
        <p
          className={`text-sm ${
            saveState === "error"
              ? "text-red-300"
              : saveState === "saved"
                ? "text-emerald-300"
                : "text-forest-100/60"
          }`}
        >
          {saveState === "saved" && (
            <CheckCircle2 className="mr-1 inline h-4 w-4 align-text-bottom" aria-hidden />
          )}
          {message || "Don't forget to save your changes."}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-forest-950 transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden />
          {saveState === "saving" ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-semibold text-white">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-white/10 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "bg-red-500/10 text-red-300 hover:bg-red-500/20"
          : "bg-white/5 text-forest-100 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
