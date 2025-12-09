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
}: ActionStepContentProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const initialImageUrl = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return null;
    }
    const answer = missionResponse.data.answers.find(answer => answer.actionId === actionData.id);

    if (!answer) {
      return null;
    }

    return null;
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
      };

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      updateCanGoNextRef.current?.(validationResult.success);

      if (validationResult.success) {
        onAnswerChangeRef.current?.(answer);
      }
    } else {
      updateCanGoNextRef.current?.(false);
    }
  }, [imageUrl, actionData.id]);

  const handleUploadChange = (hasUploadedImage: boolean, uploadedImageUrl?: string) => {
    if (hasUploadedImage && uploadedImageUrl) {
      setImageUrl(uploadedImageUrl);
    } else if (!hasUploadedImage) {
      setImageUrl(null);
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
    >
      <ImageUpload
        initialImageUrl={initialImageUrl ?? undefined}
        onUploadChange={handleUploadChange}
        actionId={actionData.id}
      />
    </SurveyQuestionTemplate>
  );
}
