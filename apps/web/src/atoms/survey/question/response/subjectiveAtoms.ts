import { atom } from "jotai";

/**
 * 주관식 질문 응답용 Atoms
 * 사용자가 설문에 답변할 때 사용하는 상태 관리
 */

export const subjectiveResponseAtom = atom<string>("");
