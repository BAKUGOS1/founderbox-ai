import { NextResponse } from "next/server";
import { getAiConfigStatus } from "@/lib/ai-provider";

export async function GET() {
  const ai = getAiConfigStatus();

  return NextResponse.json({
    ai,
    github: {
      configured: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
    },
    google: {
      configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    },
    storage: {
      configured: Boolean(process.env.DATABASE_URL)
    }
  });
}
