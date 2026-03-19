import {
  type ActionAnswerRepository,
  actionAnswerRepository,
} from "@/server/repositories/action-answer/actionAnswerRepository";
import {
  type ActionRepository,
  actionRepository,
} from "@/server/repositories/action/actionRepository";
import { ActionType, MatchMode } from "@prisma/client";
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
    const [answers, actionsWithOptions, perfectScore] = await Promise.all([
      this.answerRepo.findByResponseId(responseId),
      this.actionRepo.findDetailsByMissionId(missionId),
      this.calculatePerfectScore(missionId),
    ]);

    const actionMap = new Map(actionsWithOptions.map(a => [a.id, a]));
    const gradedItems: GradedItem[] = [];

    for (const answer of answers) {
      const { action } = answer;
      if (action.score == null) continue;

      const fullAction = actionMap.get(action.id);
      if (!fullAction) continue;

      let correctOptions = fullAction.options.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0 && action.type === ActionType.SHORT_TEXT) {
        correctOptions = fullAction.options;
      }
      if (correctOptions.length === 0) continue;

      const isCorrect =
        action.type === ActionType.SHORT_TEXT
          ? this.gradeShortText(answer.textAnswer, correctOptions, fullAction.matchMode)
          : this.gradeOptionBased(
              answer.options.map(opt => opt.id),
              correctOptions.map(opt => opt.id),
            );

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

  private gradeOptionBased(selectedIds: string[], correctIds: string[]): boolean {
    if (selectedIds.length !== correctIds.length) return false;
    const selectedSet = new Set(selectedIds);
    return correctIds.every(id => selectedSet.has(id));
  }

  private gradeShortText(
    textAnswer: string | null,
    correctOptions: Array<{ title: string }>,
    matchMode: MatchMode | null,
  ): boolean {
    if (!textAnswer) return false;
    const normalizedAnswer = textAnswer.trim().toLowerCase();
    if (normalizedAnswer.length === 0) return false;

    return correctOptions.some(opt => {
      const normalizedCorrect = opt.title.trim().toLowerCase();
      if (matchMode === MatchMode.CONTAINS) {
        return normalizedAnswer.includes(normalizedCorrect);
      }
      return normalizedAnswer === normalizedCorrect;
    });
  }

  resolveQuizCompletionId(
    completions: Array<{
      id: string;
      minScoreRatio: number | null;
      maxScoreRatio: number | null;
    }>,
    scoreRatio: number,
  ): string | null {
    const withRange = completions.filter(c => c.minScoreRatio != null || c.maxScoreRatio != null);
    const sorted = [...withRange].sort((a, b) => (a.minScoreRatio ?? 0) - (b.minScoreRatio ?? 0));

    const matched = sorted.find(c => {
      const min = c.minScoreRatio ?? 0;
      const max = c.maxScoreRatio ?? 100;
      return scoreRatio >= min && scoreRatio <= max;
    });

    if (matched) return matched.id;

    const fallback = completions.find(c => c.minScoreRatio == null && c.maxScoreRatio == null);
    return fallback?.id ?? null;
  }
}

export const quizGradingService = new QuizGradingService();
