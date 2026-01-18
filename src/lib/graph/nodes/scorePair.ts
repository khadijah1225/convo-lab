import { GraphStateType } from "../state";

export async function scorePair(
  state: GraphStateType
): Promise<Partial<GraphStateType>> {
  if (!state.dnaA || !state.dnaB) throw new Error("Missing DNA");

  const diff =
    Math.abs(state.dnaA.verbosity - state.dnaB.verbosity) +
    Math.abs(state.dnaA.humor - state.dnaB.humor) +
    Math.abs(state.dnaA.directness - state.dnaB.directness);

  const score = Math.max(0, 100 - diff * 100);
  return { compatScore: score };
}
