import { Annotation } from "@langchain/langgraph";

// ============================================================================
// conversation dna - the structured "fingerprint" of how someone communicates
// this is what we extract from chat history to understand compatibility
// ============================================================================
export type ConversationDNA = {
  // style: how they write messages
  style: {
    verbosity: number;           // 0-1: how long are their messages on average
    emojiUsage: number;          // 0-1: frequency of emoji/emoticon use
    punctuationStyle: number;    // 0-1: 0=minimal, 1=heavy (!!! vs .)
    slangLevel: number;          // 0-1: casual slang vs formal language
    formality: number;           // 0-1: casual chat vs professional tone
  };

  // interaction: how they engage in back-and-forth
  interaction: {
    questionRate: number;        // 0-1: how often they ask questions
    responseDepth: number;       // 0-1: do they give one-word or detailed replies
    initiationRate: number;      // 0-1: do they start convos or wait
    turnTakingBalance: number;   // 0-1: 0.5 = balanced, <0.5 = more listening
  };

  // social signals: emotional/relational patterns
  socialSignals: {
    warmth: number;              // 0-1: affectionate, friendly language
    humor: number;               // 0-1: jokes, sarcasm, playfulness
    empathyMarkers: number;      // 0-1: validation, understanding, support
    directness: number;          // 0-1: straight to point vs beating around bush
    flirtingIntensity: number;   // 0-1: romantic/playful undertones
    enthusiasm: number;          // 0-1: energy and excitement in messages
  };

  // topics: what they talk about
  topics: {
    dominantThemes: string[];    // top 3-5 topics they gravitate toward
    curiosityBreadth: number;    // 0-1: narrow interests vs wide-ranging
    depthPreference: number;     // 0-1: surface chat vs deep philosophical
    avoidsTopics: string[];      // topics they seem to shy away from
  };

  // conflict: how they handle disagreement
  conflictHandling: {
    style: "avoidant" | "accommodating" | "direct" | "collaborative";
    defensiveness: number;       // 0-1: how quickly they get defensive
    resolutionFocus: number;     // 0-1: problem-solving vs venting
  };

  // needs: what they seem to want from conversations
  needs: {
    needsReassurance: number;    // 0-1: seeks validation
    needsSpace: number;          // 0-1: prefers independence in convo
    needsPlayfulness: number;    // 0-1: wants banter and fun
    needsDepth: number;          // 0-1: craves meaningful discussion
    needsDirectness: number;     // 0-1: appreciates straight talk
  };

  // metadata about this extraction
  confidence: number;            // 0-1: how confident we are in this profile
  chatLength: number;            // number of messages analyzed
  notes: string[];               // any observations or caveats
};

// ============================================================================
// compatibility score - the result of comparing two dna profiles
// ============================================================================
export type CompatibilityScore = {
  overall: number;               // 0-100: final compatibility score
  confidence: number;            // 0-100: how confident we are in this score
  
  // subscores for different compatibility dimensions
  subscores: {
    styleFit: number;            // 0-100: communication style match
    paceFit: number;             // 0-100: conversation rhythm match
    warmthFit: number;           // 0-100: emotional tone compatibility
    humorFit: number;            // 0-100: humor style alignment
    depthFit: number;            // 0-100: conversation depth preference match
    conflictFit: number;         // 0-100: how well conflict styles mesh
  };

  // human-readable insights
  whyItWorks: string[];          // top 3 reasons this pairing works
  watchOuts: string[];           // top 3 potential friction points
  dynamicPrediction: string;     // brief prediction of how theyd interact
};

// ============================================================================
// the langgraph state that flows through our pipeline
// ============================================================================
export const GraphState = Annotation.Root({
  // inputs
  chatA: Annotation<string>(),
  chatB: Annotation<string>(),
  profileA: Annotation<{ id: string; name: string; age: number; occupation: string } | null>(),
  profileB: Annotation<{ id: string; name: string; age: number; occupation: string } | null>(),
  
  // intermediate results (filled by nodes)
  dnaA: Annotation<ConversationDNA | null>(),
  dnaB: Annotation<ConversationDNA | null>(),
  
  // final outputs
  compatibilityScore: Annotation<CompatibilityScore | null>(),
  simulatedConversation: Annotation<string | null>(),
});

export type GraphStateType = typeof GraphState.State;