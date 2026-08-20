import { AuditAction, Prisma } from "../../generated/prisma/client";
import { prisma } from "../../libs/prisma";
import { agentResult } from "../../utils/userAgent";

function generateAuditDescription(
  action: AuditAction,
  resource: string,
): string {
  switch (action) {
    case "CREATE":
      return `${resource} created.`;

    case "UPDATE":
      return `${resource} updated.`;

    case "DELETE":
      return `${resource} deleted.`;

    case "LOGIN":
      return "User logged in.";

    case "LOGOUT":
      return "User logged out.";

    case "LOGIN_FAILED":
      return "User login failed.";

    case "PASSWORD_CHANGE":
      return "User password changed.";

    case "PASSWORD_RESET":
      return "User password reset.";

    case "ROLE_CHANGE":
      return `${resource} role changed.`;

    case "STATUS_CHANGE":
      return `${resource} status changed.`;

    case "EXPORT":
      return `${resource} exported.`;

    case "IMPORT":
      return `${resource} imported.`;

    default:
      return `${resource} action performed.`;
  }
}

export class AuditService {
  async create(
    prisma: Prisma.TransactionClient,
    userId: string | null,
    action: AuditAction,
    resource: string,
    resourceId: string | null,
    agent: agentResult,
    oldData?: Prisma.InputJsonValue,
    newData?: Prisma.InputJsonValue,
    meta?: Prisma.InputJsonValue,
  ) {
    const payload = {
        userId,
        action,
        resource: resource.toUpperCase(),
        resourceId: resourceId,
        description: generateAuditDescription(action, resource),
        oldValues: oldData ?? undefined,
        newValues: newData,
        metadata: meta,
        ...agent
    }

    return prisma.auditLog.create({
      data: payload,
    });
  }

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.auditLog.count({
        where: { userId },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByResource(
    resource: string,
    resourceId: string,
  ) {
    return prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.auditLog.findUnique({
      where: { id }
    });
  }
}