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
import { UploadingPlaceholder } from "./components/UploadingPlaceholder";

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
  const [uploadingImageUrls, setUploadingImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { mutate: deleteFileMutation } = useDeleteFile();
  const { mutate: deleteAnswerMutation, isPending: isDeletingAnswer } = useDeleteAnswer();

  const prevHadImagesRef = useRef(false);
  const isInitializedRef = useRef(false);
  const isReuploadingRef = useRef(false);

  const { uploadMultiple } = useMultipleImageUpload({
    bucket: STORAGE_BUCKETS.ACTION_ANSWER_IMAGES,
    onError: error => {
      toast.warning(error.message || IMAGE_UPLOAD_ERROR_MESSAGE);
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
      const reuploadExistingImages = async () => {
        if (isReuploadingRef.current) return;
        isReuploadingRef.current = true;

        const imageInfosFromAnswer: ImageInfo[] = existingAnswer.fileUploads.map(fileUpload => ({
          fileUrl: fileUpload.publicUrl,
          fileUploadId: fileUpload.id,
          filePath: fileUpload.filePath,
        }));

        setImageInfos(imageInfosFromAnswer);
        isInitializedRef.current = true;

        try {
          const files = await Promise.all(
            imageInfosFromAnswer.map(async info => {
              const response = await fetch(info.fileUrl);
              const blob = await response.blob();
              const extension = info.fileUrl.split(".").pop()?.split("?")[0] || "jpg";
              return new File([blob], `image.${extension}`, { type: blob.type });
            }),
          );

          const uploadResults = await uploadMultiple(files);

          if (uploadResults.length > 0) {
            const newImageInfos: ImageInfo[] = imageInfosFromAnswer.map((oldInfo, index) => {
              const result = uploadResults[index];
              if (!result?.fileUploadId || !result?.path) return oldInfo;
              return {
                fileUrl: oldInfo.fileUrl,
                fileUploadId: result.fileUploadId,
                filePath: result.path,
              };
            });

            setImageInfos(newImageInfos);
            validateAndUpdateAnswer(newImageInfos);
          }
        } catch (error) {
          console.error("기존 이미지 재업로드 실패:", error);
          validateAndUpdateAnswer(imageInfosFromAnswer);
        }
      };

      reuploadExistingImages();
    } else if (existingAnswer) {
      setImageInfos([]);
      isInitializedRef.current = true;
      updateCanGoNextRef.current?.(true);
    }
  }, [existingAnswer, validateAndUpdateAnswer, uploadMultiple]);

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
      tempUrls?: string[],
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

        if (tempUrls) {
          tempUrls.forEach(tempUrl => {
            if (tempUrl.startsWith("blob:")) {
              URL.revokeObjectURL(tempUrl);
            }
          });
          setUploadingImageUrls([]);
        }
      } else if (!hasUploadedImage) {
        setUploadingImageUrls([]);
      }
    },
    [],
  );

  const handleUploadingChange = useCallback((uploading: boolean) => {
    setIsUploading(uploading);
    if (!uploading) {
      setUploadProgress(0);
      setUploadingImageUrls([]);
    }
  }, []);

  const handleProgressChange = useCallback((progress: number) => {
    setUploadProgress(progress);
  }, []);

  const handleUploadStart = useCallback((files: Array<{ file: File; tempUrl: string }>) => {
    const tempUrls = files.map(f => f.tempUrl);
    setUploadingImageUrls(tempUrls);
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

      setUploadingImageUrls(prev => prev.filter(url => url !== imageUrl));
    },
    [deleteFileMutation, imageInfos],
  );

  const handleImageLoadComplete = useCallback((imageUrl: string) => {
    setUploadingImageUrls(prev => prev.filter(url => url !== imageUrl));
  }, []);

  const handleImageEdit = useCallback(
    async (originalImageUrl: string, editedFile: File) => {
      const originalImageInfo = imageInfos.find(info => info.fileUrl === originalImageUrl);
      if (!originalImageInfo) {
        return;
      }

      try {
        setIsUploading(true);
        setUploadingImageUrls([originalImageUrl]);

        const uploadResults = await uploadMultiple([editedFile]);
        if (uploadResults.length === 0) {
          toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
          setIsUploading(false);
          setUploadingImageUrls([]);
          return;
        }

        const newImageUrl = uploadResults[0]?.publicUrl;
        const newFileUploadId = uploadResults[0]?.fileUploadId;
        const newFilePath = uploadResults[0]?.path;

        if (!newImageUrl || !newFileUploadId || !newFilePath) {
          toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
          setIsUploading(false);
          setUploadingImageUrls([]);
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

        setUploadingImageUrls([]);
        setIsUploading(false);
      } catch (error) {
        console.error("이미지 편집 업로드 실패:", error);
        toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
        setIsUploading(false);
        setUploadingImageUrls([]);
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
      <div className="grid grid-cols-3 gap-2">
        <ImageUpload
          currentImageCount={imageInfos.length + uploadingImageUrls.length}
          onUploadChange={handleUploadChange}
          onUploadingChange={handleUploadingChange}
          onProgressChange={handleProgressChange}
          onUploadStart={handleUploadStart}
        />
        <ImageList
          imageUrls={imageInfos.map(info => info.fileUrl)}
          uploadingImageUrls={uploadingImageUrls}
          uploadProgress={uploadProgress}
          onImageDelete={handleImageDelete}
          onImageLoadComplete={handleImageLoadComplete}
          onImageEdit={handleImageEdit}
        />
        {uploadingImageUrls.map(tempUrl => (
          <UploadingPlaceholder key={tempUrl} progress={uploadProgress} />
        ))}
      </div>
      <ImageUploadNotice />
    </SurveyQuestionTemplate>
  );
}
