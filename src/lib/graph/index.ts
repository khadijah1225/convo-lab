import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphState, GraphStateType } from "./state";
import { parseChats } from "./nodes/parseChats";
import { buildDNA } from "./nodes/buildDNA";
import { scorePair } from "./nodes/scorePair";

export async function runConversationGraph(input: {
  chatA: string;
  chatB: string;
}) {
  const graph = new StateGraph(GraphState)
    .addNode("parse", parseChats)
    .addNode("dna", buildDNA)
    .addNode("score", scorePair)
    .addEdge(START, "parse")
    .addEdge("parse", "dna")
    .addEdge("dna", "score")
    .addEdge("score", END);

  const app = graph.compile();

  // initialize nullable fields
  const initial: GraphStateType = {
    chatA: input.chatA,
    chatB: input.chatB,
    dnaA: null,
    dnaB: null,
    compatScore: null,
  };

  return app.invoke(initial);
}
