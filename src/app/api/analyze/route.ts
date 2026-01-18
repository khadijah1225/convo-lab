// ============================================================================
// /api/analyze - endpoint for analyzing raw chat input directly
// useful for testing or if you want to pass raw chat text instead of profile ids
// ============================================================================

import { NextResponse } from "next/server";
import { runConversationGraph } from "@/lib/graph";

interface AnalyzeRequest {
  chatA: string;
  chatB: string;
  includeSimulation?: boolean;
}

export async function POST(req: Request) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { chatA, chatB, includeSimulation = false } = body;

    if (!chatA || !chatB) {
      return NextResponse.json(
        { error: "missing chat data - need both chatA and chatB" },
        { status: 400 }
      );
    }

    console.log("analyzing raw chat input...");

    const result = await runConversationGraph({
      chatA,
      chatB,
      includeSimulation,
    });

    return NextResponse.json({
      dna: {
        a: result.dnaA,
        b: result.dnaB,
      },
      score: result.compatibilityScore,
      simulation: result.simulatedConversation,
    });
  } catch (error) {
    console.error("analyze error:", error);
    return NextResponse.json(
      { error: "failed to analyze chats", details: String(error) },
      { status: 500 }
    );
  }
}
