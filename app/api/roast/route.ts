import OpenAI from "openai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a brutal but constructive resume critic. Analyze this resume and provide:
1. A savage but funny opening roast (1-2 sentences, make them laugh)
2. SCORE: Rate it 1-10 with breakdown:
   - Clarity (1-10)
   - Impact (1-10)
   - Formatting (1-10)
   - Keyword Strength (1-10)
   - ATS Compatibility (1-10)
3. TOP 5 IMPROVEMENTS: Specific, actionable fixes with before/after examples
4. OVERALL VIBE: What this resume says about them (be funny)

Respond ONLY with valid JSON in this exact structure:
{
  "roast": "savage but funny opening roast",
  "score": {
    "overall": 5,
    "breakdown": {
      "clarity": 3,
      "impact": 4,
      "formatting": 6,
      "keywords": 1,
      "ats": 3
    }
  },
  "improvements": [
    {
      "number": 1,
      "title": "improvement title",
      "before": "before example",
      "after": "after example"
    }
  ],
  "vibe": "funny overall vibe comment"
}

Rules:
- All scores must be integers 1-10
- overall score is the average of the five breakdown scores (rounded)
- improvements array must have exactly 5 items
- Return only the JSON object, no markdown, no explanation`;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured. Set OPENAI_API_KEY in your environment variables." },
      { status: 500 }
    );
  }

  let resume: string;
  try {
    const body = await request.json();
    resume = body?.resume;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON with a 'resume' field." },
      { status: 400 }
    );
  }

  if (!resume || typeof resume !== "string" || resume.trim().length === 0) {
    return NextResponse.json(
      { error: "Resume text is required." },
      { status: 400 }
    );
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let raw: string;
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: resume.trim() },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });
    raw = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `OpenAI API call failed: ${message}` },
      { status: 502 }
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse OpenAI response as JSON." },
      { status: 500 }
    );
  }

  return NextResponse.json(parsed);
}
