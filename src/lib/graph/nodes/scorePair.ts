// ============================================================================
// scorepair node - calculates compatibility between two dna profiles
// uses a hybrid approach: deterministic math + ai-generated insights
// this gives us reproducible scores while still getting human-readable insights
// ============================================================================

import { GraphStateType, ConversationDNA, CompatibilityScore } from "../state";
import { backboard } from "@/lib/backboard/client";
import { getConversationLabAssistantId } from "@/lib/backboard/assistant";

// helper: clamp a number between min and max
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// helper: calculate similarity between two 0-1 values (1 = identical, 0 = opposite)
function similarity(a: number, b: number): number {
  return 1 - Math.abs(a - b);
}

// helper: check if values complement each other (one high, one low can be good)
// e.g., one person asks questions, other gives detailed answers = good match
function complementarity(a: number, b: number): number {
  // high complement when they're different in productive ways
  // returns 1 when a+b ≈ 1 (one is high, other is low)
  return 1 - Math.abs((a + b) - 1);
}

// the deterministic scoring function - calculates subscores from dna features
function calculateSubscores(dnaA: ConversationDNA, dnaB: ConversationDNA) {
  // style fit: how similar are their writing styles?
  const styleFit = (
    similarity(dnaA.style.verbosity, dnaB.style.verbosity) * 0.25 +
    similarity(dnaA.style.emojiUsage, dnaB.style.emojiUsage) * 0.2 +
    similarity(dnaA.style.punctuationStyle, dnaB.style.punctuationStyle) * 0.15 +
    similarity(dnaA.style.slangLevel, dnaB.style.slangLevel) * 0.2 +
    similarity(dnaA.style.formality, dnaB.style.formality) * 0.2
  );

  // pace fit: do they match in conversation rhythm?
  const paceFit = (
    similarity(dnaA.interaction.responseDepth, dnaB.interaction.responseDepth) * 0.3 +
    similarity(dnaA.interaction.turnTakingBalance, dnaB.interaction.turnTakingBalance) * 0.3 +
    // complementarity is good here - one asks, other answers deeply
    complementarity(dnaA.interaction.questionRate, dnaB.interaction.responseDepth) * 0.4
  );

  // warmth fit: emotional tone compatibility
  const warmthFit = (
    similarity(dnaA.socialSignals.warmth, dnaB.socialSignals.warmth) * 0.4 +
    similarity(dnaA.socialSignals.empathyMarkers, dnaB.socialSignals.empathyMarkers) * 0.3 +
    similarity(dnaA.socialSignals.enthusiasm, dnaB.socialSignals.enthusiasm) * 0.3
  );

  // humor fit: do they laugh at the same things?
  const humorFit = similarity(dnaA.socialSignals.humor, dnaB.socialSignals.humor);

  // depth fit: do they want the same conversation depth?
  const depthFit = (
    similarity(dnaA.topics.depthPreference, dnaB.topics.depthPreference) * 0.5 +
    similarity(dnaA.topics.curiosityBreadth, dnaB.topics.curiosityBreadth) * 0.3 +
    // check if their needs align with what the other provides
    similarity(dnaA.needs.needsDepth, dnaB.topics.depthPreference) * 0.2
  );

  // conflict fit: how will they handle disagreements?
  const conflictStyleMatch = dnaA.conflictHandling.style === dnaB.conflictHandling.style ? 1 : 
    // some combinations work well
    (dnaA.conflictHandling.style === "collaborative" || dnaB.conflictHandling.style === "collaborative") ? 0.8 :
    (dnaA.conflictHandling.style === "avoidant" && dnaB.conflictHandling.style === "direct") ? 0.3 : 0.5;
  
  const conflictFit = (
    conflictStyleMatch * 0.5 +
    similarity(dnaA.conflictHandling.defensiveness, dnaB.conflictHandling.defensiveness) * 0.25 +
    similarity(dnaA.conflictHandling.resolutionFocus, dnaB.conflictHandling.resolutionFocus) * 0.25
  );

  return {
    styleFit: Math.round(styleFit * 100),
    paceFit: Math.round(paceFit * 100),
    warmthFit: Math.round(warmthFit * 100),
    humorFit: Math.round(humorFit * 100),
    depthFit: Math.round(depthFit * 100),
    conflictFit: Math.round(conflictFit * 100),
  };
}

