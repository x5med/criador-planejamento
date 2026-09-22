import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { METHOD_SYSTEM_PROMPT } from "@/lib/method";

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
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
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const responseJsonSchema = cleanJsonSchema(z.toJSONSchema(options.schema));

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
      setTimeout(() => reject(new Error("Tempo limite da IA excedido")), 55_000),
    ),
  ]);

  if (!response.text) throw new Error("A IA não retornou conteúdo");
  return options.schema.parse(JSON.parse(response.text));
}
