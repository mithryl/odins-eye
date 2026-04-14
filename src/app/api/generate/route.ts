import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { calculateChart, calculateAspects, resolveApproximateTime } from "@/lib/chart";
import { buildPrompt } from "@/lib/prompt";
import { FormData } from "@/lib/types";

// Allow up to 5 minutes — Claude reading generation can take 60-90s
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Heartbeat every 5s keeps mobile browsers from dropping the connection
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`{"event":"heartbeat"}\n`));
        } catch {
          // Controller may be closed
        }
      }, 5000);

      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        const formData: FormData = await request.json();

        if (
          !formData.firstName ||
          !formData.birthDate ||
          !formData.birthCity ||
          formData.birthLatitude === null ||
          formData.birthLongitude === null
        ) {
          send({
            event: "error",
            error: "Missing required fields: name, birth date, and a selected birth city",
          });
          clearInterval(heartbeat);
          controller.close();
          return;
        }

        send({ event: "status", message: "Calculating your chart..." });

        // Resolve birth time
        let birthTime: string | null = null;
        if (formData.birthTimePrecision === "exact" && formData.birthTimeExact) {
          birthTime = formData.birthTimeExact;
        } else if (formData.birthTimePrecision === "approximate" && formData.birthTimeApproximate) {
          birthTime = resolveApproximateTime(formData.birthTimeApproximate);
        }

        const chart = calculateChart(
          formData.birthDate,
          birthTime,
          formData.birthLatitude,
          formData.birthLongitude,
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

        // Use streaming so we can flush tokens as they arrive — this alone
        // prevents mobile browser timeouts even without the heartbeat.
        const messageStream = client.messages.stream({
          model: "claude-sonnet-4-20250514",
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
            // Optional: could send token chunks for live UI, but we keep the
            // final result format simple — the heartbeat keeps the connection alive.
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
    },
  });
}
