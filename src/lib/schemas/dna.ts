import { z } from "zod";

export const ConversationDNASchema = z.object({
  personId: z.string(),
  style: z.object({
    avgMessageLength: z.number(),
    verbosity: z.enum(["low", "medium", "high"]),
    emojiRate: z.number(), // 0..1
    punctuationIntensity: z.number(), // 0..1
    formality: z.enum(["casual", "balanced", "formal"]),
  }),
  interaction: z.object({
    questionRate: z.number(), // 0..1
    turnTakingBalance: z.number(), // -1..1 (negative = other dominates)
    topicSwitchiness: z.number(), // 0..1
  }),
  socioEmotional: z.object({
    warmth: z.number(), // 0..1
    humor: z.number(), // 0..1
    empathyMarkers: z.number(), // 0..1
    directness: z.number(), // 0..1
  }),
  preferences: z.object({
    depthPreference: z.enum(["smalltalk", "mixed", "deep"]),
    conflictStyle: z.enum(["avoidant", "calm", "direct", "escalatory"]).optional(),
  }),
  confidence: z.object({
    dataQuality: z.number(), // 0..1
    notes: z.array(z.string()).default([]),
  }),
});

export type ConversationDNA = z.infer<typeof ConversationDNASchema>;
