import {
  type ActionRepository,
  actionRepository,
} from "@/server/repositories/action/actionRepository";
import {
  type MissionResponseRepository,
  missionResponseRepository,
} from "@/server/repositories/mission-response/missionResponseRepository";
import type { QuizQuestionCorrectRate } from "@/types/dto/quiz-stats";
import { ActionType, MatchMode } from "@prisma/client";

interface QuizStatsResult {
  averageScoreRatio: number;
  perfectScore: number;
  averageTotalScore: number;
  questionStats: QuizQuestionCorrectRate[];
}

export class QuizStatsService {
  constructor(
    private actionRepo: ActionRepository = actionRepository,
    private responseRepo: MissionResponseRepository = missionResponseRepository,
  ) {}

  async getQuizStats(missionId: string): Promise<QuizStatsResult> {
    const [actions, responses] = await Promise.all([
      this.actionRepo.findDetailsByMissionId(missionId),
      this.responseRepo.findByMissionId(missionId),
    ]);

    const scorableActions = actions.filter(a => a.score != null && a.score > 0);
    if (scorableActions.length === 0) {
      return { averageScoreRatio: 0, perfectScore: 0, averageTotalScore: 0, questionStats: [] };
    }

    const completedResponses = responses.filter(r => r.completedAt != null);
    const perfectScore = scorableActions.reduce((sum, a) => sum + (a.score ?? 0), 0);

    if (completedResponses.length === 0) {
      return {
        averageScoreRatio: 0,
        perfectScore,
        averageTotalScore: 0,
        questionStats: scorableActions.map(a => ({
          actionId: a.id,
          title: a.title,
          correctCount: 0,
          incorrectCount: 0,
          totalCount: 0,
          correctRate: 0,
          correctOptionLabels: a.options.filter(opt => opt.isCorrect).map(opt => opt.title),
        })),
      };
    }

    const correctCountByAction = new Map<string, number>();
    const totalCountByAction = new Map<string, number>();
    let totalScoreRatioSum = 0;
    let totalScoreSum = 0;

    for (const response of completedResponses) {
      let responseScore = 0;

      for (const answer of response.answers) {
        const action = scorableActions.find(a => a.id === answer.actionId);
        if (!action) continue;

        const correctOptions = action.options.filter(opt => opt.isCorrect);
        if (correctOptions.length === 0) continue;

        totalCountByAction.set(action.id, (totalCountByAction.get(action.id) ?? 0) + 1);

        const isCorrect =
          action.type === ActionType.SHORT_TEXT
            ? this.gradeShortText(answer.textAnswer, correctOptions, action.matchMode)
            : this.gradeOptionBased(
                answer.options.map(opt => opt.id),
                correctOptions.map(opt => opt.id),
              );

        if (isCorrect) {
          correctCountByAction.set(action.id, (correctCountByAction.get(action.id) ?? 0) + 1);
          responseScore += action.score ?? 0;
        }
      }

      totalScoreSum += responseScore;
      if (perfectScore > 0) {
        totalScoreRatioSum += Math.round((responseScore / perfectScore) * 100);
      }
    }

    const averageScoreRatio =
      completedResponses.length > 0
        ? Math.round((totalScoreRatioSum / completedResponses.length) * 10) / 10
        : 0;

    const questionStats: QuizQuestionCorrectRate[] = scorableActions.map(action => {
      const correct = correctCountByAction.get(action.id) ?? 0;
      const total = totalCountByAction.get(action.id) ?? 0;
      const incorrect = total - correct;
      const correctRate = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
      const correctOptionLabels = action.options.filter(opt => opt.isCorrect).map(opt => opt.title);

      return {
        actionId: action.id,
        title: action.title,
        correctCount: correct,
        incorrectCount: incorrect,
        totalCount: total,
        correctRate,
        correctOptionLabels,
      };
    });

    const averageTotalScore =
      completedResponses.length > 0
        ? Math.round((totalScoreSum / completedResponses.length) * 10) / 10
        : 0;

    return { averageScoreRatio, perfectScore, averageTotalScore, questionStats };
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
}

export const quizStatsService = new QuizStatsService();
