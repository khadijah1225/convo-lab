import { NextResponse } from "next/server";
import { getProfileById } from "@/lib/profiles";
import { runConversationGraph } from "@/lib/graph"; // your LangGraph runner

export async function POST(req: Request) {
  const { idA, idB } = await req.json();

  const a = getProfileById(idA);
  const b = getProfileById(idB);

  if (!a || !b) {
    return NextResponse.json(
      { error: "Invalid profile id(s)" },
      { status: 400 }
    );
  }

  const result = await runConversationGraph({
    chatA: a.chat,
    chatB: b.chat,
  });

  return NextResponse.json({
    pair: {
      a: { id: a.id, name: a.name, age: a.age, occupation: a.occupation, avatarUrl: a.avatarUrl },
      b: { id: b.id, name: b.name, age: b.age, occupation: b.occupation, avatarUrl: b.avatarUrl }
    },
    result,
  });
}
