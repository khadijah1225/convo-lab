// ============================================================================
// zod schema for conversation dna validation
// this mirrors the type in state.ts but adds runtime validation
// useful for validating llm outputs before using them
// ============================================================================

import { z } from "zod";

export const ConversationDNASchema = z.object({
  style: z.object({
    verbosity: z.number().min(0).max(1),
    emojiUsage: z.number().min(0).max(1),
    punctuationStyle: z.number().min(0).max(1),
    slangLevel: z.number().min(0).max(1),
    formality: z.number().min(0).max(1),
  }),
  interaction: z.object({
    questionRate: z.number().min(0).max(1),
    responseDepth: z.number().min(0).max(1),
    initiationRate: z.number().min(0).max(1),
    turnTakingBalance: z.number().min(0).max(1),
  }),
  socialSignals: z.object({
    warmth: z.number().min(0).max(1),
    humor: z.number().min(0).max(1),
    empathyMarkers: z.number().min(0).max(1),
    directness: z.number().min(0).max(1),
    flirtingIntensity: z.number().min(0).max(1),
    enthusiasm: z.number().min(0).max(1),
  }),
  topics: z.object({
    dominantThemes: z.array(z.string()),
    curiosityBreadth: z.number().min(0).max(1),
    depthPreference: z.number().min(0).max(1),
    avoidsTopics: z.array(z.string()),
  }),
  conflictHandling: z.object({
    style: z.enum(["avoidant", "accommodating", "direct", "collaborative"]),
    defensiveness: z.number().min(0).max(1),
    resolutionFocus: z.number().min(0).max(1),
  }),
  needs: z.object({
    needsReassurance: z.number().min(0).max(1),
    needsSpace: z.number().min(0).max(1),
    needsPlayfulness: z.number().min(0).max(1),
    needsDepth: z.number().min(0).max(1),
    needsDirectness: z.number().min(0).max(1),
  }),
  confidence: z.number().min(0).max(1),
  chatLength: z.number().int().nonnegative(),
  notes: z.array(z.string()),
});

export type ConversationDNA = z.infer<typeof ConversationDNASchema>;
