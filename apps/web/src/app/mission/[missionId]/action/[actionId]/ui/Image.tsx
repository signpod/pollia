import { ActionStepContentProps } from "@/constants/action";
import type { FileUploadInfo } from "@/types/domain/file";
import { useCallback } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { useActionContext } from "../providers/ActionContext";
import { ImageUpload } from "./ImageUpload";
import { ImageList } from "./components/ImageList";
import { ImageUploadNotice } from "./components/ImageUploadNotice";
import { UploadingPlaceholder } from "./components/UploadingPlaceholder";
import { useImageUploadState } from "./useImageUploadState";

type ImageInfo = FileUploadInfo;

export function ActionImage({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  const {
    imageInfos,
    uploadState,
    addImages,
    removeImage,
    editImage,
    startUpload,
    updateProgress,
    cancelUpload,
    onImageLoaded,
  } = useImageUploadState({
    actionData,
    missionResponse,
    onAnswerChange,
    updateCanGoNext,
  });

  const handleUploadChange = useCallback(
    (
      hasUploadedImage: boolean,
      newImageUrls: string[],
      newFileUploadIds: string[],
      newFilePaths: string[],
      tempUrls?: string[],
    ) => {
      if (!hasUploadedImage) {
        cancelUpload();
        return;
      }

      if (newImageUrls.length > 0 && newFileUploadIds.length > 0 && newFilePaths.length > 0) {
        const newInfos: ImageInfo[] = newImageUrls
          .map((url, index) => {
            const fileUploadId = newFileUploadIds[index];
            const filePath = newFilePaths[index];
            if (!fileUploadId || !filePath) return null;
            return { fileUrl: url, fileUploadId, filePath };
          })
          .filter((info): info is ImageInfo => info !== null);

        addImages(newInfos, tempUrls);
      }
    },
    [addImages, cancelUpload],
  );

  const handleUploadingChange = useCallback(
    (isUploading: boolean) => {
      if (!isUploading) {
        cancelUpload();
      }
    },
    [cancelUpload],
  );

  return (
    <SurveyQuestionTemplate
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
    >
      <div className="grid grid-cols-3 gap-2">
        <ImageUpload
          currentImageCount={imageInfos.length + uploadState.tempUrls.length}
          onUploadChange={handleUploadChange}
          onUploadingChange={handleUploadingChange}
          onProgressChange={updateProgress}
          onUploadStart={startUpload}
        />
        <ImageList
          imageUrls={imageInfos.map(info => info.fileUrl)}
          uploadingImageUrls={uploadState.tempUrls}
          uploadProgress={uploadState.progress}
          onImageDelete={removeImage}
          onImageLoadComplete={onImageLoaded}
          onImageEdit={editImage}
        />
        {uploadState.tempUrls.map(tempUrl => (
          <UploadingPlaceholder key={tempUrl} progress={uploadState.progress} />
        ))}
      </div>
      <ImageUploadNotice />
    </SurveyQuestionTemplate>
  );
}
