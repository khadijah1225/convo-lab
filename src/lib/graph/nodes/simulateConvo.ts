// ============================================================================
// simulateconvo node - generates a hypothetical conversation between two people
// this uses both dna profiles to create a realistic simulation of how they'd interact
// only runs if explicitly requested (after user clicks "match")
// ============================================================================

import { GraphStateType, ConversationDNA } from "../state";
import { backboard } from "@/lib/backboard/client";
import { getConversationLabAssistantId } from "@/lib/backboard/assistant";

// build a detailed prompt for conversation simulation
function buildSimulationPrompt(
  profileA: { name: string; age: number; occupation: string } | null,
  profileB: { name: string; age: number; occupation: string } | null,
  dnaA: ConversationDNA,
  dnaB: ConversationDNA,
  dynamicPrediction: string
): string {
  const nameA = profileA?.name || "person a";
  const nameB = profileB?.name || "person b";
  const occupationA = profileA?.occupation || "unknown";
  const occupationB = profileB?.occupation || "unknown";

  return `you are simulating a realistic first conversation between two people who just matched on a dating app. use their conversation dna profiles to authentically capture how each person texts.

${nameA} (${profileA?.age || "?"}, ${occupationA}):
- style: verbosity ${dnaA.style.verbosity.toFixed(2)}, emoji usage ${dnaA.style.emojiUsage.toFixed(2)}, slang level ${dnaA.style.slangLevel.toFixed(2)}
- social: warmth ${dnaA.socialSignals.warmth.toFixed(2)}, humor ${dnaA.socialSignals.humor.toFixed(2)}, directness ${dnaA.socialSignals.directness.toFixed(2)}
- topics they like: ${dnaA.topics.dominantThemes.join(", ")}
- needs: ${dnaA.needs.needsPlayfulness > 0.6 ? "banter" : ""} ${dnaA.needs.needsDepth > 0.6 ? "depth" : ""} ${dnaA.needs.needsDirectness > 0.6 ? "directness" : ""}

${nameB} (${profileB?.age || "?"}, ${occupationB}):
- style: verbosity ${dnaB.style.verbosity.toFixed(2)}, emoji usage ${dnaB.style.emojiUsage.toFixed(2)}, slang level ${dnaB.style.slangLevel.toFixed(2)}
- social: warmth ${dnaB.socialSignals.warmth.toFixed(2)}, humor ${dnaB.socialSignals.humor.toFixed(2)}, directness ${dnaB.socialSignals.directness.toFixed(2)}
- topics they like: ${dnaB.topics.dominantThemes.join(", ")}
- needs: ${dnaB.needs.needsPlayfulness > 0.6 ? "banter" : ""} ${dnaB.needs.needsDepth > 0.6 ? "depth" : ""} ${dnaB.needs.needsDirectness > 0.6 ? "directness" : ""}

predicted dynamic: ${dynamicPrediction}

generate a natural 15-20 message conversation between them. it should:
1. start with one person initiating (based on who has higher initiationRate)
2. reflect each person's actual texting style (message length, emoji use, humor, warmth)
3. naturally touch on topics they'd both find interesting
4. show their chemistry (or friction) authentically
5. feel like a real dating app convo, not scripted

format as:
${nameA}: message here
${nameB}: response here
(continue alternating)

do NOT include any commentary or explanation. just the conversation.`;
}

// main simulation function
export async function simulateConvo(state: GraphStateType): Promise<Partial<GraphStateType>> {
  // check we have what we need
  if (!state.dnaA || !state.dnaB || !state.compatibilityScore) {
    throw new Error("missing dna or compatibility score - previous nodes must run first");
  }

  const assistantId = await getConversationLabAssistantId();
  const thread = await backboard.createThread(assistantId);

  // use claude for more natural conversation generation
  // anthropic models tend to be great at creative/conversational tasks
  const response = await backboard.addMessage(thread.threadId, {
    content: buildSimulationPrompt(
      state.profileA,
      state.profileB,
      state.dnaA,
      state.dnaB,
      state.compatibilityScore.dynamicPrediction
    ),
    llm_provider: "anthropic",
    model_name: "claude-sonnet-4-20250514",
    stream: false,
    temperature: 0.8, // higher temp for more natural/varied conversation
  });

  console.log("simulated conversation generated");

  return {
    ...state,
    simulatedConversation: response.content.trim(),
  };
}
