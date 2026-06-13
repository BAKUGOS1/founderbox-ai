import { getServerSession } from "next-auth";
import { demoUser, demoWorkspace } from "@/lib/mock-data";
import { ApiError } from "@/lib/server/api";
import { authOptions } from "@/lib/server/auth";
import { isDatabaseConfigured, prisma } from "@/lib/server/prisma";

export type RequestContext = {
  userId: string;
  workspaceId: string;
  demo: boolean;
  role: string;
};

export async function getRequestContext(): Promise<RequestContext | null> {
  if (!isDatabaseConfigured()) {
    return {
      userId: demoUser.id,
      workspaceId: demoWorkspace.id,
      demo: true,
      role: "owner"
    };
  }

  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id;

  if (!email && !sessionUserId) return null;

  const user = await prisma.user.findFirst({
    where: sessionUserId ? { id: sessionUserId } : { email },
    include: {
      memberships: {
        include: { workspace: true },
        orderBy: { createdAt: "asc" },
        take: 1
      }
    }
  });

  if (!user) return null;

  const membership = user.memberships[0];
  if (!membership) {
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name || "FounderBox"} Workspace`,
        plan: "Free Demo",
        members: {
          create: {
            userId: user.id,
            role: "owner"
          }
        }
      }
    });

    return {
      userId: user.id,
      workspaceId: workspace.id,
      demo: false,
      role: "owner"
    };
  }

  return {
    userId: user.id,
    workspaceId: membership.workspaceId,
    demo: false,
    role: membership.role
  };
}

export async function requireRequestContext() {
  const context = await getRequestContext();
  if (!context) {
    throw new ApiError(401, "Authentication required.");
  }
  return context;
}

export async function assertProjectAccess(context: RequestContext, projectId: string) {
  if (context.demo) return;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: context.workspaceId
    },
    select: { id: true }
  });

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }
}
