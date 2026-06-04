import Link from "next/link";
import { Settings } from "lucide-react";
import { fetchSettings } from "@/lib/settings";
import LanguageButtons from "@/components/LanguageButtons";

// Always render fresh so changes made in the admin panel show up immediately.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const settings = await fetchSettings();
  const year = new Date().getFullYear();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-forest-800 to-forest-900 px-4 py-12 sm:py-16">
      {/* Soft accent glow behind the content. */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-400/10 blur-3xl"
        aria-hidden
      />

      {/* Discreet admin entry, top-left. */}
      <Link
        href="/admin"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-xs font-medium text-forest-100/80 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-white"
      >
        <Settings className="h-3.5 w-3.5" aria-hidden />
        Admin
      </Link>

      <section className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        {/* Professor photo — frame matches the photo's own aspect ratio. */}
        <div
          className="relative w-full max-w-full overflow-hidden rounded-2xl bg-forest-950/40 shadow-2xl ring-1 ring-white/15"
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
        </div>

        {/* Heading */}
        <h1 className="mt-7 max-w-md text-balance">
          <span className="block text-base font-medium text-forest-50 sm:text-lg">
            {settings.headingPrefix}
          </span>
          <span className="mt-1.5 block font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {settings.assistantName}
          </span>
        </h1>

        {/* Language buttons + video modal */}
        <div className="mt-10 w-full">
          <LanguageButtons settings={settings} />
        </div>
      </section>

      {(settings.professorName || settings.universityName) && (
        <footer className="relative z-10 mt-14 text-center text-xs text-forest-100/70">
          <p>
            &copy; {year} {settings.professorName}
            {settings.universityName ? ` - ${settings.universityName}` : ""}
          </p>
        </footer>
      )}
    </main>
  );
}
