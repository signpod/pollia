import {
  type ActionAnswerRepository,
  actionAnswerRepository,
} from "@/server/repositories/action-answer/actionAnswerRepository";
import {
  type ActionRepository,
  actionRepository,
} from "@/server/repositories/action/actionRepository";
import type { GradeResult, GradedItem } from "./types";

export class QuizGradingService {
  constructor(
    private actionRepo: ActionRepository = actionRepository,
    private answerRepo: ActionAnswerRepository = actionAnswerRepository,
  ) {}

  async calculatePerfectScore(missionId: string): Promise<number> {
    const actions = await this.actionRepo.findDetailsByMissionId(missionId);
    return actions.reduce((sum, action) => sum + (action.score ?? 0), 0);
  }

  async gradeResponse(responseId: string, missionId: string): Promise<GradeResult> {
    const [answers, perfectScore] = await Promise.all([
      this.answerRepo.findByResponseId(responseId),
      this.calculatePerfectScore(missionId),
    ]);

    const gradedItems: GradedItem[] = [];

    for (const answer of answers) {
      const { action } = answer;
      if (action.score == null || action.correctOptionId == null) {
        continue;
      }

      const selectedOptionIds = new Set(answer.options.map(opt => opt.id));
      const isCorrect = selectedOptionIds.has(action.correctOptionId);

      gradedItems.push({
        actionId: action.id,
        isCorrect,
        earnedScore: isCorrect ? action.score : 0,
        maxScore: action.score,
      });
    }

    const totalScore = gradedItems.reduce((sum, item) => sum + item.earnedScore, 0);
    const scoreRatio = perfectScore > 0 ? Math.round((totalScore / perfectScore) * 100) : 0;

    return { totalScore, perfectScore, scoreRatio, gradedItems };
  }

  resolveQuizCompletionId(
    completions: Array<{
      id: string;
      minScoreRatio: number | null;
      maxScoreRatio: number | null;
    }>,
    scoreRatio: number,
  ): string | null {
    const matched = completions.find(c => {
      const min = c.minScoreRatio ?? 0;
      const max = c.maxScoreRatio ?? 100;
      return scoreRatio >= min && scoreRatio <= max;
    });

    return matched?.id ?? null;
  }
}

export const quizGradingService = new QuizGradingService();
