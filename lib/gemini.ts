import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { METHOD_SYSTEM_PROMPT } from "@/lib/method";

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function errorStatus(error: unknown) {
  if (!error || typeof error !== "object") return null;
  const status = Reflect.get(error, "status");
  return typeof status === "number" ? status : null;
}

export function isTransientAiError(error: unknown) {
  const status = errorStatus(error);
  if (status && [408, 429, 500, 502, 503, 504].includes(status)) return true;

  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return [
    "high demand",
    "temporarily unavailable",
    "unavailable",
    "resource exhausted",
    "rate limit",
    "tempo limite",
    "timeout",
  ].some((term) => message.includes(term));
}

function shouldRetry(error: unknown) {
  const status = errorStatus(error);
  if (status && [429, 500, 502, 503, 504].includes(status)) return true;

  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return ["high demand", "unavailable", "resource exhausted", "rate limit"].some(
    (term) => message.includes(term),
  );
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function cleanJsonSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cleanJsonSchema);
  if (!value || typeof value !== "object") return value;

  const ignored = new Set([
    "$schema",
    "minLength",
    "maxLength",
    "pattern",
    "default",
  ]);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !ignored.has(key))
      .map(([key, item]) => [key, cleanJsonSchema(item)]),
  );
}

export async function generateStructured<T>(options: {
  prompt: string;
  schema: z.ZodType<T>;
  temperature?: number;
}): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
  const responseJsonSchema = cleanJsonSchema(z.toJSONSchema(options.schema));

  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const request = ai.models.generateContent({
        model,
        contents: options.prompt,
        config: {
          systemInstruction: METHOD_SYSTEM_PROMPT,
          temperature: options.temperature ?? 0.25,
          responseMimeType: "application/json",
          responseJsonSchema,
        },
      });

      const response = await Promise.race([
        request,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Tempo limite da IA excedido")),
            55_000,
          ),
        ),
      ]);

      if (!response.text) throw new Error("A IA não retornou conteúdo");
      return options.schema.parse(JSON.parse(response.text));
    } catch (error) {
      lastError = error;
      if (attempt === 2 || !shouldRetry(error)) throw error;
      await wait(attempt === 0 ? 750 : 1_750);
    }
  }

  throw lastError;
}
