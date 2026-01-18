// ============================================================================
// langgraph pipeline for conversation compatibility analysis
// this orchestrates the flow: parse → extract dna → score → (optionally) simulate
// ============================================================================

import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphState, GraphStateType, ConversationDNA, CompatibilityScore } from "./state";
import { parseChats } from "./nodes/parseChats";
import { buildDNA } from "./nodes/buildDNA";
import { scorePair } from "./nodes/scorePair";
import { simulateConvo } from "./nodes/simulateConvo";

// input type for running the graph
export interface ConversationGraphInput {
  chatA: string;
  chatB: string;
  profileA?: { id: string; name: string; age: number; occupation: string };
  profileB?: { id: string; name: string; age: number; occupation: string };
  includeSimulation?: boolean; // whether to generate a simulated conversation
}

// output type from the graph
export interface ConversationGraphOutput {
  dnaA: ConversationDNA;
  dnaB: ConversationDNA;
  compatibilityScore: CompatibilityScore;
  simulatedConversation: string | null;
}

// run the analysis pipeline (without simulation)
export async function runConversationGraph(input: ConversationGraphInput): Promise<ConversationGraphOutput> {
  // build graph without simulation - keeps it simple and avoids langgraph conditional edge issues
  const graph = new StateGraph(GraphState)
    .addNode("parse", parseChats)
    .addNode("dna", buildDNA)
    .addNode("score", scorePair)
    .addEdge(START, "parse")
    .addEdge("parse", "dna")
    .addEdge("dna", "score")
    .addEdge("score", END);

  const app = graph.compile();

  // initialize the state with all nullable fields
  const initial: GraphStateType = {
    chatA: input.chatA,
    chatB: input.chatB,
    profileA: input.profileA || null,
    profileB: input.profileB || null,
    dnaA: null,
    dnaB: null,
    compatibilityScore: null,
    simulatedConversation: null,
  };

  console.log("starting conversation analysis pipeline...");
  const result = await app.invoke(initial);
  console.log("pipeline complete!");

  // validate we got results
  if (!result.dnaA || !result.dnaB || !result.compatibilityScore) {
    throw new Error("pipeline failed to produce complete results");
  }

  return {
    dnaA: result.dnaA,
    dnaB: result.dnaB,
    compatibilityScore: result.compatibilityScore,
    simulatedConversation: null,
  };
}

// run simulation separately (called after initial analysis if user wants it)
export async function runSimulationOnly(input: {
  profileA: { id: string; name: string; age: number; occupation: string } | null;
  profileB: { id: string; name: string; age: number; occupation: string } | null;
  dnaA: ConversationDNA;
  dnaB: ConversationDNA;
  compatibilityScore: CompatibilityScore;
}): Promise<string> {
  // build a simple graph just for simulation
  const graph = new StateGraph(GraphState)
    .addNode("simulate", simulateConvo)
    .addEdge(START, "simulate")
    .addEdge("simulate", END);

  const app = graph.compile();

  const state: GraphStateType = {
    chatA: "",
    chatB: "",
    profileA: input.profileA,
    profileB: input.profileB,
    dnaA: input.dnaA,
    dnaB: input.dnaB,
    compatibilityScore: input.compatibilityScore,
    simulatedConversation: null,
  };

  console.log("generating conversation simulation...");
  const result = await app.invoke(state);
  console.log("simulation complete!");

  return result.simulatedConversation || "";
}

// convenience function to just get dna without scoring (for debugging/testing)
export async function extractDNAOnly(chat: string): Promise<ConversationDNA> {
  const graph = new StateGraph(GraphState)
    .addNode("parse", parseChats)
    .addNode("dna", buildDNA)
    .addEdge(START, "parse")
    .addEdge("parse", "dna")
    .addEdge("dna", END);

  const app = graph.compile();

  const result = await app.invoke({
    chatA: chat,
    chatB: "",
    profileA: null,
    profileB: null,
    dnaA: null,
    dnaB: null,
    compatibilityScore: null,
    simulatedConversation: null,
  });

  if (!result.dnaA) {
    throw new Error("failed to extract dna");
  }

  return result.dnaA;
}

// re-export types for convenience
export type { ConversationDNA, CompatibilityScore } from "./state";
