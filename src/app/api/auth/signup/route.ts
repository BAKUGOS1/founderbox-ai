import { NextResponse } from "next/server";
import { z } from "zod";
import { buildUserProfile, hashPassword } from "@/lib/server/auth";
import { withApiHandler } from "@/lib/server/api";
import { isDatabaseConfigured, prisma } from "@/lib/server/prisma";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const signupSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "auth:signup", 8, 60_000);
    const input = signupSchema.parse(await request.json());
    const email = input.email.toLowerCase().trim();

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, mode: "demo" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.passwordHash) {
      return NextResponse.json({ error: "Account already exists." }, { status: 409 });
    }

    const profile = buildUserProfile({ name: input.name, email });
    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: profile.name,
        avatarInitials: profile.avatarInitials,
        passwordHash,
        memberships: {
          create: {
            role: "owner",
            workspace: {
              create: {
                name: `${profile.name}'s Workspace`,
                plan: "Free Demo"
              }
            }
          }
        }
      },
      update: {
        name: profile.name,
        avatarInitials: profile.avatarInitials,
        passwordHash
      }
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarInitials: user.avatarInitials
      }
    });
  });
}
