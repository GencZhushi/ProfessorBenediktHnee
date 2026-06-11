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
  type ButtonLink,
  type LanguageOption,
  type SiteSettings,
  newId,
} from "@/lib/settings";
import { deleteMedia, saveConfig } from "@/lib/adminClient";
import {
  ColorField,
  DeleteMediaButton,
  NumberField,
  RangeField,
  SelectField,
  TextArea,
  TextField,
  ToggleField,
  UploadButton,
} from "@/components/admin/fields";

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
        {
          id: newId(),
          label: "New language",
          locale: "",
          video: "",
          image: "",
          links: [{ id: newId(), label: "Open Chat", url: "" }],
        },
      ],
    }));
    setSaveState("idle");
  }

  // ---- Per-button links ------------------------------------------------

  function addLink(optionId: string) {
    setSettings((s) => ({
      ...s,
      languageOptions: s.languageOptions.map((o) =>
        o.id === optionId
          ? { ...o, links: [...o.links, { id: newId(), label: "", url: "" }] }
          : o,
      ),
    }));
    setSaveState("idle");
  }

  function updateLink(optionId: string, linkId: string, patch: Partial<ButtonLink>) {
    setSettings((s) => ({
      ...s,
      languageOptions: s.languageOptions.map((o) =>
        o.id === optionId
          ? {
              ...o,
              links: o.links.map((l) => (l.id === linkId ? { ...l, ...patch } : l)),
            }
          : o,
      ),
    }));
    setSaveState("idle");
  }

  function removeLink(optionId: string, linkId: string) {
    setSettings((s) => ({
      ...s,
      languageOptions: s.languageOptions.map((o) =>
        o.id === optionId
          ? { ...o, links: o.links.filter((l) => l.id !== linkId) }
          : o,
      ),
    }));
    setSaveState("idle");
  }

  async function removeOption(id: string) {
    const option = settings.languageOptions.find((o) => o.id === id);
    setSettings((s) => ({
      ...s,
      languageOptions: s.languageOptions.filter((o) => o.id !== id),
    }));
    setSaveState("idle");
    // Best-effort: also remove this button's uploaded video/photo from storage.
    for (const url of [option?.video, option?.image]) {
      if (!url) continue;
      try {
        await deleteMedia(url, password);
      } catch {
        /* ignore — the option is already removed from the config */
      }
    }
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
            <div className="flex flex-wrap items-center gap-2">
              <UploadButton
                kind="image"
                label="Upload new photo"
                onUploaded={(url) => update("professorPhoto", url)}
              />
              <DeleteMediaButton
                url={settings.professorPhoto}
                password={password}
                label="Delete photo"
                onDeleted={() => update("professorPhoto", "")}
              />
            </div>
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
                <div className="flex flex-wrap items-center gap-2">
                  <UploadButton
                    kind="video"
                    label="Upload video"
                    onUploaded={(url) => updateOption(option.id, { video: url })}
                  />
                  <DeleteMediaButton
                    url={option.video}
                    password={password}
                    label="Delete video"
                    onDeleted={() => updateOption(option.id, { video: "" })}
                  />
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <TextField
                  label="Photo (uploaded file or direct image link) — shown instead of the video when set"
                  value={option.image}
                  onChange={(v) => updateOption(option.id, { image: v })}
                  placeholder="https://…"
                />
                {option.image.trim() && (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={option.image}
                      alt="Photo preview"
                      className="h-16 w-24 rounded-lg object-cover ring-1 ring-white/10"
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <UploadButton
                    kind="image"
                    label="Upload photo"
                    onUploaded={(url) => updateOption(option.id, { image: url })}
                  />
                  <DeleteMediaButton
                    url={option.image}
                    password={password}
                    label="Delete photo"
                    onDeleted={() => updateOption(option.id, { image: "" })}
                  />
                </div>
                <p className="text-xs text-forest-100/50">
                  When a photo is set, the popup shows the photo instead of the video.
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-white/10 bg-forest-950/40 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-forest-100/50">
                    Buttons in the video popup
                  </span>
                  <button
                    type="button"
                    onClick={() => addLink(option.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500 px-2.5 py-1.5 text-xs font-semibold text-forest-950 transition-colors hover:bg-accent-400"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden /> Add button
                  </button>
                </div>

                {option.links.length === 0 ? (
                  <p className="text-xs text-forest-100/60">
                    No buttons yet — add one to show a link under this video.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {option.links.map((link, linkIndex) => (
                      <div
                        key={link.id}
                        className="flex flex-col gap-2 rounded-lg bg-white/5 p-3 sm:flex-row sm:items-end"
                      >
                        <div className="flex-1">
                          <TextField
                            label={`Button ${linkIndex + 1} name`}
                            value={link.label}
                            onChange={(v) =>
                              updateLink(option.id, link.id, { label: v })
                            }
                            placeholder="e.g. Open Chat"
                          />
                        </div>
                        <div className="flex-1">
                          <TextField
                            label="Link this button opens"
                            value={link.url}
                            onChange={(v) =>
                              updateLink(option.id, link.id, { url: v })
                            }
                            placeholder="https://…"
                          />
                        </div>
                        <IconBtn
                          label="Delete button"
                          danger
                          onClick={() => removeLink(option.id, link.id)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </IconBtn>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs text-forest-100/50">
                  With one button it shows directly. With several, the popup first
                  shows a single “Open Links” button that expands to reveal them all.
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Button styling */}
      <Section title="Language button style">
        <SelectField
          label="Button shape"
          value={settings.buttonShape}
          onChange={(v) => update("buttonShape", v)}
          options={[
            { value: "circle", label: "Circle" },
            { value: "rounded", label: "Rounded square" },
            { value: "square", label: "Square" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorField
            label="Color (top)"
            value={settings.buttonColorFrom}
            onChange={(v) => update("buttonColorFrom", v)}
          />
          <ColorField
            label="Color (bottom)"
            value={settings.buttonColorTo}
            onChange={(v) => update("buttonColorTo", v)}
          />
          <ColorField
            label="Text / icon color"
            value={settings.buttonTextColor}
            onChange={(v) => update("buttonTextColor", v)}
          />
        </div>
        <RangeField
          label="Button size"
          value={settings.buttonSize}
          onChange={(v) => update("buttonSize", v)}
          min={80}
          max={240}
          suffix="px"
        />
      </Section>

      {/* Background */}
      <Section title="Background">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ColorField
            label="Background color (top)"
            value={settings.backgroundColorTop}
            onChange={(v) => update("backgroundColorTop", v)}
          />
          <ColorField
            label="Background color (bottom)"
            value={settings.backgroundColorBottom}
            onChange={(v) => update("backgroundColorBottom", v)}
          />
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-forest-950/40 p-4">
          <p className="text-sm font-medium text-forest-100">
            Background image (optional)
          </p>
          {settings.backgroundImage && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.backgroundImage}
                alt="Background preview"
                className="h-16 w-24 rounded-lg object-cover ring-1 ring-white/10"
                style={{ opacity: settings.backgroundImageOpacity / 100 }}
              />
              <DeleteMediaButton
                url={settings.backgroundImage}
                password={password}
                label="Remove"
                onDeleted={() => update("backgroundImage", "")}
              />
            </div>
          )}
          <UploadButton
            kind="image"
            label="Upload background image"
            onUploaded={(url) => update("backgroundImage", url)}
          />
          <TextField
            label="…or paste an image URL"
            value={settings.backgroundImage}
            onChange={(v) => update("backgroundImage", v)}
            placeholder="https://… (leave empty for color only)"
          />
          <RangeField
            label="Image fade / opacity"
            value={settings.backgroundImageOpacity}
            onChange={(v) => update("backgroundImageOpacity", v)}
            min={0}
            max={100}
            suffix="%"
          />
          <p className="text-xs text-forest-100/50">
            Lower the opacity to fade the picture into the background colors.
          </p>
        </div>
      </Section>

      {/* Top symbol / logo */}
      <Section title="Top symbol / logo">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {settings.logoImage && (
            <div className="shrink-0 rounded-xl bg-forest-950/60 p-3 ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.logoImage}
                alt="Logo preview"
                style={{ width: settings.logoWidth }}
                className="h-auto"
              />
            </div>
          )}
          <div className="flex-1 space-y-3">
            <UploadButton
              kind="image"
              label="Upload symbol / logo"
              onUploaded={(url) => update("logoImage", url)}
            />
            <TextField
              label="…or paste an image URL"
              value={settings.logoImage}
              onChange={(v) => update("logoImage", v)}
              placeholder="https://… (leave empty to hide)"
            />
            <RangeField
              label="Logo width"
              value={settings.logoWidth}
              onChange={(v) => update("logoWidth", v)}
              min={32}
              max={320}
              suffix="px"
            />
            {settings.logoImage && (
              <DeleteMediaButton
                url={settings.logoImage}
                password={password}
                label="Remove logo"
                onDeleted={() => update("logoImage", "")}
              />
            )}
          </div>
        </div>
      </Section>

      {/* Information Campus banner */}
      <Section title="Information Campus banner">
        <ToggleField
          label="Show the Information Campus banner"
          value={settings.showCampus}
          onChange={(v) => update("showCampus", v)}
        />
        <TextField
          label="Badge label"
          value={settings.campusLabel}
          onChange={(v) => update("campusLabel", v)}
          placeholder="Information Campus"
        />
        <ColorField
          label="Badge text / accent color"
          value={settings.campusTextColor}
          onChange={(v) => update("campusTextColor", v)}
        />
        <p className="text-xs text-forest-100/50">
          The university line below the badge is edited in “Page text”. Clear it
          there to hide it.
        </p>
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
