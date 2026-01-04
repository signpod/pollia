import { toast } from "@/components/common/Toast";
import { ActionStepContentProps } from "@/constants/action";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { useMultipleImageUpload } from "@/hooks/common/useImageUpload";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { ImageUpload } from "./ImageUpload";
import { ImageList } from "./components/ImageList";
import { ImageUploadNotice } from "./components/ImageUploadNotice";

const IMAGE_UPLOAD_ERROR_MESSAGE = "이미지 업로드에 실패했어요.\n다시 시도해주세요." as const;

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

  const { uploadMultiple } = useMultipleImageUpload({
    bucket: STORAGE_BUCKETS.ACTION_ANSWER_IMAGES,
    onError: () => {
      toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
    },
  });

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
        if (!actionData.isRequired) {
          updateCanGoNextRef.current?.(true);
          onAnswerChangeRef.current?.({
            actionId: actionData.id,
            type: ActionType.IMAGE,
            isRequired: actionData.isRequired,
            fileUploadIds: [],
          });
        } else {
          updateCanGoNextRef.current?.(false);
        }
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
    [actionData.id, actionData.isRequired],
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
        setImageUrls(prev => {
          const existingUrlsSet = new Set(prev);
          const filteredNewUrls = newImageUrls.filter(url => !existingUrlsSet.has(url));
          return [...prev, ...filteredNewUrls];
        });
        setImageFileUploadIds(prev => {
          const existingIdsSet = new Set(prev);
          const filteredNewIds = newFileUploadIds.filter(id => !existingIdsSet.has(id));
          return [...prev, ...filteredNewIds];
        });
        if (newImageUrls.length > 0) {
          setUploadingImageUrl(newImageUrls[newImageUrls.length - 1] ?? null);
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

  const handleImageEdit = useCallback(
    async (originalImageUrl: string, editedFile: File) => {
      const originalIndex = imageUrls.indexOf(originalImageUrl);
      if (originalIndex === -1) {
        return;
      }

      try {
        setIsUploading(true);
        setUploadingImageUrl(originalImageUrl);

        const uploadResults = await uploadMultiple([editedFile]);
        if (uploadResults.length === 0) {
          toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
          setIsUploading(false);
          setUploadingImageUrl(null);
          return;
        }

        const newImageUrl = uploadResults[0]?.publicUrl;
        const newFileUploadId = uploadResults[0]?.fileUploadId;

        if (!newImageUrl || !newFileUploadId) {
          toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
          setIsUploading(false);
          setUploadingImageUrl(null);
          return;
        }

        setImageUrls(prev => {
          const newUrls = [...prev];
          newUrls[originalIndex] = newImageUrl;
          return newUrls;
        });

        setImageFileUploadIds(prev => {
          const newIds = [...prev];
          newIds[originalIndex] = newFileUploadId;
          return newIds;
        });

        setUploadingImageUrl(null);
        setIsUploading(false);
      } catch (error) {
        console.error("이미지 편집 업로드 실패:", error);
        toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
        setIsUploading(false);
        setUploadingImageUrl(null);
      }
    },
    [imageUrls, uploadMultiple],
  );

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
      isRequired={actionData.isRequired}
    >
      <ImageUpload
        currentImageCount={imageUrls.length}
        onUploadChange={handleUploadChange}
        onUploadingChange={handleUploadingChange}
      />
      <ImageList
        imageUrls={imageUrls}
        uploadingImageUrl={uploadingImageUrl}
        isUploading={isUploading}
        onImageDelete={handleImageDelete}
        onImageLoadComplete={handleImageLoadComplete}
        onImageEdit={handleImageEdit}
      />
      <ImageUploadNotice />
    </SurveyQuestionTemplate>
  );
}
