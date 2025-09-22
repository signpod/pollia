"use client";

import { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { PollType, PollCategory } from "@prisma/client";
import { useCreatePoll } from "./useCreatePoll";
import { binaryPollDataAtom } from "@/atoms/create/binaryPollAtoms";
import { CreatePollRequest } from "@/types/dto";
import { binaryPollSchema, type BinaryPollFormData } from "@/schemas/binaryPollSchema";

export interface UseBinaryPollSubmitOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useBinaryPollSubmit(options: UseBinaryPollSubmitOptions = {}) {
  const { category, title, description, thumbnailUrl, isUnlimited, startDate, startTime, endDate, endTime } =
    useAtomValue(binaryPollDataAtom);

  const createPollMutation = useCreatePoll();

  const [validation, setValidation] = useState({
    isValid: false,
    errors: [] as string[],
    data: null as BinaryPollFormData | null,
  });

  useEffect(() => {
    const formData: BinaryPollFormData = {
      category: category!,
      title: title || "",
      description: description || "",
      thumbnailUrl: thumbnailUrl || "",
      isUnlimited,
      startDate: startDate || "",
      startTime: startTime || "",
      endDate: endDate || "",
      endTime: endTime || "",
    };

    const result = binaryPollSchema.safeParse(formData);

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
  }, [category, title, description, thumbnailUrl, isUnlimited, startDate, startTime, endDate, endTime]);

  const handleSubmit = async (imageFileUploadId?: string) => {
    if (!validation.isValid) {
      const errorMessage = validation.errors.join("\n");
      options.onError?.(new Error(errorMessage));
      return;
    }

    try {
      const validatedData = validation.data!;
      const startDateTime = new Date(`${validatedData.startDate}T${validatedData.startTime}`);
      const endDateTime =
        !validatedData.isUnlimited && validatedData.endDate && validatedData.endTime
          ? new Date(`${validatedData.endDate}T${validatedData.endTime}`)
          : undefined;

      const request: CreatePollRequest = {
        title: validatedData.title,
        description: validatedData.description || undefined,
        imageUrl: validatedData.thumbnailUrl || undefined,
        imageFileUploadId,
        type: PollType.YES_NO, // Binary poll은 YES_NO 타입
        category: validatedData.category as PollCategory,
        startDate: startDateTime,
        endDate: endDateTime,
        isIndefinite: validatedData.isUnlimited,
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

  console.log(validation);

  return {
    handleSubmit,
    isLoading: createPollMutation.isPending,
    isValid: validation.isValid,
    errors: validation.errors,
    error: createPollMutation.error,
  };
}
