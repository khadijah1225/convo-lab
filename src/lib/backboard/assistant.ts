// ============================================================================
// backboard assistant configuration
// backboard.io allows us to create "assistants" with system prompts
// we cache the assistant id so we dont recreate it on every request
// ============================================================================

import { backboard } from "./client";

let cachedAssistantId: string | null = null;

// system prompt that defines how our ai analyzes conversations
const SYSTEM_PROMPT = `you are an expert conversation analyst specializing in communication patterns and interpersonal compatibility.

your role is to:
1. analyze chat histories to extract communication "dna" - structured features that define how someone communicates
2. evaluate compatibility between two communication profiles
3. generate realistic conversation simulations based on communication profiles

key principles:
- be specific and grounded in actual patterns you observe
- avoid generic statements - reference actual behaviors from the data
- consider both similarity (matching styles) and complementarity (productive differences)
- acknowledge uncertainty when data is limited
- focus on communication patterns, not personality judgments

when outputting json, return ONLY valid json with no markdown formatting or explanation.`;

export async function getConversationLabAssistantId(): Promise<string> {
  // return cached id if we already created the assistant
  if (cachedAssistantId) {
    return cachedAssistantId;
  }

  // create a new assistant with our system prompt
  const assistant = await backboard.createAssistant({
    name: "Conversation Lab Analyzer",
    system_prompt: SYSTEM_PROMPT,
  });

  cachedAssistantId = assistant.assistantId;
  console.log("created backboard assistant:", cachedAssistantId);
  
  return cachedAssistantId;
}
