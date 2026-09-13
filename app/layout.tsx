import type { Metadata } from "next";
import { Cinzel, Nunito } from "next/font/google";
import "./globals.css";

// Cinzel — klasické serif s historickým charakterem pro nadpisy a UI
const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

// Nunito — přátelský, kulatý sans-serif pro tělo textu a UI prvky
const nunito = Nunito({
  variable: "--font-ui",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quilldrop | Středověká sběratelská hra z kolofonů FF UK",
  description:
    "Sbírejte autentické kolofony a rukopisy ze středověkých kodexů z výzkumu prof. Lucie Doležalové (Univerzita Karlova).",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={`${cinzel.variable} ${nunito.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
