export interface QuizQuestionCorrectRate {
  actionId: string;
  title: string;
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  correctRate: number;
  correctOptionLabels: string[];
}

export interface GetQuizStatsResponse {
  data: {
    averageScoreRatio: number;
    perfectScore: number;
    averageTotalScore: number;
    questionStats: QuizQuestionCorrectRate[];
  };
}
