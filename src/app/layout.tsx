import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import {
  IBM_Plex_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { LANG_COOKIE, LangProvider, type Lang } from "@/lib/i18n";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://futuremotion.lab";
const siteTitle = "Future Motion Lab · 未来接口动态实验室";
const siteDescription =
  "A generative motion studio for fashion, sport, tech, and lifestyle brands. AI-driven motion, brand systems, and experimental work.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s · Future Motion Lab",
  },
  description: siteDescription,
  applicationName: "Future Motion Lab",
  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/",
      "en-US": "/",
    },
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Future Motion Lab",
    title: siteTitle,
    description: siteDescription,
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const saved = cookieStore.get(LANG_COOKIE)?.value;
  const lang: Lang = saved === "en" ? "en" : "zh";
  const htmlLang = lang === "en" ? "en" : "zh-CN";

  return (
    <html lang={htmlLang} data-lang={lang}>
      <body className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
        <LangProvider value={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
