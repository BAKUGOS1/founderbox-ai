import { NextResponse } from "next/server";
import { getAiConfigStatus } from "@/lib/ai-provider";
import { withApiHandler } from "@/lib/server/api";
import { hasWorkspaceCredential, isCredentialEncryptionConfigured } from "@/lib/server/credentials";
import { getRequestContext } from "@/lib/server/request-context";
import { isDatabaseConfigured } from "@/lib/server/prisma";
import { isFileStorageConfigured } from "@/lib/server/storage";

export async function GET() {
  return withApiHandler(async () => {
    const ai = getAiConfigStatus();
    const context = await getRequestContext();
    const workspaceOpenAiConfigured = context
      ? await hasWorkspaceCredential(context.workspaceId, "openai")
      : false;

    return NextResponse.json({
      ai: {
        configured: ai.configured || workspaceOpenAiConfigured,
        serverConfigured: ai.configured,
        workspaceConfigured: workspaceOpenAiConfigured,
        model: ai.model
      },
      auth: {
        configured: Boolean(process.env.NEXTAUTH_SECRET)
      },
      credentials: {
        encryptionConfigured: isCredentialEncryptionConfigured()
      },
      github: {
        configured: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
      },
      google: {
        configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
      },
      storage: {
        configured: isDatabaseConfigured(),
        databaseConfigured: isDatabaseConfigured(),
        fileStorageConfigured: isFileStorageConfigured()
      }
    });
  });
}
