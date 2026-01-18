import { BackboardClient } from "backboard-sdk";

export const backboard = new BackboardClient({
  apiKey: process.env.BACKBOARD_API_KEY!,
});
