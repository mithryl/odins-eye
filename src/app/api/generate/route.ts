import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicModel } from "@/lib/anthropicModel";
import { calculateChart, calculateAspects, resolveApproximateTime } from "@/lib/chart";
import {
  checkGenerationQuota,
  GENERATION_QUOTA_COOKIE,
  GENERATION_QUOTA_WINDOW_MS,
} from "@/lib/generationQuota";
import { buildPrompt } from "@/lib/prompt";
import { FormData } from "@/lib/types";

// Allow up to 5 minutes. Claude reading generation can take 60-90s.
export const maxDuration = 300;

function createQuotaCookie(value: string, secure: boolean): string {
  const attributes = [
    `${GENERATION_QUOTA_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.ceil(GENERATION_QUOTA_WINDOW_MS / 1000)}`,
  ];

  if (secure) attributes.push("Secure");

  return attributes.join("; ");
}

function missingRequiredFields(formData: FormData): boolean {
  return (
    !formData.firstName ||
    !formData.birthDate ||
    !formData.birthCity ||
    formData.birthLatitude === null ||
    formData.birthLongitude === null
  );
}

export async function POST(request: NextRequest) {
  const formData: FormData = await request.json();

  if (missingRequiredFields(formData)) {
    return Response.json(
      {
        event: "error",
        error: "Missing required fields: name, birth date, and a selected birth city",
      },
      { status: 400 },
    );
  }

  const birthLatitude = formData.birthLatitude;
  const birthLongitude = formData.birthLongitude;

  if (birthLatitude === null || birthLongitude === null) {
    return Response.json(
      {
        event: "error",
        error: "Missing required fields: name, birth date, and a selected birth city",
      },
      { status: 400 },
    );
  }

  const quota = checkGenerationQuota({
    cookieValue: request.cookies.get(GENERATION_QUOTA_COOKIE)?.value,
  });
  const quotaCookie = createQuotaCookie(quota.cookie, request.nextUrl.protocol === "https:");

  if (!quota.allowed) {
    return Response.json(
      {
        event: "error",
        error:
          "You have reached the daily reading limit for this browser. Try again after the window resets.",
        resetAt: quota.resetAt,
      },
      {
        status: 429,
        headers: {
          "Set-Cookie": quotaCookie,
        },
      },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Heartbeats keep mobile browsers from dropping the long generation request.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`{"event":"heartbeat"}\n`));
        } catch {
          // Controller may already be closed.
        }
      }, 5000);

      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        send({
          event: "status",
          message: `Calculating your chart... ${quota.remaining} readings left today.`,
        });

        let birthTime: string | null = null;
        if (formData.birthTimePrecision === "exact" && formData.birthTimeExact) {
          birthTime = formData.birthTimeExact;
        } else if (formData.birthTimePrecision === "approximate" && formData.birthTimeApproximate) {
          birthTime = resolveApproximateTime(formData.birthTimeApproximate);
        }

        const chart = calculateChart(
          formData.birthDate,
          birthTime,
          birthLatitude,
          birthLongitude,
        );
        const aspects = calculateAspects(chart.placements);

        send({ event: "status", message: "Consulting Odin's Eye..." });

        const prompt = buildPrompt(chart, aspects, formData);
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
          send({ event: "error", error: "ANTHROPIC_API_KEY not configured" });
          clearInterval(heartbeat);
          controller.close();
          return;
        }

        const client = new Anthropic({ apiKey });
        const messageStream = client.messages.stream({
          model: getAnthropicModel(),
          max_tokens: 8192,
          messages: [{ role: "user", content: prompt }],
        });

        let reading = "";
        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            reading += event.delta.text;
          }
        }

        const location = [formData.birthCity, formData.birthState, formData.birthCountry]
          .filter(Boolean)
          .join(", ");

        send({
          event: "result",
          reading,
          chart,
          aspects,
          location,
        });
      } catch (error) {
        console.error("Generation error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        send({ event: "error", error: message });
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Set-Cookie": quotaCookie,
    },
  });
}
