import { titleSchema } from "@/schemas/mission/missionSchema";
import { ActionSummary, ActionType } from "@/types/domain/action";
import { atom } from "jotai";

const DEFAULT_DEADLINE_TIME = "10:30";

export const missionTitleAtom = atom<string>("");

export const missionDeadlineDateAtom = atom<Date | undefined>(undefined);
export const missionDeadlineTimeAtom = atom<string>(DEFAULT_DEADLINE_TIME);

export const missionEstimatedMinutesAtom = atom<number | undefined>(undefined);

export const missionDescriptionAtom = atom<string>("");

export const missionTargetAtom = atom<string>("");

export const selectedActionAtom = atom<ActionSummary[]>([]);

export const searchQueryAtom = atom<string>("");

export const selectedActionTypesAtom = atom<Set<ActionType>>(new Set<ActionType>());

export const selectedActionCountAtom = atom(get => {
  const selectedActions = get(selectedActionAtom);
  return selectedActions.length;
});

export const selectAllActionsAtom = atom(null, (_get, set, actions: ActionSummary[]) => {
  set(selectedActionAtom, actions);
});

export const deselectAllActionsAtom = atom(null, (_get, set) => {
  set(selectedActionAtom, []);
});

export const reorderActionsAtom = atom(null, (_get, set, newOrder: ActionSummary[]) => {
  set(selectedActionAtom, newOrder);
});

export const resetMissionAtom = atom(null, (_get, set) => {
  set(missionTitleAtom, "");
  set(missionDescriptionAtom, "");
  set(missionTargetAtom, "");
  set(selectedActionAtom, []);
  set(searchQueryAtom, "");
  set(missionDeadlineDateAtom, undefined);
  set(missionDeadlineTimeAtom, DEFAULT_DEADLINE_TIME);
  set(missionEstimatedMinutesAtom, undefined);
});

export const missionValidationAtom = atom(get => {
  const title = get(missionTitleAtom);
  const selectedActions = get(selectedActionAtom);

  let titleError: string | null = null;
  const trimmedTitle = title.trim();

  try {
    const result = titleSchema.safeParse(trimmedTitle);
    if (!result.success) {
      titleError = result.error.issues[0]?.message ?? null;
    }
  } catch {
    titleError = null;
  }

  const questionsError = selectedActions.length === 0 ? SURVEY_FORM_ERROR_MESSAGES.questions : null;

  return {
    isValid: !titleError && selectedActions.length > 0,
    errors: {
      title: titleError,
      questions: questionsError,
    },
  };
});

export const toggleActionTypeAtom = atom(null, (get, set, actionType: ActionType) => {
  const currentTypes = get(selectedActionTypesAtom);
  if (currentTypes?.has(actionType)) {
    set(selectedActionTypesAtom, new Set([...currentTypes].filter(type => type !== actionType)));
  } else {
    set(selectedActionTypesAtom, new Set([...(currentTypes ?? []), actionType]));
  }
});

const SURVEY_FORM_ERROR_MESSAGES = {
  questions: "최소 1개 이상의 질문을 선택해주세요",
};
