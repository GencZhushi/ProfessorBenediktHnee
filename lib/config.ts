/**
 * DEPRECATED — the page is now driven by live settings stored in Supabase.
 *
 * Editing happens in the Admin panel (top-left "Admin" button on the page,
 * or visit /admin). The default values now live in `lib/settings.ts`.
 *
 * This file is kept only as a thin alias so older imports keep compiling.
 */
export { defaultSettings as siteConfig } from "@/lib/settings";
export type { SiteSettings, LanguageOption } from "@/lib/settings";
