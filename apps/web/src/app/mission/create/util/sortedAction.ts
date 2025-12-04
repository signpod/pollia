import { ActionSummary } from "@/types/domain/action";
import { ActionType } from "@prisma/client";

const typeOrder: Record<ActionType, number> = {
  SCALE: 1,
  MULTIPLE_CHOICE: 2,
  SUBJECTIVE: 3,
  RATING: 4,
  TAG: 5,
  IMAGE: 6,
};

export function getSortedActions(actions: ActionSummary[]) {
  return [...actions].sort((a, b) => {
    const typeComparison = typeOrder[a.type] - typeOrder[b.type];
    if (typeComparison !== 0) {
      return typeComparison;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}
