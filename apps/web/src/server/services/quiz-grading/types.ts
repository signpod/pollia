export interface GradedItem {
  actionId: string;
  isCorrect: boolean;
  earnedScore: number;
  maxScore: number;
}

export interface GradeResult {
  totalScore: number;
  perfectScore: number;
  scoreRatio: number;
  gradedItems: GradedItem[];
}
