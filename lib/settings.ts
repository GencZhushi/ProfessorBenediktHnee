import { createSupabaseClient } from "@/lib/supabase";

/** A single named link shown as a button under a language option's video. */
export type ButtonLink = {
  /** Stable id (used as React key and for editing). */
  id: string;
  /** Text shown on the link button (e.g. "Open Chat"). */
  label: string;
  /** Destination URL opened when the button is clicked. */
  url: string;
};

/** A single language option: one gold button + its video + its own link buttons. */
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
   * The link buttons shown under this option's video. Each has its own label
   * and URL. When there is more than one, the popup shows a single button that
   * expands to reveal all of them.
   */
  links: ButtonLink[];
};

/** Shape options for the language buttons. */
export type ButtonShape = "circle" | "rounded" | "square";

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

  /** The language buttons. */
  languageOptions: LanguageOption[];

  /* ---- Background ---------------------------------------------------- */
  /** Top color of the page background gradient (hex). */
  backgroundColorTop: string;
  /** Bottom color of the page background gradient (hex). */
  backgroundColorBottom: string;
  /** Optional background image URL (uploaded or pasted). Empty = none. */
  backgroundImage: string;
  /** Background image opacity / fade, 0–100. */
  backgroundImageOpacity: number;

  /* ---- Top symbol / logo --------------------------------------------- */
  /** Optional logo/symbol shown at the very top of the page. Empty = none. */
  logoImage: string;
  /** Displayed logo width in pixels. */
  logoWidth: number;

  /* ---- Information Campus banner ------------------------------------- */
  /** Show the "Information Campus" banner with the university name. */
  showCampus: boolean;
  /** The small badge label (defaults to "Information Campus"). */
  campusLabel: string;
  /** Accent/text color of the campus badge (hex). */
  campusTextColor: string;

  /* ---- Language button styling --------------------------------------- */
  /** Shape of the language buttons. */
  buttonShape: ButtonShape;
  /** Button gradient start color (hex). */
  buttonColorFrom: string;
  /** Button gradient end color (hex). */
  buttonColorTo: string;
  /** Button text/icon color (hex). */
  buttonTextColor: string;
  /** Button size in pixels (width & height). */
  buttonSize: number;
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
  languageOptions: [
    {
      id: "en",
      label: "Just give it a try",
      locale: "en",
      video: "/videos/intro-en.mp4",
      links: [
        {
          id: "en-chat",
          label: "Open Chat",
          url: "https://chatgpt.com/g/g-6a1ff5c3b1cc8191913be4029eeae81a-nicol-ai",
        },
      ],
    },
    {
      id: "es",
      label: "Solo inténtalo",
      locale: "es",
      video: "/videos/intro-es.mp4",
      links: [
        {
          id: "es-chat",
          label: "Open Chat",
          url: "https://chatgpt.com/g/g-6a1ff5c3b1cc8191913be4029eeae81a-nicol-ai",
        },
      ],
    },
    {
      id: "vi",
      label: "Cử thử xem sao",
      locale: "vi",
      video: "/videos/intro-vi.mp4",
      links: [
        {
          id: "vi-chat",
          label: "Open Chat",
          url: "https://chatgpt.com/g/g-6a1ff5c3b1cc8191913be4029eeae81a-nicol-ai",
        },
      ],
    },
    {
      id: "de",
      label: "Probier es einfach mal aus",
      locale: "de",
      video: "/videos/intro-de.mp4",
      links: [
        {
          id: "de-chat",
          label: "Open Chat",
          url: "https://chatgpt.com/g/g-6a1ff5c3b1cc8191913be4029eeae81a-nicol-ai",
        },
      ],
    },
  ],

  // Background — matches the original forest gradient.
  backgroundColorTop: "#1d3a2c",
  backgroundColorBottom: "#0a160f",
  backgroundImage: "",
  backgroundImageOpacity: 100,

  // Top symbol / logo.
  logoImage: "",
  logoWidth: 96,

  // Information Campus banner.
  showCampus: true,
  campusLabel: "Information Campus",
  campusTextColor: "#c9e8d2",

  // Language button styling — matches the original gold circles.
  buttonShape: "circle",
  buttonColorFrom: "#d9a441",
  buttonColorTo: "#9c6a14",
  buttonTextColor: "#fffbeb",
  buttonSize: 144,
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

  const validShapes: ButtonShape[] = ["circle", "rounded", "square"];
  const buttonShape = validShapes.includes(partial.buttonShape as ButtonShape)
    ? (partial.buttonShape as ButtonShape)
    : defaultSettings.buttonShape;

  // Legacy fields kept only so old saved configs can be migrated below.
  const legacy = partial as {
    customGptUrl?: string;
    chatButtonLabel?: string;
  };

  return {
    ...defaultSettings,
    ...partial,
    buttonShape,
    languageOptions: options.map((opt, index) =>
      mergeOption(opt as Partial<LegacyOption>, index, legacy),
    ),
  };
}

/** An option as it may appear in older saved configs (with `chatUrl`). */
type LegacyOption = LanguageOption & { chatUrl?: string };

/** Normalise one option, migrating the old single `chatUrl` to `links`. */
function mergeOption(
  opt: Partial<LegacyOption> | undefined,
  index: number,
  legacy: { customGptUrl?: string; chatButtonLabel?: string },
): LanguageOption {
  const id = opt?.id || `opt-${index}`;

  let links: ButtonLink[];
  if (Array.isArray(opt?.links)) {
    links = opt!.links.map((link, i) => ({
      id: link?.id || `${id}-link-${i}`,
      label: link?.label ?? "",
      url: link?.url ?? "",
    }));
  } else {
    // Migrate from the old model: a single per-button chatUrl (or the old
    // global default link) becomes one link button.
    const url = (opt?.chatUrl ?? "").trim() || (legacy.customGptUrl ?? "").trim();
    links = url
      ? [{ id: `${id}-link-0`, label: legacy.chatButtonLabel || "Open Chat", url }]
      : [];
  }

  return {
    id,
    label: opt?.label ?? "",
    locale: opt?.locale ?? "",
    video: opt?.video ?? "",
    links,
  };
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
