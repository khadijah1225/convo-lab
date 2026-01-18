// first real AI agent in the graph that builds DNA profiles for both conversations
import { GraphStateType, ConversationDNA } from "../state";
import { backboard } from "@/lib/backboard/client";
import { getConversationLabAssistantId } from "@/lib/backboard/assistant";

function dnaPrompt(chat: string) {
  return `
Analyze the following chat and return ONLY a JSON object. No markdown. No backticks. No explanation..

Schema:
{
  "verbosity": number between 0 and 1,
  "humor": number between 0 and 1,
  "directness": number between 0 and 1
}

Chat:
${chat}
`;
}

function safeJsonParse<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`DNA output was not valid JSON. Got: ${text}`);
  }
}

export async function buildDNA(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const assistantId = await getConversationLabAssistantId();
  const thread = await backboard.createThread(assistantId);

  const resA = await backboard.addMessage(thread.threadId, {
    content: dnaPrompt(state.chatA),
    llm_provider: "openai",
    model_name: "gpt-4o",
    stream: false,
  });

  const dnaA = safeJsonParse<ConversationDNA>(resA.content);

  const thread2 = await backboard.createThread(assistantId);
  const resB = await backboard.addMessage(thread2.threadId, {
    content: dnaPrompt(state.chatB),
    llm_provider: "openai",
    model_name: "gpt-4o",
    stream: false,
  });

  const dnaB = safeJsonParse<ConversationDNA>(resB.content);

  return { ...state, dnaA, dnaB };
}
