import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/lib/settings";
import AsciiBackground from "@/components/AsciiBackground";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NaturalReps — AI workout logger",
  description:
    "Log your workouts in plain English or by voice. AI turns it into clean, structured training data.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "NaturalReps" },
};

export const viewport = {
  themeColor: "#05070a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-black">
        {/* iPhone-format app frame */}
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5">
          <AsciiBackground />
          {/* subtle darkening for text legibility over the background */}
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/35" />
          <div className="relative z-10 flex min-h-dvh flex-1 flex-col">
            <SettingsProvider>{children}</SettingsProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
