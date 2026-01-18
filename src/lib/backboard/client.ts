// ============================================================================
// backboard client initialization
// backboard.io is our llm gateway - it gives us access to multiple providers
// (openai, anthropic, google, etc) through a single unified api
// the api key should be set in your .env.local file as BACKBOARD_API_KEY
// ============================================================================

import { BackboardClient } from "backboard-sdk";

export const backboard = new BackboardClient({
  apiKey: process.env.BACKBOARD_API_KEY!,
});
