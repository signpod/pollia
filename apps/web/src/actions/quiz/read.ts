"use server";

import prisma from "@/database/utils/prisma/client";
import { quizGradingService } from "@/server/services/quiz-grading/quizGradingService";
import type { GradeResult } from "@/server/services/quiz-grading/types";

export interface QuizResultResponse {
  gradeResult: GradeResult;
  percentile: number | null;
}

export async function getQuizResult(
  responseId: string,
  missionId: string,
): Promise<QuizResultResponse> {
  const gradeResult = await quizGradingService.gradeResponse(responseId, missionId);

  const completedResponses = await prisma.missionResponse.findMany({
    where: {
      missionId,
      completedAt: { not: null },
    },
    select: { id: true },
  });

  let percentile: number | null = null;
  const totalCompleted = completedResponses.length;

  if (totalCompleted > 0) {
    const allScores = await Promise.all(
      completedResponses.map(async r => {
        const result = await quizGradingService.gradeResponse(r.id, missionId);
        return result.totalScore;
      }),
    );

    const higherCount = allScores.filter(score => score > gradeResult.totalScore).length;
    percentile = Math.max(1, Math.round((higherCount / totalCompleted) * 100));
  }

  return { gradeResult, percentile };
}
