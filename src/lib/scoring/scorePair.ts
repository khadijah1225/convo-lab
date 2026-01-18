// ============================================================================
// deterministic scoring utilities
// these are pure functions for calculating compatibility subscores
// the main scoring logic is in the langgraph node, but these can be used
// for testing or if you want to run scoring without the ai insights
// ============================================================================

import type { ConversationDNA } from "@/lib/graph/state";
import type { CompatibilityScore } from "@/lib/graph/state";

// helper: clamp a number between min and max
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// helper: calculate similarity between two 0-1 values (1 = identical, 0 = opposite)
function similarity(a: number, b: number): number {
  return 1 - Math.abs(a - b);
}

// helper: check if values complement each other
function complementarity(a: number, b: number): number {
  return 1 - Math.abs((a + b) - 1);
}

// deterministic scoring function - no ai needed
// useful for quick calculations or testing
export function scorePairDeterministic(a: ConversationDNA, b: ConversationDNA): CompatibilityScore {
  // style fit: how similar are their writing styles?
  const styleFit = (
    similarity(a.style.verbosity, b.style.verbosity) * 0.25 +
    similarity(a.style.emojiUsage, b.style.emojiUsage) * 0.2 +
    similarity(a.style.punctuationStyle, b.style.punctuationStyle) * 0.15 +
    similarity(a.style.slangLevel, b.style.slangLevel) * 0.2 +
    similarity(a.style.formality, b.style.formality) * 0.2
  );

  // pace fit: conversation rhythm match
  const paceFit = (
    similarity(a.interaction.responseDepth, b.interaction.responseDepth) * 0.3 +
    similarity(a.interaction.turnTakingBalance, b.interaction.turnTakingBalance) * 0.3 +
    complementarity(a.interaction.questionRate, b.interaction.responseDepth) * 0.4
  );

  // warmth fit: emotional tone
  const warmthFit = (
    similarity(a.socialSignals.warmth, b.socialSignals.warmth) * 0.4 +
    similarity(a.socialSignals.empathyMarkers, b.socialSignals.empathyMarkers) * 0.3 +
    similarity(a.socialSignals.enthusiasm, b.socialSignals.enthusiasm) * 0.3
  );

  // humor fit
  const humorFit = similarity(a.socialSignals.humor, b.socialSignals.humor);

  // depth fit
  const depthFit = (
    similarity(a.topics.depthPreference, b.topics.depthPreference) * 0.5 +
    similarity(a.topics.curiosityBreadth, b.topics.curiosityBreadth) * 0.3 +
    similarity(a.needs.needsDepth, b.topics.depthPreference) * 0.2
  );

  // conflict fit
  const conflictStyleMatch = a.conflictHandling.style === b.conflictHandling.style ? 1 : 
    (a.conflictHandling.style === "collaborative" || b.conflictHandling.style === "collaborative") ? 0.8 :
    (a.conflictHandling.style === "avoidant" && b.conflictHandling.style === "direct") ? 0.3 : 0.5;
  
  const conflictFit = (
    conflictStyleMatch * 0.5 +
    similarity(a.conflictHandling.defensiveness, b.conflictHandling.defensiveness) * 0.25 +
    similarity(a.conflictHandling.resolutionFocus, b.conflictHandling.resolutionFocus) * 0.25
  );

  // calculate overall with weights
  const overall = Math.round(
    styleFit * 15 +
    paceFit * 15 +
    warmthFit * 25 +
    humorFit * 20 +
    depthFit * 15 +
    conflictFit * 10
  );

  // confidence based on data quality
  const confidence = Math.round((a.confidence + b.confidence) / 2 * 100);

  return {
    overall,
    confidence,
    subscores: {
      styleFit: Math.round(styleFit * 100),
      paceFit: Math.round(paceFit * 100),
      warmthFit: Math.round(warmthFit * 100),
      humorFit: Math.round(humorFit * 100),
      depthFit: Math.round(depthFit * 100),
      conflictFit: Math.round(conflictFit * 100),
    },
    whyItWorks: [], // deterministic version doesnt generate these
    watchOuts: [],
    dynamicPrediction: "",
  };
}
