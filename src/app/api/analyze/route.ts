import { NextResponse } from "next/server";
import { runConversationGraph } from "@/lib/graph";

export async function POST(req: Request) {
  const { chatA, chatB } = await req.json();

  const result = await runConversationGraph({
    chatA,
    chatB,
  });

  return NextResponse.json(result);
}
