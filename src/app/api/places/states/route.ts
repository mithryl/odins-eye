import { NextRequest, NextResponse } from "next/server";
import { State } from "country-state-city";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country");
  if (!country) return NextResponse.json([]);
  const states = State.getStatesOfCountry(country).map((s) => ({
    code: s.isoCode,
    name: s.name,
  }));
  return NextResponse.json(states);
}
