import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export function isFileStorageConfigured() {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_REGION &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );
}

function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
    }
  });
}

export async function putWorkspaceObject(input: {
  workspaceId: string;
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
}) {
  if (!isFileStorageConfigured()) {
    throw new Error("S3-compatible file storage is not configured.");
  }

  const bucket = process.env.S3_BUCKET || "";
  const storageKey = `workspaces/${input.workspaceId}/${input.key}`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      Body: input.body,
      ContentType: input.contentType
    })
  );

  return {
    bucket,
    key: storageKey
  };
}
