import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

interface PlanetPlacement {
  planet: string;
  sign: string;
  degree: number;
}

interface ChartData {
  placements: PlanetPlacement[];
  risingSign: string | null;
  risingDegree: number | null;
  birthDateTime: string;
}

// Colors
const DEEP = [11, 13, 26] as const;
const GOLD: [number, number, number] = [201, 165, 92];
const TEXT_PRIMARY: [number, number, number] = [232, 228, 220];
const TEXT_SECONDARY: [number, number, number] = [155, 150, 166];
const TEXT_MUTED: [number, number, number] = [107, 103, 128];
const BORDER: [number, number, number] = [42, 45, 66];

const SIGN_TO_ELEMENT: Record<string, string> = {
  Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
  Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
  Gemini: "Air", Libra: "Air", Aquarius: "Air",
  Cancer: "Water", Scorpio: "Water", Pisces: "Water",
};

const SIGN_TO_MODALITY: Record<string, string> = {
  Aries: "Cardinal", Cancer: "Cardinal", Libra: "Cardinal", Capricorn: "Cardinal",
  Taurus: "Fixed", Leo: "Fixed", Scorpio: "Fixed", Aquarius: "Fixed",
  Gemini: "Mutable", Virgo: "Mutable", Sagittarius: "Mutable", Pisces: "Mutable",
};

function addPageBackground(doc: jsPDF) {
  doc.setFillColor(...DEEP);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");
}

function addPageFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("ODINSARK LABS", 20, h - 15);
  doc.text(`${pageNum} / ${totalPages}`, w - 20, h - 15, { align: "right" });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatName(name: string): string {
  return name.split(/\s+/).map(capitalize).join(" ");
}

