import { NextRequest, NextResponse } from "next/server";
import { City } from "country-state-city";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country");
  const state = req.nextUrl.searchParams.get("state");
  if (!country) return NextResponse.json([]);

  const raw = state
    ? City.getCitiesOfState(country, state)
    : City.getCitiesOfCountry(country) ?? [];

  const cities = raw.map((c) => ({
    name: c.name,
    latitude: parseFloat(c.latitude ?? "0"),
    longitude: parseFloat(c.longitude ?? "0"),
  }));

  // Dedupe by name — country-state-city often has multiple entries per name
  const seen = new Set<string>();
  const deduped: typeof cities = [];
  for (const c of cities) {
    if (seen.has(c.name)) continue;
    seen.add(c.name);
    deduped.push(c);
  }
  deduped.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(deduped);
}
