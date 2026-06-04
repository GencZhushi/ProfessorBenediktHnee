import { createSupabaseClient } from "@/lib/supabase";

/** A single language option: one gold button + its video + (optional) chat link. */
export type LanguageOption = {
  /** Stable id (used as React key and for editing). */
  id: string;
  /** Text shown inside the gold circle. */
  label: string;
  /** Short locale code, e.g. "en", "de". */
  locale: string;
  /** Video URL — an uploaded file, a direct .mp4 link, or a YouTube/Vimeo link. */
  video: string;
  /**
   * Optional chat/GPT link for THIS button only. When empty, the global
   * `customGptUrl` is used instead.
   */
  chatUrl?: string;
};

/** Everything on the page that the admin can edit. */
export type SiteSettings = {
  professorName: string;
  assistantName: string;
  headingPrefix: string;
  universityName: string;

  /** Professor portrait — a URL (uploaded file or a path under /public). */
  professorPhoto: string;
  /** Displayed photo width in pixels. */
  photoWidth: number;
  /** Aspect ratio of the photo frame (width : height). The photo is 400×700. */
  photoAspectW: number;
  photoAspectH: number;

  /** Default chat link used by any button that has no own `chatUrl`. */
  customGptUrl: string;
  /** Label for the button under each video. */
  chatButtonLabel: string;

  /** The language buttons. */
  languageOptions: LanguageOption[];
};

/** Sensible defaults — shown until the admin saves their own settings. */
export const defaultSettings: SiteSettings = {
  professorName: "Prof. Dr. phil. Hans-Peter Benedikt",
  assistantName: "Nicol AI",
  headingPrefix: "Chat with Professor Benedikt's digital assistant,",
  universityName: "Hochschule für nachhaltige Entwicklung Eberswalde",
  professorPhoto: "/professor.jpg",
  photoWidth: 288,
  photoAspectW: 400,
  photoAspectH: 700,
  customGptUrl:
    "https://chatgpt.com/g/g-6a1ff5c3b1cc8191913be4029eeae81a-nicol-ai",
  chatButtonLabel: "Open Chat",
  languageOptions: [
    { id: "en", label: "Just give it a try", locale: "en", video: "/videos/intro-en.mp4" },
    { id: "es", label: "Solo inténtalo", locale: "es", video: "/videos/intro-es.mp4" },
    { id: "vi", label: "Cử thử xem sao", locale: "vi", video: "/videos/intro-vi.mp4" },
    { id: "de", label: "Probier es einfach mal aus", locale: "de", video: "/videos/intro-de.mp4" },
  ],
};

/** Generate a reasonably unique id for a new language button. */
export function newId(): string {
  return `opt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Merge a (possibly partial) config object from the database over the
 * defaults, so any missing field falls back gracefully.
 */
export function mergeSettings(raw: unknown): SiteSettings {
  const partial = (raw ?? {}) as Partial<SiteSettings>;

  const options = Array.isArray(partial.languageOptions)
    ? partial.languageOptions
    : defaultSettings.languageOptions;

  return {
    ...defaultSettings,
    ...partial,
    languageOptions: options.map((opt, index) => ({
      id: opt?.id || `opt-${index}`,
      label: opt?.label ?? "",
      locale: opt?.locale ?? "",
      video: opt?.video ?? "",
      chatUrl: opt?.chatUrl ?? "",
    })),
  };
}

/** Resolve the effective chat link for a button (own link or global fallback). */
export function chatLinkFor(option: LanguageOption, settings: SiteSettings): string {
  const own = (option.chatUrl ?? "").trim();
  return own.length > 0 ? own : settings.customGptUrl;
}

/**
 * Read the live settings from Supabase. Falls back to defaults on any error
 * (e.g. before the admin has ever saved, or if the network is unavailable).
 */
export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("config")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data?.config) return defaultSettings;
    return mergeSettings(data.config);
  } catch {
    return defaultSettings;
  }
}
