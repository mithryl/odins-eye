import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { calculateChart, calculateAspects, resolveApproximateTime } from "@/lib/chart";
import { geocodeCity } from "@/lib/geocode";
import { buildPrompt } from "@/lib/prompt";
import { FormData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json();

    // Validate required fields
    if (!formData.firstName || !formData.birthDate || !formData.birthCity) {
      return NextResponse.json(
        { error: "Missing required fields: name, birth date, and birth city" },
        { status: 400 }
      );
    }

    // Geocode the birth city
    const geo = await geocodeCity(formData.birthCity, formData.birthCountry, formData.birthState);

    // Resolve birth time
    let birthTime: string | null = null;
    if (formData.birthTimePrecision === "exact" && formData.birthTimeExact) {
      birthTime = formData.birthTimeExact;
    } else if (formData.birthTimePrecision === "approximate" && formData.birthTimeApproximate) {
      birthTime = resolveApproximateTime(formData.birthTimeApproximate);
    }

    // Calculate natal chart
    const chart = calculateChart(
      formData.birthDate,
      birthTime,
      geo.latitude,
      geo.longitude,
    );
    const aspects = calculateAspects(chart.placements);

    // Build the prompt
    const prompt = buildPrompt(chart, aspects, formData);

    // Call Claude
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const reading =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Simplified location: city, state, country
    const location = [formData.birthCity, formData.birthState, formData.birthCountry]
      .filter(Boolean)
      .join(", ");

    return NextResponse.json({
      reading,
      chart,
      aspects,
      location,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
