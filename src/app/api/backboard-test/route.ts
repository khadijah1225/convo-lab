import { NextResponse } from "next/server";
import { backboard } from "@/lib/backboard/client";
import { getConversationLabAssistantId } from "@/lib/backboard/assistant";

export async function GET() {
  const assistantId = await getConversationLabAssistantId();
  const thread = await backboard.createThread(assistantId);

  const response = await backboard.addMessage(thread.threadId, {
    content: "Reply with exactly: OK",
    stream: false,
  });

  return NextResponse.json({ reply: response.content });
}
