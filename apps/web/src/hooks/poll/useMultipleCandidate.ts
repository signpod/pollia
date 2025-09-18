import { useAtomValue, useSetAtom } from "jotai";
import {
  multiplePollOCandidatesAtom,
  addCandidateAtom,
  removeCandidateAtom,
  updateCandidateAtom,
  clearCandidatesAtom,
  resetCandidatesAtom,
} from "@/atoms/create/multiplePollAtoms";
import { PollCandidate } from "@/types/domain/poll";

export type CandidateUpdateData = Partial<Omit<PollCandidate, "id">>;

export interface UseMultipleCandidateReturn {
  /** 현재 후보자 목록 */
  candidates: PollCandidate[];

  /** 새 후보자 추가 */
  addCandidate: () => void;

  /** 후보자 삭제 */
  removeCandidate: (candidateId: string) => void;

  /** 후보자 정보 업데이트 */
  updateCandidate: (candidateId: string, data: CandidateUpdateData) => void;

  /** 모든 후보자 삭제 */
  clearCandidates: () => void;

  /** 초기 상태로 리셋 (2개의 빈 후보자) */
  resetCandidates: () => void;

  /** 후보자 개수 */
  candidateCount: number;

  /** 특정 후보자 찾기 */
  findCandidate: (candidateId: string) => PollCandidate | undefined;

  /** 후보자 ID 존재 여부 확인 */
  hasCandidateId: (candidateId: string) => boolean;

  /** 유효한 후보자 개수 (이름이 있는 후보자) */
  validCandidateCount: number;
}

/**
 * Multiple Poll의 후보자를 관리하는 훅
 * Jotai atoms을 활용하여 상태 관리와 액션을 제공합니다.
 */
export function useMultipleCandidate(): UseMultipleCandidateReturn {
  // Atoms 사용
  const candidates = useAtomValue(multiplePollOCandidatesAtom);
  const add = useSetAtom(addCandidateAtom);
  const remove = useSetAtom(removeCandidateAtom);
  const update = useSetAtom(updateCandidateAtom);
  const clear = useSetAtom(clearCandidatesAtom);
  const reset = useSetAtom(resetCandidatesAtom);

  // 액션 함수들
  const addCandidate = () => {
    add();
  };

  const removeCandidate = (candidateId: string) => {
    remove(candidateId);
  };

  const updateCandidate = (candidateId: string, data: CandidateUpdateData) => {
    update({ id: candidateId, data });
  };

  const clearCandidates = () => {
    clear();
  };

  const resetCandidates = () => {
    reset();
  };

  // 유틸리티 함수들
  const findCandidate = (candidateId: string): PollCandidate | undefined => {
    return candidates.find((candidate) => candidate.id === candidateId);
  };

  const hasCandidateId = (candidateId: string): boolean => {
    return candidates.some((candidate) => candidate.id === candidateId);
  };

  // 계산된 값들
  const validCandidateCount = candidates.filter(
    (candidate) => candidate.name.trim().length > 0
  ).length;

  return {
    candidates,
    addCandidate,
    removeCandidate,
    updateCandidate,
    clearCandidates,
    resetCandidates,
    candidateCount: candidates.length,
    findCandidate,
    hasCandidateId,
    validCandidateCount,
  };
}
