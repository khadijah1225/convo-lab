import { backboard } from "./client";

let cachedAssistantId: string | null = null;

export async function getConversationLabAssistantId() {
  if (cachedAssistantId) return cachedAssistantId;

  const assistant = await backboard.createAssistant({
    name: "Conversation Lab Analyzer",
    system_prompt: "You are a helpful assistant.",
  });

  cachedAssistantId = assistant.assistantId;
  return cachedAssistantId;
}
