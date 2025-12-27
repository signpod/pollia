import { ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { ImageUpload } from "./ImageUpload";

export function ActionImage({
  actionData,
  currentOrder,
  totalActionCount,
  isFirstAction,
  onPrevious,
  onNext,
  nextButtonText,
  isNextDisabled: isNextDisabledProp,
  updateCanGoNext,
  onAnswerChange,
  missionResponse,
  isLoading,
}: ActionStepContentProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFileUploadId, setImageFileUploadId] = useState<string | undefined>(undefined);

  const existingAnswer = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return null;
    }
    return missionResponse.data.answers.find(answer => answer.actionId === actionData.id) ?? null;
  }, [missionResponse, actionData.id]);

  const initialImageUrl = existingAnswer?.imageUrl ?? null;

  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  const validateAndUpdateAnswer = useCallback(
    (url: string | null, fileId: string | undefined) => {
      if (!url || !fileId) {
        updateCanGoNextRef.current?.(false);
        return;
      }

      const answer: ActionAnswerItem = {
        actionId: actionData.id,
        type: ActionType.IMAGE,
        imageFileUploadId: fileId,
        imageUrl: url,
      };

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      updateCanGoNextRef.current?.(validationResult.success);

      if (validationResult.success) {
        onAnswerChangeRef.current?.(answer);
      }
    },
    [actionData.id],
  );

  useEffect(() => {
    if (existingAnswer) {
      setImageUrl(existingAnswer.imageUrl ?? null);
      setImageFileUploadId(existingAnswer.imageFileUploadId ?? undefined);

      validateAndUpdateAnswer(
        existingAnswer.imageUrl ?? null,
        existingAnswer.imageFileUploadId ?? undefined,
      );
    }
  }, [existingAnswer, validateAndUpdateAnswer]);

  useEffect(() => {
    validateAndUpdateAnswer(imageUrl, imageFileUploadId);
  }, [imageUrl, imageFileUploadId, validateAndUpdateAnswer]);

  const handleUploadChange = (
    hasUploadedImage: boolean,
    uploadedImageUrl?: string,
    fileUploadId?: string,
  ) => {
    if (hasUploadedImage && uploadedImageUrl) {
      setImageUrl(uploadedImageUrl);
      setImageFileUploadId(fileUploadId);
    } else if (!hasUploadedImage) {
      setImageUrl(null);
      setImageFileUploadId(undefined);
    }
  };

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalActionCount={totalActionCount}
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isFirstAction={isFirstAction}
      isNextDisabled={isNextDisabledProp}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      isLoading={isLoading}
    >
      <ImageUpload
        initialImageUrl={initialImageUrl ?? undefined}
        onUploadChange={handleUploadChange}
      />
    </SurveyQuestionTemplate>
  );
}
