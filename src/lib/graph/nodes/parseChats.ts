// ============================================================================
// parsechats node - preprocesses and validates chat input
// this is the first node in the pipeline - cleans and normalizes the chat data
// future enhancement: could extract timestamps, identify speakers, etc.
// ============================================================================

import { GraphStateType } from "../state";

// clean up chat text for consistency
function normalizeChat(chat: string): string {
  return chat
    .trim()
    // normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // remove excessive blank lines
    .replace(/\n{3,}/g, "\n\n")
    // trim each line
    .split("\n")
    .map(line => line.trim())
    .join("\n");
}

// validate that we have usable chat data
function validateChat(chat: string): { valid: boolean; messageCount: number } {
  const lines = chat.split("\n").filter(line => line.trim().length > 0);
  return {
    valid: lines.length >= 3, // need at least a few messages for analysis
    messageCount: lines.length,
  };
}

export async function parseChats(
  state: GraphStateType
): Promise<Partial<GraphStateType>> {
  // normalize both chats
  const normalizedA = normalizeChat(state.chatA);
  const normalizedB = normalizeChat(state.chatB);

  // validate we have enough data
  const validationA = validateChat(normalizedA);
  const validationB = validateChat(normalizedB);

  if (!validationA.valid) {
    console.warn(`chat a has only ${validationA.messageCount} messages - analysis may be limited`);
  }
  if (!validationB.valid) {
    console.warn(`chat b has only ${validationB.messageCount} messages - analysis may be limited`);
  }

  console.log(`parsed chats - a: ${validationA.messageCount} msgs, b: ${validationB.messageCount} msgs`);

  return {
    chatA: normalizedA,
    chatB: normalizedB,
  };
}
