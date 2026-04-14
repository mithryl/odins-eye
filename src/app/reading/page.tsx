"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";

interface PlanetPlacement {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
}

interface ReadingData {
  reading: string;
  chart: {
    placements: PlanetPlacement[];
    risingSign: string | null;
    risingDegree: number | null;
    ascendantLongitude: number | null;
    birthDateTime: string;
  };
  aspects: string[];
  location: string;
}

const SIGN_GLYPHS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "\u2609", Moon: "\u263D", Mercury: "\u263F", Venus: "\u2640",
  Mars: "\u2642", Jupiter: "\u2643", Saturn: "\u2644", Uranus: "\u2645",
  Neptune: "\u2646", Pluto: "\u2647",
  "North Node": "\u260A", "South Node": "\u260B",
  Chiron: "\u26B7", Lilith: "\u26B8",
};

const ASPECT_GLYPHS: Record<string, string> = {
  conjunction: "\u260C", sextile: "\u26B9", square: "\u25A1",
  trine: "\u25B3", opposition: "\u260D",
};

function ChartTable({ data }: { data: ReadingData }) {
  const { chart, aspects } = data;

  // Group aspects by type
  const aspectsByType: Record<string, string[]> = {};
  for (const aspect of aspects) {
    const type = aspect.match(/\b(conjunction|sextile|square|trine|opposition)\b/)?.[1] || "other";
    if (!aspectsByType[type]) aspectsByType[type] = [];
    aspectsByType[type].push(aspect);
  }

  return (
    <div className="space-y-8">
      {/* Planetary Placements */}
      <div>
        <h3 className="font-heading text-xl text-gold mb-4">
          Planetary Placements
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/30">
                <th className="text-left py-2 px-3 text-text-muted font-medium">
                  Planet
                </th>
                <th className="text-left py-2 px-3 text-text-muted font-medium">
                  Sign
                </th>
                <th className="text-right py-2 px-3 text-text-muted font-medium">
                  Degree
                </th>
              </tr>
            </thead>
            <tbody>
              {chart.risingSign && (
                <tr className="border-b border-border/50 bg-gold-muted">
                  <td className="py-2.5 px-3 text-text-primary">
                    <span className="mr-2 text-gold">AC</span> Ascendant
                  </td>
                  <td className="py-2.5 px-3 text-text-primary">
                    <span className="mr-1.5 text-gold">
                      {SIGN_GLYPHS[chart.risingSign]}
                    </span>
                    {chart.risingSign}
                  </td>
                  <td className="py-2.5 px-3 text-text-secondary text-right font-mono text-xs">
                    {chart.risingDegree != null
                      ? `${chart.risingDegree.toFixed(1)}\u00B0`
                      : "--"}
                  </td>
                </tr>
              )}
              {chart.placements.map((p) => (
                <tr key={p.planet} className="border-b border-border/50">
                  <td className="py-2.5 px-3 text-text-primary">
                    <span className="mr-2 text-gold">
                      {PLANET_GLYPHS[p.planet]}
                    </span>
                    {p.planet}
                  </td>
                  <td className="py-2.5 px-3 text-text-primary">
                    <span className="mr-1.5 text-gold">
                      {SIGN_GLYPHS[p.sign]}
                    </span>
                    {p.sign}
                  </td>
                  <td className="py-2.5 px-3 text-text-secondary text-right font-mono text-xs">
                    {p.degree.toFixed(1)}&deg;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aspects */}
      <div>
        <h3 className="font-heading text-xl text-gold mb-4">Major Aspects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {Object.entries(aspectsByType).map(([type, items]) => (
            <div key={type} className="mb-4">
              <h4 className="text-xs uppercase tracking-[0.15em] text-text-muted mb-2">
                <span className="mr-1.5 text-gold">
                  {ASPECT_GLYPHS[type] || ""}
                </span>
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </h4>
              <ul className="space-y-1">
                {items.map((aspect, i) => {
                  // Parse "Sun conjunction Moon (5°)" format
                  const match = aspect.match(
                    /^(\w+)\s+\w+\s+(\w+)\s+\((\d+)°\)$/
                  );
                  if (!match) return (
                    <li key={i} className="text-sm text-text-secondary">{aspect}</li>
                  );
                  const [, p1, p2, deg] = match;
                  return (
                    <li key={i} className="text-sm text-text-secondary">
                      <span className="text-text-primary">
                        {PLANET_GLYPHS[p1]} {p1}
                      </span>
                      <span className="text-text-muted mx-1.5">
                        {ASPECT_GLYPHS[type]}
                      </span>
                      <span className="text-text-primary">
                        {PLANET_GLYPHS[p2]} {p2}
                      </span>
                      <span className="text-text-muted ml-1.5 font-mono text-xs">
                        {deg}&deg;
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Element Balance */}
      <div>
        <h3 className="font-heading text-xl text-gold mb-4">
          Elemental Balance
        </h3>
        <ElementBalance placements={chart.placements} />
      </div>

      {/* Modality Balance */}
      <div>
        <h3 className="font-heading text-xl text-gold mb-4">
          Modality Balance
        </h3>
        <ModalityBalance placements={chart.placements} />
      </div>
    </div>
  );
}

function ElementBalance({ placements }: { placements: PlanetPlacement[] }) {
  const elements: Record<string, { count: number; planets: string[] }> = {
    Fire: { count: 0, planets: [] },
    Earth: { count: 0, planets: [] },
    Air: { count: 0, planets: [] },
    Water: { count: 0, planets: [] },
  };

  const signToElement: Record<string, string> = {
    Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
    Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
    Gemini: "Air", Libra: "Air", Aquarius: "Air",
    Cancer: "Water", Scorpio: "Water", Pisces: "Water",
  };

  for (const p of placements) {
    const el = signToElement[p.sign];
    if (el) {
      elements[el].count++;
      elements[el].planets.push(p.planet);
    }
  }

  const total = placements.length;
  const colors: Record<string, string> = {
    Fire: "rgba(239, 68, 68, 0.7)",
    Earth: "rgba(52, 211, 153, 0.7)",
    Air: "rgba(56, 189, 248, 0.7)",
    Water: "rgba(59, 130, 246, 0.7)",
  };

  return (
    <div className="space-y-3">
      {Object.entries(elements).map(([element, { count, planets }]) => (
        <div key={element}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-primary">{element}</span>
            <span className="text-text-muted text-xs">
              {planets.join(", ")}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(42, 45, 66, 0.5)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(count / total) * 100}%`, backgroundColor: colors[element] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ModalityBalance({ placements }: { placements: PlanetPlacement[] }) {
  const modalities: Record<string, { count: number; planets: string[] }> = {
    Cardinal: { count: 0, planets: [] },
    Fixed: { count: 0, planets: [] },
    Mutable: { count: 0, planets: [] },
  };

  const signToModality: Record<string, string> = {
    Aries: "Cardinal", Cancer: "Cardinal", Libra: "Cardinal", Capricorn: "Cardinal",
    Taurus: "Fixed", Leo: "Fixed", Scorpio: "Fixed", Aquarius: "Fixed",
    Gemini: "Mutable", Virgo: "Mutable", Sagittarius: "Mutable", Pisces: "Mutable",
  };

  for (const p of placements) {
    const mod = signToModality[p.sign];
    if (mod) {
      modalities[mod].count++;
      modalities[mod].planets.push(p.planet);
    }
  }

  const total = placements.length;

  return (
    <div className="space-y-3">
      {Object.entries(modalities).map(([modality, { count, planets }]) => (
        <div key={modality}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-primary">{modality}</span>
            <span className="text-text-muted text-xs">
              {planets.join(", ")}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(42, 45, 66, 0.5)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(count / total) * 100}%`, backgroundColor: "rgba(201, 165, 92, 0.7)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadingContent() {
  const searchParams = useSearchParams();
  const [readingData, setReadingData] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("odins-eye-reading");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setReadingData(parsed);
      } catch {
        setError("Failed to load reading data.");
      }
    } else {
      setError("No reading data found. Please fill out the form first.");
    }
    setLoading(false);
  }, [searchParams]);

  const handleDownloadPdf = useCallback(async () => {
    if (!readingData) return;
    setDownloading(true);
    try {
      const raw = sessionStorage.getItem("odins-eye-reading");
      if (!raw) return;
      const stored = JSON.parse(raw);

      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: stored.firstName || "Reader",
          reading: stored.reading,
          chart: stored.chart,
          aspects: stored.aspects,
          location: stored.location,
        }),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `odins-eye-${readingData.chart.placements[0]?.sign?.toLowerCase() || "reading"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [readingData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Loading your reading...</p>
        </div>
      </div>
    );
  }

  if (error || !readingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-error mb-4">
            {error || "No reading data found."}
          </p>
          <a
            href="/"
            className="inline-block rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-bg-deep hover:bg-gold-hover transition-colors"
          >
            Start Over
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="pt-12 pb-8 text-center">
        <Image
          src="/odinsark-logo-white.png"
          alt="Odinsark"
          width={160}
          height={32}
          className="mx-auto mb-4"
        />
        <h1 className="font-heading text-3xl md:text-4xl text-text-primary tracking-wide mb-2">
          Odin&apos;s Eye
        </h1>
        <p className="text-sm text-text-secondary">Your Natal Reading</p>
      </header>

      <article className="max-w-3xl mx-auto px-4 pb-16">
        {/* PDF-capturable container */}
        <div ref={pdfRef}>
          {/* Chart Data — at the top */}
          <div className="glass-card p-6 md:p-10">
            <ChartTable data={readingData} />
          </div>

          {/* Reading prose */}
          <div className="mt-8 glass-card p-6 md:p-10">
            <div className="prose prose-invert max-w-none">
              {readingData.reading.split("\n").map((line, i) => {
                if (line.startsWith("### ")) {
                  return (
                    <h3
                      key={i}
                      className="font-heading text-xl md:text-2xl text-gold mt-10 mb-4 first:mt-0"
                    >
                      {line.replace("### ", "")}
                    </h3>
                  );
                }
                if (line.trim() === "") {
                  return <div key={i} className="h-4" />;
                }
                return (
                  <p
                    key={i}
                    className="text-text-primary text-sm md:text-base leading-relaxed mb-4"
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 no-print">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-bg-deep hover:bg-gold-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-bg-deep border-t-transparent rounded-full animate-spin" />
                Generating PDF...
              </span>
            ) : (
              "Download as PDF"
            )}
          </button>
          <a
            href="/"
            className="rounded-lg border border-border px-6 py-3 text-sm text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors"
          >
            Edit & Regenerate
          </a>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("odins-eye-draft");
                sessionStorage.removeItem("odins-eye-reading");
              }
              window.location.href = "/";
            }}
            className="rounded-lg border border-border px-6 py-3 text-sm text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors cursor-pointer"
          >
            Start Fresh
          </button>
        </div>
      </article>

      <footer className="py-6 text-center text-xs text-text-muted">
        <p>Odinsark Labs LLC</p>
      </footer>
    </main>
  );
}

export default function ReadingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReadingContent />
    </Suspense>
  );
}
