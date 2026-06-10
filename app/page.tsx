import Link from "next/link";
import { GraduationCap, Settings } from "lucide-react";
import { fetchSettings } from "@/lib/settings";
import LanguageButtons from "@/components/LanguageButtons";

// Always render fresh so changes made in the admin panel show up immediately.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const settings = await fetchSettings();
  const year = new Date().getFullYear();

  return (
    <main
      className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pb-12 pt-20 sm:pt-24"
      style={{
        backgroundImage: `linear-gradient(to bottom, ${settings.backgroundColorTop}, ${settings.backgroundColorBottom})`,
      }}
    >
      {/* Optional background image, faded over the gradient. */}
      {settings.backgroundImage && (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${settings.backgroundImage})`,
            opacity: settings.backgroundImageOpacity / 100,
          }}
          aria-hidden
        />
      )}

      {/* Layered ambient glows for depth. */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-forest-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[-10%] top-1/3 h-72 w-72 rounded-full bg-accent-600/10 blur-3xl"
        aria-hidden
      />

      {/* Discreet admin entry, top-left. */}
      <Link
        href="/admin"
        className="absolute left-4 top-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-xs font-medium text-forest-100/80 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-white"
      >
        <Settings className="h-3.5 w-3.5" aria-hidden />
        Admin
      </Link>

      {/* Optional top symbol / logo. */}
      {settings.logoImage && (
        <div className="relative z-10 mb-6 flex animate-fade-in-up justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.logoImage}
            alt="Site logo"
            style={{ width: `${settings.logoWidth}px` }}
            className="h-auto"
          />
        </div>
      )}

      {/* University title banner. */}
      {settings.showCampus && (settings.campusLabel || settings.universityName) && (
        <header className="relative z-10 mb-10 flex w-full max-w-3xl animate-fade-in-up flex-col items-center text-center">
          {settings.campusLabel && (
            <span
              className="inline-flex items-center gap-2 rounded-full bg-accent-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ring-1 ring-accent-300/25"
              style={{ color: settings.campusTextColor }}
            >
              <GraduationCap className="h-3.5 w-3.5" aria-hidden />
              {settings.campusLabel}
            </span>
          )}
          {settings.universityName && (
            <h2 className="mt-4 max-w-2xl text-balance font-serif text-xl font-semibold leading-snug text-white sm:text-2xl lg:text-3xl">
              {settings.universityName}
            </h2>
          )}
          <div className="mt-5 flex items-center gap-3" aria-hidden>
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-accent-400/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-accent-400/70" />
          </div>
        </header>
      )}

      <section className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        {/* Professor photo — frame matches the photo's own aspect ratio. */}
        <div className="animate-fade-in-up [animation-delay:120ms]">
          <div
            className="group relative w-full max-w-full overflow-hidden rounded-[1.75rem] bg-forest-950/40 shadow-2xl shadow-black/40 ring-1 ring-white/15 transition-transform duration-500 hover:scale-[1.015]"
            style={{
              width: `${settings.photoWidth}px`,
              aspectRatio: `${settings.photoAspectW} / ${settings.photoAspectH}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.professorPhoto}
              alt={settings.professorName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Bottom gradient + name plate. */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pt-16"
              aria-hidden
            />
            {settings.professorName && (
              <p className="absolute inset-x-0 bottom-0 px-4 pb-4 text-center text-sm font-semibold tracking-wide text-white drop-shadow sm:text-base">
                {settings.professorName}
              </p>
            )}
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-8 max-w-md animate-fade-in-up text-balance [animation-delay:200ms]">
          <span className="block text-base font-medium text-forest-50 sm:text-lg">
            {settings.headingPrefix}
          </span>
          <span className="mt-2 block bg-gradient-to-br from-white via-accent-50 to-accent-200 bg-clip-text font-serif text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {settings.assistantName}
          </span>
        </h1>

        {/* Language buttons + video modal */}
        <div className="mt-10 w-full animate-fade-in-up [animation-delay:280ms]">
          <LanguageButtons settings={settings} />
        </div>
      </section>

      {(settings.professorName || settings.universityName) && (
        <footer className="relative z-10 mt-auto pt-14 text-center text-xs text-forest-100/70">
          <p>
            &copy; {year} {settings.professorName}
            {settings.universityName ? ` - ${settings.universityName}` : ""}
          </p>
        </footer>
      )}
    </main>
  );
}
