import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { fetchSettings } from "@/lib/settings";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettings();
  return {
    title: `Chat with ${settings.assistantName}`,
    description: `Meet ${settings.assistantName}, ${settings.professorName}'s digital assistant. Choose your language, watch a short introduction, and open the chat.`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-forest-800 font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
