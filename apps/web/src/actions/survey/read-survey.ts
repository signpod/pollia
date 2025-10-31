"use server";

import prisma from "@/database/utils/prisma/client";
import { requireAuth } from "../common/auth";
import { GetUserSurveysResponse } from "@/types/dto";

interface GetUserSurveysOptions {
  cursor?: string;
  limit?: number;
}

export async function getUserSurveys(
  options?: GetUserSurveysOptions
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
      createdAt: "desc",
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
