import { NextResponse } from "next/server";
import { Country } from "country-state-city";

export const dynamic = "force-static";

export async function GET() {
  const countries = Country.getAllCountries().map((c) => ({
    code: c.isoCode,
    name: c.name,
  }));
  return NextResponse.json(countries);
}
