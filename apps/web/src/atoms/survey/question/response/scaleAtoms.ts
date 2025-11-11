import { atom } from "jotai";

/**
 * 척도형 질문 응답용 Atoms
 * 사용자가 설문에 답변할 때 사용하는 상태 관리
 */

const DEFAULT_SCALE_VALUE = 3;

export const scaleResponseAtom = atom<number>(DEFAULT_SCALE_VALUE);
