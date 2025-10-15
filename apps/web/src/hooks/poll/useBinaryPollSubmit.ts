"use client";

import { useState, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { PollCategory } from "@prisma/client";
import { useCreatePoll } from "./useCreatePoll";
import { binaryPollDataAtom, resetBinaryPollAtom } from "@/atoms/create/binaryPollAtoms";
import { CreatePollRequest } from "@/types/dto";
import {
  binaryPollSchema,
  type BinaryPollFormData,
} from "@/schemas/binaryPollSchema";
import { resetPollTypeAtom, selectedBinaryPollTypeAtom } from "@/atoms/create/pollTypeAtoms";

export interface UseBinaryPollSubmitOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useBinaryPollSubmit(options: UseBinaryPollSubmitOptions = {}) {
  const router = useRouter();
  const {
    category,
    title,
    description,
    thumbnailUrl,
    isUnlimited,
    startDate,
    startTime,
    endDate,
    endTime,
  } = useAtomValue(binaryPollDataAtom);
  const selectedBinaryPollType = useAtomValue(selectedBinaryPollTypeAtom);
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
  const resetPollData = useSetAtom(resetBinaryPollAtom);
 const resetPollType = useSetAtom(resetPollTypeAtom);

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
  }, [
    category,
    title,
    description,
    thumbnailUrl,
    isUnlimited,
    startDate,
    startTime,
    endDate,
    endTime,
  ]);

  const isImageUploading =
    thumbnailUrl !== undefined && thumbnailUrl.startsWith("blob:");

  const handleSubmit = async (imageFileUploadId?: string) => {
    if (!validation.isValid) {
      const errorMessage = validation.errors.join("\n");
      console.error("❌ Binary Poll 유효성 검사 실패:", errorMessage);
      return;
    }

    try {
      if (!selectedBinaryPollType) {
        throw new Error("투표 타입을 선택해주세요.");
      }

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

      const request: CreatePollRequest = {
        type: selectedBinaryPollType,
        title: validatedData.title,
        description: validatedData.description || undefined,
        imageUrl: validatedData.thumbnailUrl || undefined,
        imageFileUploadId,
        category: validatedData.category as PollCategory,
        startDate: startDateTime,
        endDate: endDateTime,
        isIndefinite: validatedData.isUnlimited,
        maxSelections: undefined, // undefined이면 이진 선택 (O/X)
        options: [], // 이진 투표는 옵션 없음 - 클라이언트에서 처리
      };

      const result = await createPollMutation.mutateAsync(request);
      if(!result.success) {
        throw new Error(result.error || "폴 생성에 실패했습니다.");
      }

      resetPollData();
      resetPollType();
    } catch (error) {
      console.error("❌ Binary Poll validation 또는 요청 실패:", error);
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
