/**
 * Mistral AI — the only model provider in this project.
 * Docs: https://docs.mistral.ai/api/#tag/chat
 */

const ENDPOINT = "https://api.mistral.ai/v1/chat/completions";

export class MistralError extends Error {
  status: number;
  detail: string;
  constructor(message: string, status = 500, detail = "") {
    super(message);
    this.name = "MistralError";
    this.status = status;
    this.detail = detail;
  }
}

type ChatOpts = {
  system: string;
  user: string;
  /** Ask Mistral for guaranteed-parseable JSON. */
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
};

export function mistralModel() {
  return process.env.MISTRAL_MODEL?.trim() || "mistral-small-latest";
}

export async function mistralChat(opts: ChatOpts): Promise<string> {
  const key = process.env.MISTRAL_API_KEY?.trim();
  if (!key) {
    throw new MistralError(
      "MISTRAL_API_KEY is missing. Add it to .env.local and restart `npm run dev`.",
      500
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: mistralModel(),
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 2048,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timeout);
    if (e?.name === "AbortError") {
      throw new MistralError("Mistral took too long to answer (60s timeout).", 504);
    }
    throw new MistralError(
      "Could not reach api.mistral.ai. Check your internet connection.",
      502,
      String(e?.message || e)
    );
  }
  clearTimeout(timeout);

  const text = await res.text();

  if (!res.ok) {
    let detail = text.slice(0, 500);
    try {
      const j = JSON.parse(text);
      detail = j?.message || j?.error?.message || detail;
    } catch {
      /* keep raw text */
    }
    const hint =
      res.status === 401
        ? "Mistral rejected the API key (401). Check MISTRAL_API_KEY in .env.local."
        : res.status === 429
        ? "Mistral rate limit hit (429). Wait a few seconds and try again."
        : res.status === 400 && /model/i.test(detail)
        ? `Mistral did not accept the model "${mistralModel()}". Try mistral-small-latest.`
        : `Mistral returned ${res.status}.`;
    throw new MistralError(hint, res.status, detail);
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new MistralError("Mistral returned a non-JSON response.", 502, text.slice(0, 500));
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new MistralError("Mistral returned an empty response.", 502, text.slice(0, 500));
  }
  return content;
}

/**
 * Parses JSON out of a model response, tolerating ```json fences and stray prose.
 */
export function parseJsonLoose(raw: string): any {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    /* fall through */
  }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      /* fall through */
    }
  }
  return null;
}

/** One retry, because a single malformed response shouldn't break the flow. */
export async function mistralJson(opts: ChatOpts): Promise<any> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await mistralChat({
      ...opts,
      json: true,
      temperature: attempt === 0 ? opts.temperature ?? 0.7 : 0.3,
    });
    const parsed = parseJsonLoose(raw);
    if (parsed && typeof parsed === "object") return parsed;
  }
  throw new MistralError(
    "Mistral replied but the JSON could not be parsed after a retry.",
    502
  );
}
