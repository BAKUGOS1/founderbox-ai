import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Invalid request body.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error." }, { status: 500 });
}

export async function withApiHandler(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    return apiError(error);
  }
}

export function assertDatabaseReady() {
  if (!process.env.DATABASE_URL) {
    throw new ApiError(503, "DATABASE_URL is required for this production API.");
  }
}
