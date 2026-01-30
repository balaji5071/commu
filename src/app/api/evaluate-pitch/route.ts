import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OLLAMA_URL =
  process.env.OLLAMA_URL ?? "http://127.0.0.1:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "mistral";

type Evaluation = {
  grammarScore: number;
  strategyScore: number;
  overallScore: number;
  feedback: {
    strengths: string;
    improvements: string;
    summary: string;
  };
};

export async function POST(request: Request) {
  try {
    const { transcript, productName } = await request.json();

    if (!transcript || transcript.trim().length < 5) {
      return NextResponse.json(
        { error: "Transcript is empty or too short" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert sales coach.

Product: ${productName || "the product"}

Evaluate the following sales pitch.

Respond ONLY with valid JSON in this exact format:
{
  "grammarScore": number,
  "strategyScore": number,
  "overallScore": number,
  "feedback": {
    "strengths": string,
    "improvements": string,
    "summary": string
  }
}

Pitch:
"${transcript}"
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!ollamaResponse.ok) {
      const text = await ollamaResponse.text();
      throw new Error(`Ollama failed: ${text}`);
    }

    const data = await ollamaResponse.json();
    const raw = data?.response;

    if (!raw) {
      throw new Error("Empty response from Ollama");
    }

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON found in Ollama output");
    }

    const evaluation: Evaluation = JSON.parse(match[0]);

    return NextResponse.json(evaluation);
  } catch (error: unknown) {
    console.error("Evaluation error:", error);

    const details =
      error instanceof Error
        ? error.name === "AbortError"
          ? "Ollama request timed out"
          : error.message
        : "Ollama server unreachable or returned invalid response";

    return NextResponse.json(
      {
        error: "Evaluation failed",
        details,
      },
      { status: 500 }
    );
  }
}