// Load and register Cinzel font for headings
function registerCinzel(doc: jsPDF) {
  const fontPath = path.join(process.cwd(), "src/lib/fonts/Cinzel-Regular.ttf");
  const fontData = fs.readFileSync(fontPath);
  const fontBase64 = fontData.toString("base64");
  doc.addFileToVFS("Cinzel-Regular.ttf", fontBase64);
  doc.addFont("Cinzel-Regular.ttf", "Cinzel", "normal");
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, reading, chart, aspects, location } = await request.json() as {
      firstName: string;
      reading: string;
      chart: ChartData;
      aspects: string[];
      location: string;
    };

    if (!reading || !chart) {
      return NextResponse.json({ error: "Missing reading or chart data" }, { status: 400 });
    }

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    registerCinzel(doc);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentW = w - margin * 2;

    // Load white logo
    const logoPath = path.join(process.cwd(), "public/odinsark-logo-white.png");
    const logoData = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

    // ==================
    // COVER PAGE
    // ==================
    addPageBackground(doc);

    // Odinsark runic logo (white)
    const logoW = 180;
    const logoH = 36; // aspect ratio ~5:1
    doc.addImage(logoBase64, "PNG", (w - logoW) / 2, 220, logoW, logoH);

    // "Odin's Eye" title — Cinzel to match the website
    doc.setFontSize(32);
    doc.setTextColor(...TEXT_PRIMARY);
    doc.setFont("Cinzel", "normal");
    doc.text("Odin's Eye", w / 2, 290, { align: "center" });

    // Subtitle
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_SECONDARY);
    doc.text("Natal Chart Reading", w / 2, 312, { align: "center", charSpace: 1 });

    // Gold divider
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(w / 2 - 30, 320, w / 2 + 30, 320);

    // Name — capitalized, not all caps
    doc.setFontSize(22);
    doc.setTextColor(...GOLD);
    doc.setFont("helvetica", "normal");
    doc.text(formatName(firstName), w / 2, 360, { align: "center" });

    // Birth details
    const birthDate = new Date(chart.birthDateTime).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_SECONDARY);
    doc.text(birthDate, w / 2, 385, { align: "center" });
    doc.text(location, w / 2, 400, { align: "center" });

    // Big Three
    const sun = chart.placements.find((p) => p.planet === "Sun");
    const moon = chart.placements.find((p) => p.planet === "Moon");
    const bigThree: { label: string; value: string }[] = [];
    if (sun) bigThree.push({ label: "SUN", value: sun.sign });
    if (moon) bigThree.push({ label: "MOON", value: moon.sign });
    if (chart.risingSign) bigThree.push({ label: "RISING", value: chart.risingSign });

    const btStartX = w / 2 - (bigThree.length * 80) / 2;
    bigThree.forEach((item, i) => {
      const cx = btStartX + i * 80 + 40;
      doc.setFontSize(7);
      doc.setTextColor(...TEXT_MUTED);
      doc.setFont("helvetica", "normal");
      doc.text(item.label, cx, 440, { align: "center", charSpace: 2 });
      doc.setFontSize(14);
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text(item.value, cx, 458, { align: "center" });
    });

    // ==================
    // CHART DATA PAGE (page 2)
    // ==================
    doc.addPage();
    addPageBackground(doc);
    let y = margin;

    // Planetary Placements heading
    doc.setFontSize(16);
    doc.setTextColor(...GOLD);
    doc.setFont("Cinzel", "normal");
    doc.text("Planetary Placements", margin, y);
    y += 8;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentW, y);
    y += 16;

    // Table header
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.setFont("helvetica", "normal");
    doc.text("PLANET", margin, y);
    doc.text("SIGN", margin + 200, y);
    doc.text("DEGREE", margin + contentW, y, { align: "right" });
    y += 12;

    // Ascendant row — no highlight, same as other rows
    if (chart.risingSign) {
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 8, margin + contentW, y - 8);
      doc.setFontSize(9);
      doc.setTextColor(...GOLD);
      doc.setFont("helvetica", "normal");
      doc.text("Ascendant", margin, y);
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text(chart.risingSign, margin + 200, y);
      doc.setTextColor(...TEXT_SECONDARY);
      doc.text(chart.risingDegree != null ? `${chart.risingDegree.toFixed(1)}\u00B0` : "--", margin + contentW, y, { align: "right" });
      y += 18;
    }

    // Planet rows
    for (const p of chart.placements) {
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 8, margin + contentW, y - 8);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text(p.planet, margin, y);
      doc.text(p.sign, margin + 200, y);
      doc.setTextColor(...TEXT_SECONDARY);
      doc.text(`${p.degree.toFixed(1)}\u00B0`, margin + contentW, y, { align: "right" });
      y += 18;
    }

    // Aspects
    y += 15;
    doc.setFontSize(16);
    doc.setTextColor(...GOLD);
    doc.setFont("Cinzel", "normal");
    doc.text("Major Aspects", margin, y);
    y += 8;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentW, y);
    y += 14;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_SECONDARY);
    for (const aspect of aspects) {
      if (y > h - 40) {
        doc.addPage();
        addPageBackground(doc);
        y = margin;
      }
      doc.text(aspect, margin, y);
      y += 14;
    }

    // Elemental Balance
    y += 15;
    if (y > h - 120) {
      doc.addPage();
      addPageBackground(doc);
      y = margin;
    }
    doc.setFontSize(16);
    doc.setTextColor(...GOLD);
    doc.setFont("Cinzel", "normal");
    doc.text("Elemental Balance", margin, y);
    y += 8;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentW, y);
    y += 16;

    const elements: Record<string, string[]> = { Fire: [], Earth: [], Air: [], Water: [] };
    for (const p of chart.placements) {
      const el = SIGN_TO_ELEMENT[p.sign];
      if (el) elements[el].push(p.planet);
    }
    const total = chart.placements.length;
    const elColors: Record<string, [number, number, number]> = {
      Fire: [239, 68, 68], Earth: [52, 211, 153], Air: [56, 189, 248], Water: [59, 130, 246],
    };

    doc.setFont("helvetica", "normal");
    for (const [el, planets] of Object.entries(elements)) {
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text(el, margin, y);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(planets.join(", "), margin + contentW, y, { align: "right" });
      y += 8;
      doc.setFillColor(...BORDER);
      doc.roundedRect(margin, y, contentW, 5, 2, 2, "F");
      const fillW = Math.max(4, (planets.length / total) * contentW);
      doc.setFillColor(...elColors[el]);
      doc.roundedRect(margin, y, fillW, 5, 2, 2, "F");
      y += 14;
    }

    // Modality Balance
    y += 10;
    if (y > h - 100) {
      doc.addPage();
      addPageBackground(doc);
      y = margin;
    }
    doc.setFontSize(16);
    doc.setTextColor(...GOLD);
    doc.setFont("Cinzel", "normal");
    doc.text("Modality Balance", margin, y);
    y += 8;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentW, y);
    y += 16;

    const modalities: Record<string, string[]> = { Cardinal: [], Fixed: [], Mutable: [] };
    for (const p of chart.placements) {
      const mod = SIGN_TO_MODALITY[p.sign];
      if (mod) modalities[mod].push(p.planet);
    }

    doc.setFont("helvetica", "normal");
    for (const [mod, planets] of Object.entries(modalities)) {
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text(mod, margin, y);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(planets.join(", "), margin + contentW, y, { align: "right" });
      y += 8;
      doc.setFillColor(...BORDER);
      doc.roundedRect(margin, y, contentW, 5, 2, 2, "F");
      const fillW = Math.max(4, (planets.length / total) * contentW);
      doc.setFillColor(...GOLD);
      doc.roundedRect(margin, y, fillW, 5, 2, 2, "F");
      y += 14;
    }

    // ==================
    // READING PAGES
    // ==================
    const lines = reading.split("\n");
    let needsNewPage = true;

    for (const line of lines) {
      if (needsNewPage) {
        doc.addPage();
        addPageBackground(doc);
        y = margin;
        needsNewPage = false;
      }

      if (line.startsWith("### ")) {
        if (y > h - 80) {
          doc.addPage();
          addPageBackground(doc);
          y = margin;
        }
        const heading = line.replace("### ", "");
        y += 20;
        doc.setFontSize(16);
        doc.setTextColor(...GOLD);
        doc.setFont("Cinzel", "normal");
        doc.text(heading, margin, y);
        y += 6;
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.3);
        doc.line(margin, y, margin + contentW, y);
        y += 14;
      } else if (line.trim() === "") {
        y += 6;
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT_PRIMARY);
        const wrapped = doc.splitTextToSize(line, contentW);
        const blockH = wrapped.length * 14;

        if (y + blockH > h - 40) {
          doc.addPage();
          addPageBackground(doc);
          y = margin;
        }

        for (const wl of wrapped) {
          doc.text(wl, margin, y);
          y += 14;
        }
        y += 4;
      }
    }

    // Update all page footers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addPageFooter(doc, i, totalPages);
    }

    const pdfBytes = doc.output("arraybuffer");
    const sunSign = chart.placements[0]?.sign?.toLowerCase() || "reading";

    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="odins-eye-${sunSign}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
