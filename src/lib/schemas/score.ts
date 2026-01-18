// ============================================================================
// zod schema for compatibility score validation
// this mirrors the type in state.ts but adds runtime validation
// ============================================================================

import { z } from "zod";

export const CompatibilityScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  subscores: z.object({
    styleFit: z.number().min(0).max(100),
    paceFit: z.number().min(0).max(100),
    warmthFit: z.number().min(0).max(100),
    humorFit: z.number().min(0).max(100),
    depthFit: z.number().min(0).max(100),
    conflictFit: z.number().min(0).max(100),
  }),
  whyItWorks: z.array(z.string()),
  watchOuts: z.array(z.string()),
  dynamicPrediction: z.string(),
});

export type CompatibilityScore = z.infer<typeof CompatibilityScoreSchema>;
