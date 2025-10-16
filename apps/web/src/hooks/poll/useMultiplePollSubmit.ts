"use client";

import { useState, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { PollType, PollCategory } from "@prisma/client";
import { useCreatePoll } from "./useCreatePoll";
import { multiplePollDataAtom, resetMultiplePollAtom } from "@/atoms/create/multiplePollAtoms";
import { CreatePollRequest } from "@/types/dto";
import {
  multiplePollSchema,
  type MultiplePollFormData,
} from "@/schemas/multiplePollSchema";
import { resetPollTypeAtom } from "@/atoms/create/pollTypeAtoms";

export interface UseMultiplePollSubmitOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useMultiplePollSubmit(
  options: UseMultiplePollSubmitOptions = {}
) {
  const router = useRouter();
  const pollData = useAtomValue(multiplePollDataAtom);
  const resetPollData = useSetAtom(resetMultiplePollAtom);
  const resetPollType = useSetAtom(resetPollTypeAtom);

  const createPollMutation = useCreatePoll({
    onSuccess: (data) => {
      if (data.data?.id) {
        router.push(`/poll/create/done?pollId=${data.data.id}`);
        setTimeout(() => {
          options.onSuccess?.();
        }, 100);
      }
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  const [validation, setValidation] = useState({
    isValid: false,
    errors: [] as string[],
    data: null as MultiplePollFormData | null,
  });

  useEffect(() => {
    const formData: MultiplePollFormData = {
      category: pollData.category,
      title: pollData.title || "",
      description: pollData.description || "",
      thumbnailUrl: pollData.thumbnailUrl || "",
      thumbnailFileUploadId: pollData.thumbnailFileUploadId || "",
      maxSelections: pollData.maxSelections,
      isUnlimited: pollData.isUnlimited,
      startDate: pollData.startDate || "",
      startTime: pollData.startTime || "",
      endDate: pollData.endDate || "",
      endTime: pollData.endTime || "",
      options: pollData.options,
    };

    const result = multiplePollSchema.safeParse(formData);

    if (result.success) {
      setValidation({
        isValid: true,
        errors: [],
        data: result.data,
      });
    } else {
      const errors = result.error.issues.map((issue) => issue.message);
      setValidation({
        isValid: false,
        errors,
        data: null,
      });
    }
  }, [
    pollData.category,
    pollData.title,
    pollData.description,
    pollData.thumbnailUrl,
    pollData.thumbnailFileUploadId,
    pollData.maxSelections,
    pollData.isUnlimited,
    pollData.startDate,
    pollData.startTime,
    pollData.endDate,
    pollData.endTime,
    pollData.options,
  ]);

  const isImageUploading =
    (pollData.thumbnailUrl !== undefined &&
      pollData.thumbnailUrl.startsWith("blob:")) ||
    pollData.options.some(
      (option) => option.imageUrl && option.imageUrl.startsWith("blob:")
    );

  const handleSubmit = async (imageFileUploadId?: string) => {
    if (!validation.isValid) {
      const errorMessage = validation.errors.join("\n");
      console.error("❌ Multiple Poll 유효성 검사 실패:", errorMessage);
      return;
    }

    try {
      const validatedData = validation.data!;
      const startDateTime = new Date(
        `${validatedData.startDate}T${validatedData.startTime}`
      );
      const endDateTime =
        !validatedData.isUnlimited &&
        validatedData.endDate &&
        validatedData.endTime
          ? new Date(`${validatedData.endDate}T${validatedData.endTime}`)
          : undefined;

      const optionsForApi = validatedData.options.map((option, index) => ({
        description: option.description,
        imageUrl: option.imageUrl || undefined,
        imageFileUploadId: option.fileUploadId || undefined,
        link: option.link || undefined,
        order: index, // API에서는 0부터 시작하는 순서
      }));

      const request: CreatePollRequest = {
        title: validatedData.title,
        description: validatedData.description || undefined,
        imageUrl: validatedData.thumbnailUrl || undefined,
        imageFileUploadId:
          imageFileUploadId || validatedData.thumbnailFileUploadId,
        type: PollType.MULTIPLE_CHOICE,
        category: validatedData.category as PollCategory,
        startDate: startDateTime,
        endDate: endDateTime,
        isIndefinite: validatedData.isUnlimited,
        maxSelections: validatedData.maxSelections,
        options: optionsForApi,
      };

      console.log("🚀 Multiple Poll 생성 요청:", request);
      const result = await createPollMutation.mutateAsync(request);

      if(!result.success) {
        throw new Error(result.error || "폴 생성에 실패했습니다.");
      }

      resetPollData();
      resetPollType();
    } catch (error) {
      console.error("❌ Multiple Poll validation 또는 요청 실패:", error);
    }
  };

  return {
    handleSubmit,
    isLoading: createPollMutation.isPending,
    isValid: validation.isValid && !isImageUploading,
    isImageUploading,
    errors: validation.errors,
    error: createPollMutation.error,
  };
}
