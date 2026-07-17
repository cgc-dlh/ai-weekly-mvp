import { openai, defaultModel } from "@/lib/ai-client";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai(defaultModel),
    messages,
  });

  return result.toDataStreamResponse();
}
