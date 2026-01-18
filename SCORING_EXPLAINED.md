# Conversation Lab: How Scoring Works

## Overview

Our compatibility scoring uses a **hybrid approach**:
1. **Deterministic math** for reproducible, explainable subscores
2. **AI (GPT-4o)** for human-readable insights and predictions

---

## The Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONVERSATION LAB PIPELINE                    │
└─────────────────────────────────────────────────────────────────┘

     PERSON A's CHATS                    PERSON B's CHATS
            │                                   │
            ▼                                   ▼
    ┌───────────────┐                   ┌───────────────┐
    │    GPT-4o     │                   │    GPT-4o     │
    │  Extract DNA  │                   │  Extract DNA  │
    │  + Confidence │                   │  + Confidence │
    └───────┬───────┘                   └───────┬───────┘
            │                                   │
            │         ┌─────────────┐           │
            └────────►│    MATH     │◄──────────┘
                      │ (subscores) │
                      └──────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │   GPT-4o    │
                      │  Insights   │
                      └──────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │   RESULT    │
                      └─────────────┘
                             │
                             ▼ (optional)
                      ┌─────────────┐
                      │   CLAUDE    │
                      │  Simulate   │
                      │   Convo     │
                      └─────────────┘
```

---

## 1. Conversation DNA Extraction (GPT-4o)

Each person's chat history is analyzed to extract 20+ traits across 6 categories:

| Category | Example Traits |
|----------|----------------|
| **Style** | verbosity, emoji usage, formality, slang level |
| **Interaction** | question rate, response depth, turn-taking |
| **Social Signals** | warmth, humor, empathy, directness, flirting |
| **Topics** | dominant themes, depth preference, curiosity |
| **Conflict** | avoidant vs direct, defensiveness, resolution focus |
| **Needs** | reassurance, space, playfulness, depth |

---

## 2. Confidence Score (0-100%)

### What it measures:
**How confident the AI is in the DNA extraction** (not the compatibility prediction)

### Why chat length matters:

| Messages Analyzed | Confidence | Reasoning |
|-------------------|------------|-----------|
| 5 messages | ~50% | Might catch them on an unusual day |
| 20 messages | ~75% | Starting to see consistent patterns |
| 50+ messages | ~90%+ | Rich data across different contexts |

### Formula:
```
Confidence = (Person_A_confidence + Person_B_confidence) / 2 × 100
```

### Factors that increase confidence:
- More messages analyzed
- Variety in conversation topics
- Messages across different moods/situations
- Longer, more expressive messages

### What it tells users:
> "We had enough data to be confident about these DNA profiles"

---

## 3. Subscores (0-100 each)

Each subscore is calculated using **pure math** - comparing the two DNA profiles:

### Similarity Formula:
```
similarity = 100 - |value_A - value_B| × 100
```

Example: If Person A has warmth = 0.8 and Person B has warmth = 0.6:
```
similarity = 100 - |0.8 - 0.6| × 100 = 100 - 20 = 80%
```

### Subscore Calculations:

| Subscore | Components |
|----------|------------|
| **Style Fit** | Average of: verbosity, emoji, formality, slang similarity |
| **Pace Fit** | initiationRate (40%) + turnTaking (40%) + responseDepth (20%) |
| **Warmth Fit** | warmth (50%) + empathy (30%) + enthusiasm (20%) |
| **Humor Fit** | Direct humor score comparison |
| **Depth Fit** | depthPreference (60%) + curiosityBreadth (40%) |
| **Conflict Fit** | conflictStyle (50%) + defensiveness (25%) + resolution (25%) |

---

## 4. Overall Score (0-100%)

The overall score is a **weighted average** of all subscores:

```
Overall = (Style × 0.15) + (Pace × 0.15) + (Warmth × 0.25) + 
          (Humor × 0.20) + (Depth × 0.15) + (Conflict × 0.10)
```

### Why these weights?

| Subscore | Weight | Research Basis |
|----------|--------|----------------|
| **Warmth** | 25% | Emotional connection is the #1 predictor of relationship success |
| **Humor** | 20% | Shared humor builds bonds and helps navigate conflict |
| **Style** | 15% | Communication style mismatches cause daily friction |
| **Pace** | 15% | Response timing affects perceived interest/care |
| **Depth** | 15% | Matching depth preferences prevents boredom/overwhelm |
| **Conflict** | 10% | Important but less frequent than daily interaction |

---

## 5. AI-Generated Insights (GPT-4o)

After math calculations, we use AI to generate:

1. **"Why It Works"** - 3 specific strengths of the pairing
2. **"Watch Outs"** - 3 potential friction points
3. **"Dynamic Prediction"** - How their conversations would likely flow

The AI receives:
- Both DNA profiles
- All calculated subscores
- The overall score

And translates the numbers into human-readable insights.

---

## 6. Conversation Simulation (Claude Sonnet 4) - Optional

If requested, Claude generates a realistic sample conversation:
- Uses both DNA profiles as character guides
- Matches each person's style, pace, humor, etc.
- Shows how they'd likely interact

---

## Tech Stack Summary

| Component | Technology | Purpose |
|-----------|------------|---------|
| Orchestration | **LangGraph** | Chains the pipeline steps |
| LLM Gateway | **Backboard.io** | Routes to OpenAI/Anthropic |
| DNA Extraction | **GPT-4o** | Analyzes chat patterns |
| Scoring | **Math** | Deterministic calculations |
| Insights | **GPT-4o** | Human-readable explanations |
| Simulation | **Claude Sonnet 4** | Creative conversation generation |

---

## Key Selling Points

1. **Transparent** - Users see exactly how each dimension scored
2. **Reproducible** - Math-based subscores give same result every time
3. **Explainable** - AI provides reasons, not just a number
4. **Research-informed** - Weights based on relationship psychology
5. **Actionable** - Watch-outs help couples work on weak areas

---

## Example Output

```
Jordan × Maya: 72% Compatible

Subscores:
├── Style:    71%  (Jordan is formal, Maya is casual)
├── Pace:     93%  (Both respond at similar speeds)
├── Warmth:   54%  (Maya is warmer, Jordan more reserved)
├── Humor:    60%  (Different humor styles)
├── Depth:    84%  (Both enjoy meaningful conversations)
└── Conflict: 90%  (Both collaborative problem-solvers)

Confidence: 85% (based on 40+ messages each)
```

---

*Built for UofTHacks - January 2026*
