import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import {
  generateStructured,
  getGeminiModel,
  hasGeminiKey,
} from "@/lib/gemini";
import { METHOD_SYSTEM_PROMPT } from "@/lib/method";
import type { AiProvider } from "@/lib/types";

type AiTask = "interview" | "plan";

export type AiGeneration<T> = {
  data: T;
  provider: Exclude<AiProvider, "demo">;
  model: string;
  providerNote: string | null;
};

export function hasGatewayAuth() {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL === "1" ||
      process.env.VERCEL_ENV,
  );
}

export function getGatewayModel(task: AiTask) {
  const configured =
    task === "plan"
      ? process.env.AI_GATEWAY_PLAN_MODEL
      : process.env.AI_GATEWAY_INTERVIEW_MODEL;
  return configured?.trim() ||
    (task === "plan" ? "openai/gpt-6.1-sol" : "openai/gpt-6-luna");
}

async function generateWithGateway<T>(options: {
  task: AiTask;
  prompt: string;
  schema: z.ZodType<T>;
  temperature: number;
  timeoutMs: number;
}) {
  const model = getGatewayModel(options.task);
  const fallbackModels =
    options.task === "plan"
      ? ["google/gemini-3.6-flash"]
      : ["google/gemini-3.5-flash"];
  const result = await generateText({
    model,
    system: METHOD_SYSTEM_PROMPT,
    prompt: options.prompt,
    temperature: options.temperature,
    output: Output.object({ schema: options.schema }),
    timeout: { totalMs: options.timeoutMs },
    providerOptions: {
      gateway: {
        models: fallbackModels,
        has: ["structured-output"],
        disallowPromptTraining: true,
        tags: ["x5-planejamento", options.task],
      },
    },
  });

  return {
    data: result.output,
    model: result.response.modelId || model,
  };
}

export async function generateReliableStructured<T>(options: {
  task: AiTask;
  prompt: string;
  schema: z.ZodType<T>;
  temperature: number;
}): Promise<AiGeneration<T> | null> {
  let geminiFailed = false;

  if (hasGeminiKey()) {
    try {
      const data = await generateStructured({
        prompt: options.prompt,
        schema: options.schema,
        temperature: options.temperature,
        attempts: options.task === "interview" ? 2 : 1,
        timeoutMs: options.task === "interview" ? 22_000 : 42_000,
      });
      return {
        data,
        provider: "gemini",
        model: getGeminiModel(),
        providerNote: null,
      };
    } catch (error) {
      geminiFailed = true;
      console.warn("Gemini indisponível; tentando a IA de contingência", error);
    }
  }

  if (hasGatewayAuth()) {
    try {
      const result = await generateWithGateway({
        ...options,
        timeoutMs: options.task === "interview" ? 35_000 : 55_000,
      });
      return {
        ...result,
        provider: "gateway",
        providerNote: geminiFailed
          ? "O Gemini não respondeu; esta versão foi gerada pela IA de contingência."
          : null,
      };
    } catch (error) {
      console.warn("IA de contingência indisponível", error);
    }
  }

  return null;
}
