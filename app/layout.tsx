import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quilldrop | Středověká sběratelská hra z rukopisných kolofonů",
  description: "Sběratelská hra s autentickými středověkými kolofony, iluminacemi a hlasy písařů ze starých kodexů.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Quilldrop",
  },
  other: {
    "codex-preview": "development",
    "theme-color": "#edd8b1",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/quilldrop-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}
