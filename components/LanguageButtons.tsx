"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";
import { chatLinkFor, type SiteSettings } from "@/lib/settings";
import { resolveVideo } from "@/lib/video";

/**
 * The gold "language" buttons.
 *
 * Clicking a button opens a video modal showing that button's own video,
 * with an "Open Chat" button underneath that opens the chat in a new tab.
 * Each button can have its own chat link; otherwise the global one is used.
 */
export default function LanguageButtons({ settings }: { settings: SiteSettings }) {
  const options = settings.languageOptions;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? options[activeIndex] : null;

  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    if (active === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  if (options.length === 0) return null;

  const video = active ? resolveVideo(active.video) : null;

  return (
    <>
      {/* Gold circle buttons — identical style, one per language. */}
      <div className="flex flex-wrap justify-center gap-5 sm:gap-7">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Watch the ${option.label} video`}
            className="group flex aspect-square w-32 max-w-full flex-col items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-accent-400 to-accent-700 p-3 text-center text-[13px] font-semibold leading-snug text-amber-50 shadow-lg shadow-black/25 ring-1 ring-accent-300/30 transition-all duration-200 hover:-translate-y-1 hover:from-accent-300 hover:to-accent-600 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-200 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-800 sm:w-36 sm:text-sm lg:w-40"
          >
            <Play
              className="h-4 w-4 shrink-0 fill-amber-50 text-amber-50 transition-transform group-hover:scale-110"
              aria-hidden
            />
            <span className="line-clamp-4 px-1">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Video modal. */}
      {active && video && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.label}
          onClick={() => setActiveIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-forest-900 shadow-2xl ring-1 ring-white/10 animate-scale-in"
          >
            <button
              type="button"
              autoFocus
              onClick={() => setActiveIndex(null)}
              aria-label="Close video"
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            {/* `key` forces a fresh element (and autoplay) when switching videos. */}
            {video.src ? (
              video.type === "iframe" ? (
                <iframe
                  key={video.src}
                  className="aspect-video w-full bg-black"
                  src={video.src}
                  title={active.label}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={video.src}
                  className="aspect-video w-full bg-black"
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                >
                  <source src={video.src} />
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-black text-sm text-forest-100/70">
                No video added yet.
              </div>
            )}

            <div className="flex flex-col items-center gap-3 p-5 sm:flex-row sm:justify-between">
              <p className="text-sm font-medium text-forest-100">{active.label}</p>
              <a
                href={chatLinkFor(active, settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-semibold text-forest-950 shadow-md transition-colors hover:bg-accent-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900 sm:w-auto"
              >
                {settings.chatButtonLabel}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
