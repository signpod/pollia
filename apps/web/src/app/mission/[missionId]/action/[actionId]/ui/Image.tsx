import { toast } from "@/components/common/Toast";
import { ActionStepContentProps } from "@/constants/action";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { useDeleteAnswer } from "@/hooks/action/useDeleteAnswer";
import { useDeleteFile } from "@/hooks/common/useDeleteFile";
import { useMultipleImageUpload } from "@/hooks/common/useImageUpload";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { FileUploadInfo } from "@/types/domain/file";
import type { ActionAnswerItem } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { ImageUpload } from "./ImageUpload";
import { ImageList } from "./components/ImageList";
import { ImageUploadNotice } from "./components/ImageUploadNotice";

const IMAGE_UPLOAD_ERROR_MESSAGE = "이미지 업로드에 실패했어요.\n다시 시도해주세요." as const;

type ImageInfo = FileUploadInfo;

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
  const [imageInfos, setImageInfos] = useState<ImageInfo[]>([]);
  const [uploadingImageUrl, setUploadingImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { mutate: deleteFileMutation } = useDeleteFile();
  const { mutate: deleteAnswerMutation, isPending: isDeletingAnswer } = useDeleteAnswer();

  const prevHadImagesRef = useRef(false);
  const isInitializedRef = useRef(false);

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
    (infos: ImageInfo[]) => {
      if (!infos.length) {
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
        fileUploadIds: infos.map(info => info.fileUploadId),
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
    if (isInitializedRef.current) return;

    if (existingAnswer?.fileUploads && existingAnswer.fileUploads.length > 0) {
      const imageInfosFromAnswer: ImageInfo[] = existingAnswer.fileUploads.map(fileUpload => ({
        fileUrl: fileUpload.publicUrl,
        fileUploadId: fileUpload.id,
        filePath: fileUpload.filePath,
      }));

      setImageInfos(imageInfosFromAnswer);
      isInitializedRef.current = true;
      validateAndUpdateAnswer(imageInfosFromAnswer);
    } else if (existingAnswer) {
      setImageInfos([]);
      isInitializedRef.current = true;
      updateCanGoNextRef.current?.(true);
    }
  }, [existingAnswer, validateAndUpdateAnswer]);

  useEffect(() => {
    validateAndUpdateAnswer(imageInfos);
  }, [imageInfos, validateAndUpdateAnswer]);

  useEffect(() => {
    if (!isInitializedRef.current) return;

    if (prevHadImagesRef.current && imageInfos.length === 0 && existingAnswer?.id) {
      deleteAnswerMutation(existingAnswer.id);
    }
    prevHadImagesRef.current = imageInfos.length > 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageInfos.length, existingAnswer?.id]);

  const handleUploadChange = useCallback(
    (
      hasUploadedImage: boolean,
      newImageUrls: string[],
      newFileUploadIds: string[],
      newFilePaths: string[],
    ) => {
      if (
        hasUploadedImage &&
        newImageUrls.length > 0 &&
        newFileUploadIds.length > 0 &&
        newFilePaths.length > 0
      ) {
        const newImageInfos: ImageInfo[] = newImageUrls
          .map((url, index) => {
            const fileUploadId = newFileUploadIds[index];
            const filePath = newFilePaths[index];
            if (!fileUploadId || !filePath) return null;
            return {
              fileUrl: url,
              fileUploadId,
              filePath,
            };
          })
          .filter((info): info is ImageInfo => info !== null);

        setImageInfos(prev => {
          const existingUrlsSet = new Set(prev.map(info => info.fileUrl));
          const filteredNewInfos = newImageInfos.filter(info => !existingUrlsSet.has(info.fileUrl));
          return [...prev, ...filteredNewInfos];
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

  const handleImageDelete = useCallback(
    (imageUrl: string) => {
      const imageInfo = imageInfos.find(info => info.fileUrl === imageUrl);
      if (!imageInfo) return;

      setImageInfos(prev => prev.filter(info => info.fileUrl !== imageUrl));

      deleteFileMutation(imageInfo.filePath);

      if (imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }

      setUploadingImageUrl(prevUrl => (prevUrl === imageUrl ? null : prevUrl));
    },
    [deleteFileMutation, imageInfos],
  );

  const handleImageLoadComplete = useCallback((imageUrl: string) => {
    setUploadingImageUrl(prev => (prev === imageUrl ? null : prev));
  }, []);

  const handleImageEdit = useCallback(
    async (originalImageUrl: string, editedFile: File) => {
      const originalImageInfo = imageInfos.find(info => info.fileUrl === originalImageUrl);
      if (!originalImageInfo) {
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
        const newFilePath = uploadResults[0]?.path;

        if (!newImageUrl || !newFileUploadId || !newFilePath) {
          toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
          setIsUploading(false);
          setUploadingImageUrl(null);
          return;
        }

        setImageInfos(prev => {
          const currentIndex = prev.findIndex(info => info.fileUrl === originalImageUrl);
          if (currentIndex === -1) {
            return prev;
          }
          const newInfos = [...prev];
          newInfos[currentIndex] = {
            fileUrl: newImageUrl,
            fileUploadId: newFileUploadId,
            filePath: newFilePath,
          };
          return newInfos;
        });

        deleteFileMutation(originalImageInfo.filePath);

        setUploadingImageUrl(null);
        setIsUploading(false);
      } catch (error) {
        console.error("이미지 편집 업로드 실패:", error);
        toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
        setIsUploading(false);
        setUploadingImageUrl(null);
      }
    },
    [imageInfos, uploadMultiple, deleteFileMutation],
  );

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalActionCount={totalActionCount}
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isFirstAction={isFirstAction}
      isNextDisabled={isNextDisabledProp || isDeletingAnswer}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      isLoading={isLoading}
      isRequired={actionData.isRequired}
    >
      <ImageUpload
        currentImageCount={imageInfos.length}
        onUploadChange={handleUploadChange}
        onUploadingChange={handleUploadingChange}
      />
      <ImageList
        imageUrls={imageInfos.map(info => info.fileUrl)}
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
