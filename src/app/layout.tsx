import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import StarField from "@/components/StarField";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Odin's Eye — Natal Chart Reading",
  description:
    "A deeply personal natal chart reading powered by AI. See yourself clearly.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0D1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="bg-celestial antialiased">
        {/* Fixed background layers — rendered before content so they sit
            at the root stacking context and work reliably on iOS Safari. */}
        <div className="celestial-gradient" aria-hidden="true" />
        <StarField />
        <div className="site-content">{children}</div>
      </body>
    </html>
  );
}
