import { POLL_CATEGORIES } from "@/constants/poll";
import { PollCandidate } from "@/types/domain/poll";
import { generateUniqueId } from "@/lib/utils";
import { atom } from "jotai";

export const multiplePollAvailableCategoriesAtom = atom(POLL_CATEGORIES);
export const multiplePollCategorySelectModalOpenAtom = atom(false);

export const multiplePollCategoryAtom = atom<
  (typeof POLL_CATEGORIES)[number] | undefined
>(undefined);
export const multiplePollTitleAtom = atom<string>("");
export const multiplePollDescriptionAtom = atom<string>("");
export const multiplePollThumbnailUrlAtom = atom<string | undefined>(undefined);

export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0]!;
};

export const getCurrentTime = (): string => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

export const multiplePollIsUnlimitedAtom = atom<boolean>(false);

export const multiplePollStartDateAtom = atom<string>("");
export const multiplePollStartTimeAtom = atom<string>("");
export const multiplePollEndDateAtom = atom<string>("");
export const multiplePollEndTimeAtom = atom<string>("");

export const initializeDateTimeAtom = atom(null, (_get, set) => {
  const currentDate = getCurrentDate();
  const currentTime = getCurrentTime();

  set(multiplePollStartDateAtom, currentDate);
  set(multiplePollStartTimeAtom, currentTime);
  set(multiplePollEndDateAtom, currentDate);
  set(multiplePollEndTimeAtom, currentTime);
});

export const resetToCurrentDateTimeAtom = atom(null, (_get, set) => {
  const currentDate = getCurrentDate();
  const currentTime = getCurrentTime();

  set(multiplePollStartDateAtom, currentDate);
  set(multiplePollStartTimeAtom, currentTime);
  set(multiplePollEndDateAtom, currentDate);
  set(multiplePollEndTimeAtom, currentTime);
});

/**
 * 빈 Poll Candidate를 생성합니다.
 * 매번 새로운 고유 ID가 할당됩니다.
 */
const createEmptyPollCandidate = (): PollCandidate => ({
  id: generateUniqueId(),
  name: "",
  imageUrl: undefined,
  link: undefined,
});

export const multiplePollOCandidatesAtom = atom<PollCandidate[]>([
  createEmptyPollCandidate(),
  createEmptyPollCandidate(),
]);

// Candidate 관리를 위한 write-only atoms
export const addCandidateAtom = atom(null, (get, set) => {
  const candidates = get(multiplePollOCandidatesAtom);
  const newCandidate = createEmptyPollCandidate();
  set(multiplePollOCandidatesAtom, [...candidates, newCandidate]);
});

export const removeCandidateAtom = atom(
  null,
  (get, set, candidateId: string) => {
    const candidates = get(multiplePollOCandidatesAtom);
    const filteredCandidates = candidates.filter(
      (candidate) => candidate.id !== candidateId
    );
    set(multiplePollOCandidatesAtom, filteredCandidates);
  }
);

export const updateCandidateAtom = atom(
  null,
  (
    get,
    set,
    update: { id: string; data: Partial<Omit<PollCandidate, "id">> }
  ) => {
    const candidates = get(multiplePollOCandidatesAtom);
    const updatedCandidates = candidates.map((candidate) =>
      candidate.id === update.id ? { ...candidate, ...update.data } : candidate
    );
    set(multiplePollOCandidatesAtom, updatedCandidates);
  }
);

export const clearCandidatesAtom = atom(null, (_get, set) => {
  set(multiplePollOCandidatesAtom, []);
});

export const resetCandidatesAtom = atom(null, (_get, set) => {
  set(multiplePollOCandidatesAtom, [
    createEmptyPollCandidate(),
    createEmptyPollCandidate(),
  ]);
});

export const multiplePollThumbnailCountAtom = atom((get) => {
  const thumbnailUrl = get(multiplePollThumbnailUrlAtom);
  return thumbnailUrl ? 1 : 0;
});

export const multiplePollStepValidationAtom = atom((get) => {
  const category = get(multiplePollCategoryAtom);
  const title = get(multiplePollTitleAtom);

  return {
    isValid: !!category && !!title.trim(),
    errors: {
      category: !category ? "카테고리를 선택해주세요" : null,
      title: !title.trim() ? "제목을 입력해주세요" : null,
    },
  };
});

export const multiplePollValidationAtom = multiplePollStepValidationAtom;

export const multiplePollDataAtom = atom((get) => ({
  category: get(multiplePollCategoryAtom),
  title: get(multiplePollTitleAtom),
  description: get(multiplePollDescriptionAtom),
  thumbnailUrl: get(multiplePollThumbnailUrlAtom),

  isUnlimited: get(multiplePollIsUnlimitedAtom),
  startDate: get(multiplePollStartDateAtom),
  startTime: get(multiplePollStartTimeAtom),
  endDate: get(multiplePollEndDateAtom),
  endTime: get(multiplePollEndTimeAtom),

  multipleOptions: get(multiplePollOCandidatesAtom),
}));
