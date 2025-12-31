import { ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { ImageUpload } from "./ImageUpload";
import { ImageList } from "./components/ImageList";
import { ImageUploadNotice } from "./components/ImageUploadNotice";

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFileUploadIds, setImageFileUploadIds] = useState<string[]>([]);
  const [uploadingImageUrl, setUploadingImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const existingAnswer = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return null;
    }
    return missionResponse.data.answers.find(answer => answer.actionId === actionData.id) ?? null;
  }, [missionResponse, actionData.id]);

  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  const validateAndUpdateAnswer = useCallback(
    (urls: string[], fileIds: string[]) => {
      if (!urls.length || !fileIds.length) {
        updateCanGoNextRef.current?.(false);
        return;
      }

      const answer: ActionAnswerItem = {
        actionId: actionData.id,
        type: ActionType.IMAGE,
        isRequired: actionData.isRequired,
        fileUploadIds: fileIds,
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
      setImageUrls([]);
      setImageFileUploadIds([]);
      validateAndUpdateAnswer([], []);
    }
  }, [existingAnswer, validateAndUpdateAnswer]);

  useEffect(() => {
    validateAndUpdateAnswer(imageUrls, imageFileUploadIds);
  }, [imageUrls, imageFileUploadIds, validateAndUpdateAnswer]);

  const handleUploadChange = useCallback(
    (hasUploadedImage: boolean, newImageUrls: string[], newFileUploadIds: string[]) => {
      if (hasUploadedImage && newImageUrls.length > 0 && newFileUploadIds.length > 0) {
        const newImageUrl = newImageUrls[0];
        const newFileUploadId = newFileUploadIds[0];

        if (newImageUrl && newFileUploadId) {
          setUploadingImageUrl(newImageUrl);
          setImageUrls(prev => [...prev, newImageUrl]);
          setImageFileUploadIds(prev => [...prev, newFileUploadId]);
        }
      } else if (!hasUploadedImage) {
        setUploadingImageUrl(null);
      }
    },
    [],
  );

  const handleUploadingChange = useCallback((uploading: boolean) => {
    setIsUploading(uploading);
  }, []);

  const handleImageDelete = useCallback((imageUrl: string) => {
    let deletedIndex = -1;
    setImageUrls(prev => {
      const index = prev.indexOf(imageUrl);
      if (index === -1) return prev;
      deletedIndex = index;
      return prev.filter(url => url !== imageUrl);
    });
    setImageFileUploadIds(prev => {
      if (deletedIndex === -1) return prev;
      return prev.filter((_, i) => i !== deletedIndex);
    });
    setUploadingImageUrl(prev => (prev === imageUrl ? null : prev));
  }, []);

  const handleImageLoadComplete = useCallback((imageUrl: string) => {
    setUploadingImageUrl(prev => (prev === imageUrl ? null : prev));
  }, []);

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
      <ImageUpload onUploadChange={handleUploadChange} onUploadingChange={handleUploadingChange} />
      <ImageList
        imageUrls={imageUrls}
        uploadingImageUrl={uploadingImageUrl}
        isUploading={isUploading}
        onImageDelete={handleImageDelete}
        onImageLoadComplete={handleImageLoadComplete}
      />
      <ImageUploadNotice />
    </SurveyQuestionTemplate>
  );
}
