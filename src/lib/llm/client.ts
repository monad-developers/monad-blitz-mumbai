import { ENV } from "../config/env";

type LlmChatOptions = {
  purpose: "generate_ideology" | "reflection" | "schism";
  mock: () => unknown;
  systemPrompt: string;
  userPrompt: string;
};

export async function callLlmJson<T>(options: LlmChatOptions): Promise<T> {
  if (ENV.mockLlm) {
    return options.mock() as T;
  }

  if (!ENV.llmApiUrl || !ENV.llmApiKey) {
    throw new Error("LLM_API_URL and LLM_API_KEY are required when MOCK_LLM=false");
  }

  const response = await fetch(ENV.llmApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.llmApiKey}`,
    },
    body: JSON.stringify({
      model: ENV.llmModel,
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM call failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM returned empty content");
  }

  return JSON.parse(content) as T;
}
