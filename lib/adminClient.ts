"use client";

import { getBrowserSupabase, MEDIA_BUCKET } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/settings";

/** Verify the admin password against the database. */
export async function checkPassword(password: string): Promise<boolean> {
  const supabase = getBrowserSupabase();
  const { data, error } = await supabase.rpc("admin_check_password", {
    p_password: password,
  });
  if (error) throw new Error(error.message);
  return data === true;
}

/**
 * Save the full settings object. The database function re-checks the password
 * and rejects the write if it's wrong.
 */
export async function saveConfig(
  password: string,
  config: SiteSettings,
): Promise<void> {
  const supabase = getBrowserSupabase();
  const { error } = await supabase.rpc("admin_save_config", {
    p_password: password,
    p_config: config,
  });
  if (error) {
    if (error.code === "28000" || /invalid_password/i.test(error.message)) {
      throw new Error("Wrong password — please sign in again.");
    }
    throw new Error(error.message);
  }
}

/**
 * Upload an image or video directly to Supabase Storage (bypasses any
 * serverless body-size limits) and return its public URL.
 */
export async function uploadMedia(
  file: File,
  kind: "image" | "video",
): Promise<string> {
  const supabase = getBrowserSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const folder = kind === "video" ? "videos" : "images";
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    if (/exceeded the maximum allowed size|payload too large/i.test(error.message)) {
      throw new Error(
        "That file is too large (max 50 MB). Compress the video or paste a YouTube/direct link instead.",
      );
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Extract the storage path (inside the media bucket) from a public URL.
 * Returns null when the URL is not a file stored in our bucket (e.g. a pasted
 * external link or a path under /public), so nothing is deleted in that case.
 */
export function storagePathFromUrl(url: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/**
 * Permanently delete an uploaded file from Supabase Storage. The deletion is
 * password-protected by a database function. URLs that don't point to our
 * bucket (external links, /public paths) are ignored so they can be cleared
 * from the settings without error.
 */
export async function deleteMedia(url: string, password: string): Promise<void> {
  const path = storagePathFromUrl(url);
  if (!path) return;

  // Supabase no longer permits deleting directly from `storage.objects` in SQL,
  // so we go through an edge function that checks the password and then removes
  // the file via the Storage API using the service-role key.
  const supabase = getBrowserSupabase();
  const { data, error } = await supabase.functions.invoke<{
    ok: boolean;
    error?: string;
  }>("delete-media", { body: { password, path } });

  if (error) throw new Error(error.message);
  if (data && data.ok === false) {
    if (data.error === "invalid_password") {
      throw new Error("Wrong password — please sign in again.");
    }
    throw new Error(data.error || "Could not delete the file.");
  }
}
