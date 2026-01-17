import { z } from "zod";

export const CompatibilityScoreSchema = z.object({
  overall: z.number(), // 0..100
  confidence: z.number(), // 0..100
  subscores: z.object({
    styleFit: z.number(),
    paceFit: z.number(),
    warmthFit: z.number(),
    humorFit: z.number(),
    depthFit: z.number(),
    conflictFit: z.number(),
  }),
  riskFlags: z.array(z.string()).default([]),
  whyItWorks: z.array(z.string()).default([]),
  watchOuts: z.array(z.string()).default([]),
});

export type CompatibilityScore = z.infer<typeof CompatibilityScoreSchema>;
