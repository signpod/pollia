import prisma from "@/database/utils/prisma/client";
import { Prisma, SearchSyncStatus } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

export class SearchSyncOutboxRepository {
  async create(
    data: Prisma.SearchSyncOutboxUncheckedCreateInput,
    client: TransactionClient = prisma,
  ) {
    return client.searchSyncOutbox.create({
      data,
    });
  }

  async createMany(
    data: Prisma.SearchSyncOutboxCreateManyInput[],
    client: TransactionClient = prisma,
  ) {
    return client.searchSyncOutbox.createMany({
      data,
    });
  }

  async findPending(limit: number, now: Date, client: TransactionClient = prisma) {
    return client.searchSyncOutbox.findMany({
      where: {
        status: SearchSyncStatus.PENDING,
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async markProcessing(ids: string[], client: TransactionClient = prisma) {
    if (ids.length === 0) {
      return { count: 0 };
    }

    return client.searchSyncOutbox.updateMany({
      where: {
        id: { in: ids },
        status: SearchSyncStatus.PENDING,
      },
      data: {
        status: SearchSyncStatus.PROCESSING,
        errorMessage: null,
      },
    });
  }

  async markDone(id: string, processedAt: Date = new Date(), client: TransactionClient = prisma) {
    return client.searchSyncOutbox.update({
      where: { id },
      data: {
        status: SearchSyncStatus.DONE,
        processedAt,
        errorMessage: null,
      },
    });
  }

  async markFailed(
    id: string,
    retryCount: number,
    nextRetryAt: Date | null,
    errorMessage: string,
    client: TransactionClient = prisma,
  ) {
    return client.searchSyncOutbox.update({
      where: { id },
      data: {
        status: SearchSyncStatus.FAILED,
        retryCount,
        nextRetryAt,
        errorMessage,
      },
    });
  }
}

export const searchSyncOutboxRepository = new SearchSyncOutboxRepository();
