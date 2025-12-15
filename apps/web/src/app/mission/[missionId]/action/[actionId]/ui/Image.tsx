import { ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { useEffect, useMemo, useRef, useState } from "react";
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

  const initialImageUrl = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return null;
    }
    const answer = missionResponse.data.answers.find(answer => answer.actionId === actionData.id);

    if (!answer) {
      return null;
    }

    return answer.imageUrl ?? answer.textAnswer;
  }, [missionResponse, actionData.id]);

  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  useEffect(() => {
    const hasExistingAnswer = missionResponse?.data?.answers?.some(
      answer => answer.actionId === actionData.id,
    );

    if (hasExistingAnswer) {
      updateCanGoNextRef.current?.(true);
    }
  }, [missionResponse, actionData.id]);

  useEffect(() => {
    if (imageUrl) {
      const answer: ActionAnswerItem = {
        actionId: actionData.id,
        type: ActionType.IMAGE,
        textResponse: imageUrl,
        imageFileUploadId: imageFileUploadId,
      };

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      updateCanGoNextRef.current?.(validationResult.success);

      if (validationResult.success) {
        onAnswerChangeRef.current?.(answer);
      }
    } else {
      updateCanGoNextRef.current?.(false);
    }
  }, [imageUrl, imageFileUploadId, actionData.id]);

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
        actionId={actionData.id}
      />
    </SurveyQuestionTemplate>
  );
}
