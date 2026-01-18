import { NextResponse } from "next/server";
import { getProfiles } from "@/lib/profiles";

export async function GET() {
  const profiles = getProfiles().map(({ chat, ...rest }) => rest);
  // Don’t send chat history to the UI unless you want to
  return NextResponse.json({ profiles });
}
