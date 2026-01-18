import { Annotation } from "@langchain/langgraph";

export type ConversationDNA = {
  verbosity: number;   // 0–1
  humor: number;       // 0–1
  directness: number;  // 0–1
};

export const GraphState = Annotation.Root({
  chatA: Annotation<string>(),
  chatB: Annotation<string>(),
  dnaA: Annotation<ConversationDNA | null>(),
  dnaB: Annotation<ConversationDNA | null>(),
  compatScore: Annotation<number | null>(),
});

export type GraphStateType = typeof GraphState.State;