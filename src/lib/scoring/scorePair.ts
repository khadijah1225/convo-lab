// to be changed - this is a simple deterministic scorer

import type { ConversationDNA } from "@/lib/schemas/dna";
import type { CompatibilityScore } from "@/lib/schemas/score";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function similarity01(a: number, b: number) {
  // 1 = same, 0 = far
  return 1 - clamp(Math.abs(a - b), 0, 1);
}

export function scorePair(a: ConversationDNA, b: ConversationDNA): CompatibilityScore {
  // Style similarity
  const emojiFit = similarity01(a.style.emojiRate, b.style.emojiRate);
  const punctFit = similarity01(a.style.punctuationIntensity, b.style.punctuationIntensity);

  const warmthFit01 = similarity01(a.socioEmotional.warmth, b.socioEmotional.warmth);
  const humorFit01 = similarity01(a.socioEmotional.humor, b.socioEmotional.humor);
  const directFit01 = similarity01(a.socioEmotional.directness, b.socioEmotional.directness);

  // Pace proxy: verbosity + avg message length
  const lenFit = 1 - clamp(Math.abs(a.style.avgMessageLength - b.style.avgMessageLength) / 200, 0, 1);
  const paceFit01 = (lenFit + directFit01) / 2;

  // Depth fit (simple)
  const depthMap: Record<string, number> = { smalltalk: 0, mixed: 0.5, deep: 1 };
  const depthFit01 = similarity01(depthMap[a.preferences.depthPreference], depthMap[b.preferences.depthPreference]);

  // Conflict fit (if missing, neutral)
  const conflictMap: Record<string, number> = { avoidant: 0.2, calm: 0.6, direct: 0.8, escalatory: 0.0 };
  const ca = a.preferences.conflictStyle ? conflictMap[a.preferences.conflictStyle] : 0.6;
  const cb = b.preferences.conflictStyle ? conflictMap[b.preferences.conflictStyle] : 0.6;
  const conflictFit01 = similarity01(ca, cb);

  const styleFit01 = (emojiFit + punctFit) / 2;
  const warmthFit = warmthFit01;
  const humorFit = humorFit01;

  // Weighted overall (0..1)
  const overall01 =
    0.30 * styleFit01 +
    0.20 * paceFit01 +
    0.20 * warmthFit +
    0.15 * humorFit +
    0.10 * depthFit01 +
    0.05 * conflictFit01;

  // Confidence from data quality
  const conf01 = (a.confidence.dataQuality + b.confidence.dataQuality) / 2;

  // Risk flags (basic)
  const riskFlags: string[] = [];
  if (styleFit01 < 0.4) riskFlags.push("Different communication styles (emoji/punctuation/energy mismatch).");
  if (depthFit01 < 0.4) riskFlags.push("Different depth preference (small talk vs deep talk mismatch).");
  if (humorFit01 < 0.3) riskFlags.push("Humor mismatch risk (one jokes more than the other).");

  const overall = Math.round(overall01 * 100);
  const confidence = Math.round(clamp(conf01 * 100, 0, 100));

  return {
    overall,
    confidence,
    subscores: {
      styleFit: Math.round(styleFit01 * 100),
      paceFit: Math.round(paceFit01 * 100),
      warmthFit: Math.round(warmthFit * 100),
      humorFit: Math.round(humorFit * 100),
      depthFit: Math.round(depthFit01 * 100),
      conflictFit: Math.round(conflictFit01 * 100),
    },
    riskFlags,
    whyItWorks: [],
    watchOuts: [],
  };
}
