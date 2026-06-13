import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/server/api";
import { isDatabaseConfigured, prisma } from "@/lib/server/prisma";

const ALGORITHM = "aes-256-gcm";
const DEFAULT_LABEL = "default";

function getEncryptionKey() {
  const secret = process.env.CREDENTIAL_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

export function isCredentialEncryptionConfigured() {
  return Boolean(getEncryptionKey());
}

export function encryptSecret(secret: string) {
  const key = getEncryptionKey();
  if (!key) {
    throw new ApiError(500, "CREDENTIAL_ENCRYPTION_KEY or NEXTAUTH_SECRET is required.");
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encryptedSecret: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    keyVersion: "v1"
  };
}

export function decryptSecret(input: { encryptedSecret: string; iv: string; tag: string }) {
  const key = getEncryptionKey();
  if (!key) {
    throw new ApiError(500, "Credential encryption is not configured.");
  }

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(input.iv, "base64"));
  decipher.setAuthTag(Buffer.from(input.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(input.encryptedSecret, "base64")),
    decipher.final()
  ]).toString("utf8");
}

export async function upsertWorkspaceCredential(input: {
  workspaceId: string;
  provider: string;
  secret: string;
  label?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  if (!isDatabaseConfigured()) {
    throw new ApiError(503, "DATABASE_URL is required before storing credentials.");
  }

  const label = input.label || DEFAULT_LABEL;
  const encrypted = encryptSecret(input.secret);

  return prisma.credential.upsert({
    where: {
      workspaceId_provider_label: {
        workspaceId: input.workspaceId,
        provider: input.provider,
        label
      }
    },
    create: {
      workspaceId: input.workspaceId,
      provider: input.provider,
      label,
      metadata: input.metadata,
      ...encrypted
    },
    update: {
      metadata: input.metadata,
      configuredAt: new Date(),
      ...encrypted
    }
  });
}

export async function hasWorkspaceCredential(workspaceId: string, provider: string) {
  if (!isDatabaseConfigured()) return false;
  const count = await prisma.credential.count({
    where: { workspaceId, provider }
  });
  return count > 0;
}

export async function getWorkspaceCredentialSecret(
  workspaceId: string,
  provider: string,
  label = DEFAULT_LABEL
) {
  if (!isDatabaseConfigured()) return null;
  const credential = await prisma.credential.findUnique({
    where: {
      workspaceId_provider_label: {
        workspaceId,
        provider,
        label
      }
    }
  });

  if (!credential) return null;
  return decryptSecret(credential);
}
