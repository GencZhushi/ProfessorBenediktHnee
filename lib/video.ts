/**
 * Figure out how to play a given video URL.
 *
 * Supports:
 *  - YouTube  (youtube.com/watch?v=…, youtu.be/…, /shorts/…, /embed/…)
 *  - Vimeo    (vimeo.com/123456789)
 *  - Direct video files (.mp4, .webm, …) and uploaded Supabase files
 */
export type PlayableVideo =
  | { type: "iframe"; src: string }
  | { type: "file"; src: string };

function youTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/i,
    /(?:youtu\.be\/)([\w-]{11})/i,
    /(?:youtube\.com\/embed\/)([\w-]{11})/i,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return m ? m[1] : null;
}

export function resolveVideo(url: string): PlayableVideo {
  const trimmed = (url ?? "").trim();

  const yt = youTubeId(trimmed);
  if (yt) {
    return {
      type: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`,
    };
  }

  const vimeo = vimeoId(trimmed);
  if (vimeo) {
    return { type: "iframe", src: `https://player.vimeo.com/video/${vimeo}?autoplay=1` };
  }

  return { type: "file", src: trimmed };
}
