import { ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
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

  const handleUploadChange = (
    hasUploadedImage: boolean,
    newImageUrls: string[],
    newFileUploadIds: string[],
  ) => {
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
  };

  const handleUploadingChange = (uploading: boolean) => {
    setIsUploading(uploading);
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
      <ImageUpload onUploadChange={handleUploadChange} onUploadingChange={handleUploadingChange} />
      {(isUploading || imageUrls.length > 0) && (
        <div className="grid grid-cols-3 gap-4 w-full">
          {isUploading && imageUrls.length === 0 && (
            <div className="relative w-full aspect-square rounded-sm overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center">
              <div className="flex items-center justify-center bg-black/40 absolute inset-0 z-30">
                <Loader2Icon className="size-8 animate-spin text-white" />
              </div>
            </div>
          )}
          {imageUrls.map(imageUrl => {
            const isImageUploading = uploadingImageUrl === imageUrl;
            return (
              <div
                key={imageUrl}
                className="relative w-full aspect-square rounded-sm overflow-hidden border border-zinc-200 bg-zinc-50"
              >
                {isImageUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
                    <Loader2Icon className="size-8 animate-spin text-white" />
                  </div>
                )}
                <Image
                  src={imageUrl}
                  alt="uploaded image"
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                  onLoadingComplete={() => {
                    if (isImageUploading) {
                      setUploadingImageUrl(null);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </SurveyQuestionTemplate>
  );
}
