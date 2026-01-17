import { NextResponse } from "next/server";
import { z } from "zod";

const reqSchema = z.object({
  chatA: z.string().min(1),
  chatB: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const { chatA, chatB } = reqSchema.parse(body);

  // MVP stub: we’ll replace with LangGraph soon
  const dnaA = {
    personId: "A",
    style: { avgMessageLength: 80, verbosity: "medium", emojiRate: 0.2, punctuationIntensity: 0.4, formality: "casual" },
    interaction: { questionRate: 0.3, turnTakingBalance: 0.0, topicSwitchiness: 0.4 },
    socioEmotional: { warmth: 0.7, humor: 0.5, empathyMarkers: 0.6, directness: 0.6 },
    preferences: { depthPreference: "mixed", conflictStyle: "calm" },
    confidence: { dataQuality: 0.7, notes: [] },
  };

  const dnaB = {
    personId: "B",
    style: { avgMessageLength: 60, verbosity: "medium", emojiRate: 0.15, punctuationIntensity: 0.35, formality: "casual" },
    interaction: { questionRate: 0.25, turnTakingBalance: 0.0, topicSwitchiness: 0.35 },
    socioEmotional: { warmth: 0.65, humor: 0.55, empathyMarkers: 0.5, directness: 0.55 },
    preferences: { depthPreference: "mixed", conflictStyle: "calm" },
    confidence: { dataQuality: 0.7, notes: [] },
  };

  // Tiny deterministic score for now
  const score = {
    overall: 78,
    confidence: 72,
    subscores: {
      styleFit: 76,
      paceFit: 71,
      warmthFit: 79,
      humorFit: 74,
      depthFit: 82,
      conflictFit: 70,
    },
    riskFlags: [],
    whyItWorks: [
      "Similar level of warmth and directness.",
      "Comparable message lengths and pace.",
      "Both prefer a mixed depth of conversation.",
    ],
    watchOuts: [
      "If one person uses more sarcasm, clarify intent early.",
    ],
  };

  return NextResponse.json({ dnaA, dnaB, score });
}
