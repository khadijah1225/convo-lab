// ============================================================================
// /api/match - main endpoint for analyzing compatibility between two profiles
// takes two profile ids, runs the full analysis pipeline, returns results
// ============================================================================

import { NextResponse } from "next/server";
import { getProfileById } from "@/lib/profiles";
import { runConversationGraph, runSimulationOnly } from "@/lib/graph";

// request body type
interface MatchRequest {
  idA: string;
  idB: string;
  includeSimulation?: boolean; // if true, generate a simulated conversation
}

export async function POST(req: Request) {
  try {
    const body: MatchRequest = await req.json();
    const { idA, idB, includeSimulation = false } = body;

    // validate inputs
    if (!idA || !idB) {
      return NextResponse.json(
        { error: "missing profile ids - need both idA and idB" },
        { status: 400 }
      );
    }

    // fetch profiles from our data
    const profileA = getProfileById(idA);
    const profileB = getProfileById(idB);

    if (!profileA) {
      return NextResponse.json(
        { error: `profile not found: ${idA}` },
        { status: 404 }
      );
    }

    if (!profileB) {
      return NextResponse.json(
        { error: `profile not found: ${idB}` },
        { status: 404 }
      );
    }

    console.log(`analyzing compatibility between ${profileA.name} and ${profileB.name}`);

    const profileDataA = {
      id: profileA.id,
      name: profileA.name,
      age: profileA.age || 0,
      occupation: profileA.occupation || "unknown",
    };

    const profileDataB = {
      id: profileB.id,
      name: profileB.name,
      age: profileB.age || 0,
      occupation: profileB.occupation || "unknown",
    };

    // run the langgraph pipeline (analysis only)
    const result = await runConversationGraph({
      chatA: profileA.chat,
      chatB: profileB.chat,
      profileA: profileDataA,
      profileB: profileDataB,
    });

    // if simulation requested, run it separately
    let simulation: string | null = null;
    if (includeSimulation) {
      simulation = await runSimulationOnly({
        profileA: profileDataA,
        profileB: profileDataB,
        dnaA: result.dnaA,
        dnaB: result.dnaB,
        compatibilityScore: result.compatibilityScore,
      });
    }

    // return structured response
    return NextResponse.json({
      pair: {
        a: {
          id: profileA.id,
          name: profileA.name,
          age: profileA.age,
          occupation: profileA.occupation,
          avatarUrl: profileA.avatarUrl,
        },
        b: {
          id: profileB.id,
          name: profileB.name,
          age: profileB.age,
          occupation: profileB.occupation,
          avatarUrl: profileB.avatarUrl,
        },
      },
      dna: {
        a: result.dnaA,
        b: result.dnaB,
      },
      score: result.compatibilityScore,
      simulation,
    });
  } catch (error: any) {
    console.error("match analysis error:", error);
    
    // provide more specific error messages
    let errorMessage = "failed to analyze compatibility";
    
    if (error.message?.includes("BACKBOARD") || error.message?.includes("apiKey")) {
      errorMessage = "ai service connection failed - check api key";
    } else if (error.message?.includes("JSON") || error.message?.includes("parse")) {
      errorMessage = "ai returned invalid response - please retry";
    } else if (error.message?.includes("timeout") || error.message?.includes("ETIMEDOUT")) {
      errorMessage = "request timed out - please retry";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
