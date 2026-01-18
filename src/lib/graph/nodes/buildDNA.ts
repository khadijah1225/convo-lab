// ============================================================================
// builddna node - extracts conversation dna from chat history using ai
// this is the core analysis that powers compatibility scoring
// we use backboard.io to access various llm providers (openai, anthropic, etc)
// ============================================================================

import { GraphStateType, ConversationDNA } from "../state";
import { backboard } from "@/lib/backboard/client";
import { getConversationLabAssistantId } from "@/lib/backboard/assistant";

// the prompt we send to the llm to extract dna features
// very detailed to ensure consistent, structured output
function buildDNAPrompt(chat: string): string {
  return `you are a conversation analyst. analyze the following chat history and extract a "conversation dna" profile for the person whose messages appear most frequently (the main speaker).

look at their actual messages, not what others say to them.

return ONLY valid json matching this exact schema (no markdown, no explanation, just json):

{
  "style": {
    "verbosity": <0-1, avg message length relative to short=0, long=1>,
    "emojiUsage": <0-1, frequency of emojis>,
    "punctuationStyle": <0-1, minimal=0, heavy=1>,
    "slangLevel": <0-1, formal=0, very casual/slang=1>,
    "formality": <0-1, casual=0, professional=1>
  },
  "interaction": {
    "questionRate": <0-1, how often they ask questions>,
    "responseDepth": <0-1, one-word replies=0, detailed=1>,
    "initiationRate": <0-1, do they start topics or respond>,
    "turnTakingBalance": <0-1, 0.5=balanced, <0.5=more listening, >0.5=more talking>
  },
  "socialSignals": {
    "warmth": <0-1, cold=0, very warm/affectionate=1>,
    "humor": <0-1, serious=0, very jokey=1>,
    "empathyMarkers": <0-1, validation and support language>,
    "directness": <0-1, indirect=0, very blunt=1>,
    "flirtingIntensity": <0-1, none=0, heavily flirty=1>,
    "enthusiasm": <0-1, low energy=0, very excited=1>
  },
  "topics": {
    "dominantThemes": [<array of 3-5 topic strings they gravitate toward>],
    "curiosityBreadth": <0-1, narrow interests=0, wide-ranging=1>,
    "depthPreference": <0-1, surface level=0, philosophical/deep=1>,
    "avoidsTopics": [<array of topics they seem to avoid, can be empty>]
  },
  "conflictHandling": {
    "style": "<one of: avoidant, accommodating, direct, collaborative>",
    "defensiveness": <0-1, how quickly they get defensive>,
    "resolutionFocus": <0-1, venting=0, problem-solving=1>
  },
  "needs": {
    "needsReassurance": <0-1, seeks validation>,
    "needsSpace": <0-1, prefers independence>,
    "needsPlayfulness": <0-1, wants banter>,
    "needsDepth": <0-1, craves meaning>,
    "needsDirectness": <0-1, appreciates straight talk>
  },
  "confidence": <0-1, how confident you are in this analysis based on chat length/quality>,
  "chatLength": <number of messages from main speaker>,
  "notes": [<array of any important observations or caveats>]
}

chat history to analyze:
---
${chat}
---

remember: output ONLY the json object, nothing else.`;
}

// safely parse json from llm response, handling markdown code blocks
function safeJsonParse<T>(text: string): T {
  // strip markdown code blocks if present
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("failed to parse dna json:", cleaned);
    throw new Error(`dna output was not valid json. got: ${text.substring(0, 200)}...`);
  }
}

// main node function - analyzes both chat histories in parallel
export async function buildDNA(state: GraphStateType): Promise<Partial<GraphStateType>> {
  // get our backboard assistant (cached after first call)
  const assistantId = await getConversationLabAssistantId();

  // create separate threads for each analysis (keeps contexts isolated)
  // we run both in parallel for speed
  const [threadA, threadB] = await Promise.all([
    backboard.createThread(assistantId),
    backboard.createThread(assistantId),
  ]);

  // send prompts to both threads simultaneously
  // using gpt-4o for best analysis quality - backboard routes this appropriately
  const [resA, resB] = await Promise.all([
    backboard.addMessage(threadA.threadId, {
      content: buildDNAPrompt(state.chatA),
      llm_provider: "openai",
      model_name: "gpt-4o",
      stream: false,
      temperature: 0.3, // low temp for consistent structured output
    }),
    backboard.addMessage(threadB.threadId, {
      content: buildDNAPrompt(state.chatB),
      llm_provider: "openai",
      model_name: "gpt-4o",
      stream: false,
      temperature: 0.3,
    }),
  ]);

  // parse the json responses into typed dna objects
  const dnaA = safeJsonParse<ConversationDNA>(resA.content);
  const dnaB = safeJsonParse<ConversationDNA>(resB.content);

  console.log("extracted dna for person a:", dnaA);
  console.log("extracted dna for person b:", dnaB);

  // return the updated state with both dna profiles
  return { 
    ...state, 
    dnaA, 
    dnaB 
  };
}
