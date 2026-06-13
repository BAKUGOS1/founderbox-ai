import { compare, hash } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { demoUser } from "@/lib/mock-data";
import { isDatabaseConfigured, prisma } from "@/lib/server/prisma";

function initialsFromName(nameOrEmail: string) {
  return nameOrEmail
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "FB";
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export const authOptions: NextAuthOptions = {
  adapter: isDatabaseConfigured() ? PrismaAdapter(prisma) : undefined,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password || "";

        if (!email || password.length < 6) return null;

        if (!isDatabaseConfigured()) {
          return {
            id: demoUser.id,
            email,
            name: email === "demo@founderbox.ai" ? demoUser.name : email.split("@")[0],
            image: null
          };
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email || "FounderBox User",
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export function buildUserProfile(input: { name?: string; email: string }) {
  const name = input.name?.trim() || input.email.split("@")[0] || "FounderBox User";
  return {
    name,
    avatarInitials: initialsFromName(name)
  };
}