// prompt for ai to generate human-readable insights
function buildInsightsPrompt(
  dnaA: ConversationDNA, 
  dnaB: ConversationDNA, 
  subscores: CompatibilityScore["subscores"],
  overall: number,
  nameA: string,
  nameB: string
): string {
  return `you are a relationship/compatibility analyst. given two conversation dna profiles and their compatibility subscores, generate insights about this pairing.

${nameA}'s dna:
${JSON.stringify(dnaA, null, 2)}

${nameB}'s dna:
${JSON.stringify(dnaB, null, 2)}

subscores (0-100):
- style fit: ${subscores.styleFit}
- pace fit: ${subscores.paceFit}
- warmth fit: ${subscores.warmthFit}
- humor fit: ${subscores.humorFit}
- depth fit: ${subscores.depthFit}
- conflict fit: ${subscores.conflictFit}

overall score: ${overall}

return ONLY valid json with this structure (no markdown, no explanation):
{
  "whyItWorks": [
    "<specific reason 1 based on their actual traits>",
    "<specific reason 2>",
    "<specific reason 3>"
  ],
  "watchOuts": [
    "<potential friction point 1 based on actual mismatches>",
    "<potential friction point 2>",
    "<potential friction point 3>"
  ],
  "dynamicPrediction": "<1-2 sentence prediction of how ${nameA} and ${nameB}'s conversations would typically go - use their actual names>"
}

IMPORTANT: always use ${nameA} and ${nameB}'s actual names in your response, never say "person a" or "person b".
be specific and reference actual traits from their profiles. avoid generic statements.`;
}

// main scoring function
export async function scorePair(state: GraphStateType): Promise<Partial<GraphStateType>> {
  if (!state.dnaA || !state.dnaB) {
    throw new Error("missing dna profiles - builddna must run first");
  }

  // step 1: calculate deterministic subscores
  const subscores = calculateSubscores(state.dnaA, state.dnaB);

  // step 2: calculate overall score (weighted average of subscores)
  // weights reflect importance of each dimension for compatibility
  const overall = Math.round(
    subscores.styleFit * 0.15 +
    subscores.paceFit * 0.15 +
    subscores.warmthFit * 0.25 +    // warmth is key for relationships
    subscores.humorFit * 0.20 +      // shared humor matters a lot
    subscores.depthFit * 0.15 +
    subscores.conflictFit * 0.10
  );

  // step 3: calculate confidence based on data quality
  const confidence = Math.round(
    (state.dnaA.confidence + state.dnaB.confidence) / 2 * 100
  );

  // step 4: use ai to generate human-readable insights
  const assistantId = await getConversationLabAssistantId();
  const thread = await backboard.createThread(assistantId);

  // get names from profiles, fallback to person a/b if missing
  const nameA = state.profileA?.name || "person a";
  const nameB = state.profileB?.name || "person b";

  const response = await backboard.addMessage(thread.threadId, {
    content: buildInsightsPrompt(state.dnaA, state.dnaB, subscores, overall, nameA, nameB),
    llm_provider: "openai",
    model_name: "gpt-4o",
    stream: false,
    temperature: 0.7, // slightly higher for more creative insights
  });

  // parse the insights
  let insights: { whyItWorks: string[]; watchOuts: string[]; dynamicPrediction: string };
  try {
    const cleaned = response.content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    insights = JSON.parse(cleaned);
  } catch {
    // fallback if parsing fails
    console.error("failed to parse insights, using defaults");
    insights = {
      whyItWorks: ["compatible communication styles", "similar energy levels", "complementary personalities"],
      watchOuts: ["may need to work on active listening", "different conflict approaches", "pace differences"],
      dynamicPrediction: "these two would likely have engaging conversations with some adjustment needed.",
    };
  }

  // build final compatibility score object
  const compatibilityScore: CompatibilityScore = {
    overall,
    confidence,
    subscores,
    whyItWorks: insights.whyItWorks,
    watchOuts: insights.watchOuts,
    dynamicPrediction: insights.dynamicPrediction,
  };

  console.log("compatibility score calculated:", compatibilityScore);

  return { 
    ...state, 
    compatibilityScore 
  };
}
