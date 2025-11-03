import { DraftFilterType, SortOrderType } from "@/types/common/sort";
import { atom } from "jotai";

/**
 * Me 페이지 검색 상태 관리
 *
 * "내가 만든 설문"과 "내가 만든 질문" 탭에서 사용되는 검색 쿼리
 */
export const meSearchQueryAtom = atom<string>("");

/**
 * Me 페이지 isDraft 필터 상태 관리
 *
 * "all": 전체
 * "used": 사용됨 (isDraft: false)
 * "unused": 미사용 (isDraft: true)
 */

export const meDraftFilterAtom = atom<DraftFilterType>("all");

/**
 * Me 페이지 정렬 상태 관리
 *
 * "latest": 최신순
 * "oldest": 오래된순
 */

export const surveySortOrderAtom = atom<SortOrderType>("latest");
export const surveyQuestionSortOrderAtom = atom<SortOrderType>("latest");
