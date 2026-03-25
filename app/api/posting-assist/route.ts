import { NextResponse } from "next/server";

import {
  buildPostingAssistFallback,
  mergePostingAssistResult
} from "@/src/lib/posting-assistant";

export const runtime = "nodejs";

const postingAssistSchema = {
  name: "saga_posting_assist",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      intent: {
        type: "string",
        enum: ["event", "post", "crowd commission"]
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1
      },
      rationale: {
        type: "string"
      },
      prefill: {
        type: "object",
        additionalProperties: false,
        properties: {
          event: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              dateTime: { type: "string" },
              location: { type: "string" },
              description: { type: "string" },
              communities: { type: "string" },
              eventFormat: {
                type: "string",
                enum: ["Ticketed social", "Free meetup", "Screening", "Creator collab"]
              },
              sourceCrew: { type: "boolean" }
            },
            required: [
              "name",
              "dateTime",
              "location",
              "description",
              "communities",
              "eventFormat",
              "sourceCrew"
            ]
          },
          post: {
            type: "object",
            additionalProperties: false,
            properties: {
              caption: { type: "string" },
              communities: { type: "string" },
              audience: { type: "string" }
            },
            required: ["caption", "communities", "audience"]
          },
          crowdCommission: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              fundingGoal: { type: "string" },
              deadline: { type: "string" },
              story: { type: "string" },
              perks: { type: "string" }
            },
            required: ["title", "fundingGoal", "deadline", "story", "perks"]
          }
        },
        required: ["event", "post", "crowdCommission"]
      }
    },
    required: ["intent", "confidence", "rationale", "prefill"]
  }
} as const;

const instructions = `
You classify short creator drafts for Saga, a fandom-native social and events platform.

Choose the single best intent:
- event: the user is trying to host or announce something with a time, place, ticket, meetup, party, salon, or crew need
- post: the user is sharing a thought, work-in-progress, fandom update, or social post
- crowd commission: the user is asking the community to fund or back a campaign, deliverable, or commission

Return only valid JSON that matches the schema. Be conservative and practical:
- keep fields short and usable in a UI form
- preserve the user's wording when it is already good
- leave unknown fields as empty strings instead of inventing specifics
- set sourceCrew to true only when the draft implies staffing, production, or creator help
- eventFormat must be one of: Ticketed social, Free meetup, Screening, Creator collab
- confidence should reflect how obvious the intent is
`.trim();

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const draft = typeof body.draft === "string" ? body.draft.trim() : "";

  if (!draft) {
    return NextResponse.json(buildPostingAssistFallback(""));
  }

  const fallback = buildPostingAssistFallback(draft);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(fallback);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_POSTING_MODEL ?? "gpt-4.1-mini",
        instructions,
        input: draft,
        text: {
          format: {
            type: "json_schema",
            ...postingAssistSchema
          }
        }
      })
    });

    if (!response.ok) {
      return NextResponse.json(fallback);
    }

    const payload = await response.json();
    const outputText =
      typeof payload.output_text === "string" ? payload.output_text.trim() : "";
    if (!outputText) {
      return NextResponse.json(fallback);
    }

    const parsed = JSON.parse(outputText);
    return NextResponse.json(mergePostingAssistResult(parsed, fallback, "llm"));
  } catch (error) {
    console.error("[posting-assist] Falling back to heuristic parsing", error);
    return NextResponse.json(fallback);
  }
}
