import { POLL_TYPES } from "@/constants/poll";
import {
  PollType,
  BinaryPollType,
  MultiplePollType,
} from "@/types/client/poll";
import { atom } from "jotai";

export const pollTypeAtom = atom<PollType | undefined>(undefined);

export const availablePollTypesAtom = atom(POLL_TYPES);

export const pollTypeSelectedAtom = atom((get) => {
  const pollType = get(pollTypeAtom);
  return !!pollType;
});

export const isBinaryPollTypeAtom = atom((get) => {
  const pollType = get(pollTypeAtom);
  return pollType === "ox" || pollType === "hobullho";
});

export const isMultiplePollTypeAtom = atom((get) => {
  const pollType = get(pollTypeAtom);
  return pollType === "multiple";
});

export const selectedBinaryPollTypeAtom = atom((get) => {
  const pollType = get(pollTypeAtom);
  return pollType === "ox" || pollType === "hobullho"
    ? (pollType as BinaryPollType)
    : undefined;
});

export const selectedMultiplePollTypeAtom = atom((get) => {
  const pollType = get(pollTypeAtom);
  return pollType === "multiple" ? (pollType as MultiplePollType) : undefined;
});

export const categoryStepValidationAtom = atom((get) => {
  const pollType = get(pollTypeAtom);

  return {
    isValid: !!pollType,
    errors: {
      pollType: !pollType ? "폴 유형을 선택해주세요" : null,
    },
  };
});

export const resetPollTypeAtom = atom(null, (_get, set) => {
  set(pollTypeAtom, undefined);
});

export const setPollTypeAtom = atom(
  null,
  (_get, set, newPollType: PollType) => {
    set(pollTypeAtom, newPollType);
  }
);
