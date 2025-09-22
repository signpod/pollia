"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { PollType } from "@prisma/client";
import { useCreatePoll } from "./useCreatePoll";
import {
  binaryPollCategoryAtom,
  binaryPollTitleAtom,
  binaryPollDescriptionAtom,
  binaryPollThumbnailUrlAtom,
  binaryPollIsUnlimitedAtom,
  binaryPollStartDateAtom,
  binaryPollStartTimeAtom,
  binaryPollEndDateAtom,
  binaryPollEndTimeAtom,
} from "@/atoms/create/binaryPollAtoms";
import { CreatePollRequest } from "@/types/dto";

export interface UseBinaryPollSubmitOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreateBinaryPoll(options: UseBinaryPollSubmitOptions = {}) {
  const category = useAtomValue(binaryPollCategoryAtom);
  const title = useAtomValue(binaryPollTitleAtom);
  const description = useAtomValue(binaryPollDescriptionAtom);
  const thumbnailUrl = useAtomValue(binaryPollThumbnailUrlAtom);
  const isUnlimited = useAtomValue(binaryPollIsUnlimitedAtom);
  const startDate = useAtomValue(binaryPollStartDateAtom);
  const startTime = useAtomValue(binaryPollStartTimeAtom);
  const endDate = useAtomValue(binaryPollEndDateAtom);
  const endTime = useAtomValue(binaryPollEndTimeAtom);

  const createPollMutation = useCreatePoll();

  const validation = useMemo(() => {
    const errors: string[] = [];

    if (!category) {
      errors.push("카테고리를 선택해주세요.");
    }

    if (!title?.trim()) {
      errors.push("제목을 입력해주세요.");
    } else if (title.length > 30) {
      errors.push("제목은 30자를 초과할 수 없습니다.");
    }

    if (description && description.length > 100) {
      errors.push("설명은 100자를 초과할 수 없습니다.");
    }

    if (!startDate || !startTime) {
      errors.push("시작 날짜와 시간을 설정해주세요.");
    }

    if (!isUnlimited && (!endDate || !endTime)) {
      errors.push("종료 날짜와 시간을 설정해주세요.");
    }

    if (startDate && startTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const now = new Date();

      if (startDateTime <= now) {
        errors.push("시작 시간은 현재 시간보다 늦어야 합니다.");
      }

      if (!isUnlimited && endDate && endTime) {
        const endDateTime = new Date(`${endDate}T${endTime}`);
        if (endDateTime <= startDateTime) {
          errors.push("종료 시간은 시작 시간보다 늦어야 합니다.");
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [
    category,
    title,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    isUnlimited,
  ]);

  const handleSubmit = async (imageFileUploadId?: string) => {
    if (!validation.isValid) {
      const errorMessage = validation.errors.join("\n");
      options.onError?.(new Error(errorMessage));
      return;
    }

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime =
        !isUnlimited && endDate && endTime
          ? new Date(`${endDate}T${endTime}`)
          : undefined;

      const request: CreatePollRequest = {
        title: title!,
        description: description || undefined,
        imageUrl: thumbnailUrl,
        imageFileUploadId,
        type: PollType.YES_NO, // Binary poll은 YES_NO 타입
        category: category!,
        startDate: startDateTime,
        endDate: endDateTime,
        isIndefinite: isUnlimited,
        maxSelections: undefined, // null이면 이진 선택 (O/X)
        options: [], // 이진 투표는 옵션 없음 - 클라이언트에서 처리
      };

      await createPollMutation.mutateAsync(request);
      options.onSuccess?.();
    } catch (error) {
      console.error("❌ Binary Poll 생성 실패:", error);
      options.onError?.(error as Error);
    }
  };

  return {
    handleSubmit,
    isLoading: createPollMutation.isPending,
    isValid: validation.isValid,
    errors: validation.errors,
    error: createPollMutation.error,
  };
}
