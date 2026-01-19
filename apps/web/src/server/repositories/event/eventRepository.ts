import prisma from "@/database/utils/prisma/client";
import type { SortOrderType } from "@/types/common/sort";
import { Prisma } from "@prisma/client";

export class EventRepository {
  async findById(eventId: string) {
    return prisma.event.findUnique({
      where: { id: eventId },
    });
  }

  async findByIdWithMissions(eventId: string) {
    return prisma.event.findUnique({
      where: { id: eventId },
      include: {
        missions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  async findByUserId(
    userId: string,
    options?: {
      cursor?: string;
      limit?: number;
      sortOrder?: SortOrderType;
    },
  ) {
    const limit = options?.limit ?? 10;
    const sortOrder = options?.sortOrder ?? "latest";

    return prisma.event.findMany({
      where: { creatorId: userId },
      orderBy: {
        updatedAt: sortOrder === "latest" ? "desc" : "asc",
      },
      take: limit + 1,
      ...(options?.cursor && {
        cursor: {
          id: options.cursor,
        },
        skip: 1,
      }),
    });
  }

  async create(data: Prisma.EventUncheckedCreateInput) {
    return prisma.event.create({
      data,
    });
  }

  async update(eventId: string, data: Prisma.EventUncheckedUpdateInput) {
    return prisma.event.update({
      where: { id: eventId },
      data,
    });
  }

  async delete(eventId: string) {
    return prisma.event.delete({
      where: { id: eventId },
    });
  }
}

export const eventRepository = new EventRepository();
