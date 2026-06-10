"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ExternalLink, Play, X } from "lucide-react";
import { type SiteSettings } from "@/lib/settings";
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
  // When a button has multiple links we first show a single "toggle" button
  // that expands to reveal all of them.
  const [linksExpanded, setLinksExpanded] = useState(false);

  // Portal guard — document is only available on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Reset the expand state whenever the active modal changes.
  useEffect(() => {
    setLinksExpanded(false);
  }, [activeIndex]);

  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    if (active === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Close the links popup first if it's open, otherwise the video modal.
      setLinksExpanded((open) => {
        if (open) return false;
        setActiveIndex(null);
        return open;
      });
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

  // Only links that actually have a URL are shown.
  const activeLinks = active
    ? active.links.filter((l) => l.url.trim().length > 0)
    : [];

  // Shared styling for every link button (footer + secondary popup).
  const linkButtonClass =
    "inline-flex w-full min-w-0 max-w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 px-5 py-3 text-base font-semibold text-forest-950 shadow-lg shadow-black/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-accent-300 hover:to-accent-500 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-200 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900 active:translate-y-0 sm:px-6";

  const modal =
    active && video ? (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={active.label}
        onClick={() => setActiveIndex(null)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.98] px-4 pt-4 pb-24 backdrop-blur-md animate-fade-in sm:pb-28"
      >
        <div
          onClick={(event) => event.stopPropagation()}
          className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-forest-950 shadow-2xl ring-1 ring-accent-300/25 animate-scale-in"
        >
          <button
            type="button"
            autoFocus
            onClick={() => setActiveIndex(null)}
            aria-label="Close video"
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          {/* Video area: a fixed black stage so the whole clip is always
              visible, leaving room for the chat button below. */}
          <div className="flex items-center justify-center bg-black">
            {/* `key` forces a fresh element (and autoplay) when switching videos. */}
            {video.src ? (
              video.type === "iframe" ? (
                <iframe
                  key={video.src}
                  className="aspect-video w-full"
                  src={video.src}
                  title={active.label}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={video.src}
                  className="max-h-[60vh] w-full object-contain"
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
              <div className="flex aspect-video w-full items-center justify-center text-sm text-forest-100/70">
                No video added yet.
              </div>
            )}
          </div>

          {/* Footer: title + this button's own link buttons. */}
          <div className="flex shrink-0 flex-col items-center gap-3 border-t border-white/10 bg-forest-900 px-4 py-3 sm:flex-row sm:justify-between sm:px-5">
            <p className="truncate text-center text-sm font-medium text-forest-100 sm:text-left sm:text-base">
              {active.label}
            </p>
            {(() => {
              if (activeLinks.length === 0) return null;

              // Multiple links: a single button that opens a dedicated popup.
              if (activeLinks.length > 1) {
                return (
                  <button
                    type="button"
                    onClick={() => setLinksExpanded(true)}
                    className={`${linkButtonClass} sm:w-auto`}
                  >
                    <span className="truncate">Open Links</span>
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                  </button>
                );
              }

              // A single link: show it directly.
              return (
                <a
                  href={activeLinks[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkButtonClass}
                >
                  <span className="truncate">{activeLinks[0].label || "Open"}</span>
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              );
            })()}
          </div>
        </div>

        {/* Secondary popup: a clean grid of all this button's links. */}
        {linksExpanded && activeLinks.length > 1 ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${active.label} links`}
            onClick={(event) => {
              event.stopPropagation();
              setLinksExpanded(false);
            }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm animate-fade-in"
          >
            <div
              onClick={(event) => event.stopPropagation()}
              className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-forest-950 p-5 shadow-2xl ring-1 ring-accent-300/25 animate-scale-in sm:p-6"
            >
              <button
                type="button"
                autoFocus
                onClick={() => setLinksExpanded(false)}
                aria-label="Close links"
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>

              <p className="mb-4 truncate pr-10 text-center text-base font-semibold text-forest-100 sm:text-left">
                {active.label}
              </p>

              <div className="grid grid-cols-1 gap-3 overflow-y-auto overscroll-contain pr-0.5 sm:grid-cols-2">
                {activeLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkButtonClass}
                  >
                    <span className="truncate">{link.label || "Open"}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    ) : null;

  const shapeRadius =
    settings.buttonShape === "circle"
      ? "9999px"
      : settings.buttonShape === "rounded"
        ? "1.5rem"
        : "0px";

  return (
    <>
      {/* Language buttons — styled from the admin settings. */}
      <div className="flex flex-wrap justify-center gap-5 sm:gap-7">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Watch the ${option.label} video`}
            style={{
              width: `${settings.buttonSize}px`,
              borderRadius: shapeRadius,
              backgroundImage: `linear-gradient(to bottom right, ${settings.buttonColorFrom}, ${settings.buttonColorTo})`,
              color: settings.buttonTextColor,
            }}
            className="group flex aspect-square max-w-full flex-col items-center justify-center gap-1.5 p-3 text-center text-[13px] font-semibold leading-snug shadow-lg shadow-black/25 ring-1 ring-white/15 transition-all duration-200 hover:-translate-y-1 hover:brightness-110 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-800 sm:text-sm"
          >
            <Play
              className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110"
              style={{ fill: settings.buttonTextColor, color: settings.buttonTextColor }}
              aria-hidden
            />
            <span className="line-clamp-4 px-1">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Portal the modal to document.body so it escapes every ancestor
          stacking context (z-index, transform, etc.) and truly covers everything. */}
      {mounted && modal
        ? createPortal(modal, document.body)
        : modal}
    </>
  );
}
