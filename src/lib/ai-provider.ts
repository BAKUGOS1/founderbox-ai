type AiMode = "live" | "mock";

interface GenerateJsonInput<T> {
  system: string;
  user: string;
  fallback: T;
  apiKey?: string | null;
  model?: string;
  temperature?: number;
}

interface GenerateJsonResult<T> {
  data: T;
  mode: AiMode;
  notice?: string;
}

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

export function isAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getAiConfigStatus() {
  return {
    configured: isAiConfigured(),
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini"
  };
}

function extractJson(content: string) {
  try {
    return JSON.parse(content) as unknown;
  } catch {
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(content.slice(firstBrace, lastBrace + 1)) as unknown;
    }
    throw new Error("AI response did not contain parseable JSON.");
  }
}

export async function generateJson<T>({
  system,
  user,
  fallback,
  apiKey: requestApiKey,
  model: requestModel,
  temperature = 0.35
}: GenerateJsonInput<T>): Promise<GenerateJsonResult<T>> {
  const apiKey = requestApiKey || process.env.OPENAI_API_KEY;
  const model = requestModel || process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    return {
      data: fallback,
      mode: "mock",
      notice: "OPENAI_API_KEY is not configured. Returned backend fallback output."
    };
  }

  try {
    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${system}\n\nReturn only valid JSON. Do not include markdown.`
          },
          {
            role: "user",
            content: user
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${errorText.slice(0, 300)}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI response did not include message content.");
    }

    return {
      data: extractJson(content) as T,
      mode: "live"
    };
  } catch (error) {
    return {
      data: fallback,
      mode: "mock",
      notice: error instanceof Error ? error.message : "AI request failed. Returned fallback output."
    };
  }
}
