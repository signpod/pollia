import { CreatePollStep } from "@/types/client/createPoll";

export const STEPS: CreatePollStep[] = [
  {
    id: "type",
    title: "어떤 유형의 폴을 선택할까요?",
    description: "원하는 질문 방식을 골라주세요",
    canGoNext: true,
    canGoBack: false,
    level: 0,
  },
  {
    id: "binaryInfo",
    title: "폴 내용을 작성해주세요",
    canGoNext: true,
    canGoBack: true,
    level: 1,
  },
  {
    id: "multipleInfo",
    title: "폴 내용을 작성해주세요",
    canGoNext: true,
    canGoBack: true,
    level: 1,
  },
  {
    id: "category",
    title: "카테고리를 선택해주세요",
    canGoNext: true,
    canGoBack: true,
    level: 2,
  },
];
