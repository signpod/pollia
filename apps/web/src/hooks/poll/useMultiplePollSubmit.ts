"use client";

import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { PollType, PollCategory } from "@prisma/client";
import { useCreatePoll } from "./useCreatePoll";
import {
  multiplePollDataAtom,
  multiplePollValidationAtom,
} from "@/atoms/create/multiplePollAtoms";
import { CreatePollRequest } from "@/types/dto";

export interface UseMultiplePollSubmitOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useMultiplePollSubmit(
  options: UseMultiplePollSubmitOptions = {}
) {
  const router = useRouter();
  const pollData = useAtomValue(multiplePollDataAtom);
  const validation = useAtomValue(multiplePollValidationAtom);

  const createPollMutation = useCreatePoll({
    onSuccess: (data) => {
      if (data.data?.id) {
        router.push(`/poll/create/done?pollId=${data.data.id}`);
      }
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  const handleSubmit = async (imageFileUploadId?: string) => {
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors)
        .filter((error) => error !== null)
        .join("\n");
      console.error("❌ Multiple Poll 유효성 검사 실패:", errorMessages);
      return;
    }

    if (!pollData.category || !pollData.title.trim()) {
      console.error("❌ 필수 필드가 누락되었습니다.");
      return;
    }

    try {
      const startDateTime = new Date(
        `${pollData.startDate}T${pollData.startTime}`
      );

      const endDateTime =
        !pollData.isUnlimited && pollData.endDate && pollData.endTime
          ? new Date(`${pollData.endDate}T${pollData.endTime}`)
          : undefined;

      const optionsForApi = pollData.options.map((option, index) => ({
        content: option.content,
        description: option.description || undefined,
        imageUrl: option.imageUrl || undefined,
        imageFileUploadId: option.fileUploadId || undefined,
        link: option.link || undefined,
        order: index, // API에서는 0부터 시작하는 순서
      }));

      const request: CreatePollRequest = {
        title: pollData.title,
        description: pollData.description || undefined,
        imageUrl: pollData.thumbnailUrl || undefined,
        imageFileUploadId: imageFileUploadId || pollData.thumbnailFileUploadId,
        type: PollType.MULTIPLE_CHOICE,
        category: pollData.category as PollCategory,
        startDate: startDateTime,
        endDate: endDateTime,
        isIndefinite: pollData.isUnlimited,
        maxSelections: pollData.maxSelections,
        options: optionsForApi,
      };

      console.log("🚀 Multiple Poll 생성 요청:", request);
      await createPollMutation.mutateAsync(request);
    } catch (error) {
      console.error("❌ Multiple Poll 생성 실패:", error);
    }
  };

  return {
    handleSubmit,
    isLoading: createPollMutation.isPending,
    isValid: validation.isValid,
    validationErrors: validation.errors,
    validOptionsCount: validation.validOptionsCount,
    pollData,
    error: createPollMutation.error,
  };
}
