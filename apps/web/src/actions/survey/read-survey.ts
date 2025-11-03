"use server";

import { SortOrderType } from "@/atoms/me/searchAtoms";
import prisma from "@/database/utils/prisma/client";
import { GetUserSurveysResponse } from "@/types/dto";
import { requireAuth } from "../common/auth";

interface GetUserSurveysOptions {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
}

export async function getUserSurveys(
  options?: GetUserSurveysOptions,
): Promise<GetUserSurveysResponse & { nextCursor?: string }> {
  const user = await requireAuth();
  const limit = options?.limit ?? 10;

  const surveys = await prisma.survey.findMany({
    where: { creatorId: user.id },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: options?.sortOrder === "latest" ? "desc" : "asc",
    },
    take: limit + 1,
    ...(options?.cursor && {
      cursor: {
        id: options.cursor,
      },
      skip: 1,
    }),
  });

  let nextCursor: string | undefined = undefined;
  if (surveys.length > limit) {
    const nextItem = surveys.pop();
    nextCursor = nextItem?.id;
  }

  return { data: surveys, nextCursor };
}
