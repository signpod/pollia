import { ActionStepContentProps } from "@/constants/action";
import type { FileUploadInfo } from "@/types/domain/file";
import { SurveyQuestionTemplate } from "../common/ActionTemplate";
import { UploadingPlaceholder } from "../common/UploadingPlaceholder";
import { ImageList } from "./ImageList";
import { ImageUpload } from "./ImageUpload";
import { ImageUploadNotice } from "./ImageUploadNotice";

type ImageInfo = FileUploadInfo;

export interface ImageUploadState {
  imageInfos: ImageInfo[];
  uploadState: {
    isUploading: boolean;
    progress: number;
    tempUrls: string[];
  };
  onUploadChange: (
    hasUploadedImage: boolean,
    newImageUrls: string[],
    newFileUploadIds: string[],
    newFilePaths: string[],
    tempUrls?: string[],
  ) => void;
  onUploadingChange: (isUploading: boolean) => void;
  onProgressChange: (progress: number) => void;
  onUploadStart: (files: Array<{ file: File; tempUrl: string }>) => void;
  onImageDelete: (imageUrl: string) => void;
  onImageLoadComplete: (imageUrl: string) => void;
  onImageEdit: (originalUrl: string, editedFile: File) => Promise<void>;
}

export interface ActionImageProps extends ActionStepContentProps {
  upload: ImageUploadState;
}

export function ActionImage({ actionData, upload }: ActionImageProps) {
  const {
    imageInfos,
    uploadState,
    onUploadChange,
    onUploadingChange,
    onProgressChange,
    onUploadStart,
    onImageDelete,
    onImageLoadComplete,
    onImageEdit,
  } = upload;

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
          onUploadChange={onUploadChange}
          onUploadingChange={onUploadingChange}
          onProgressChange={onProgressChange}
          onUploadStart={onUploadStart}
        />
        <ImageList
          imageUrls={imageInfos.map(info => info.fileUrl)}
          uploadingImageUrls={uploadState.tempUrls}
          uploadProgress={uploadState.progress}
          onImageDelete={onImageDelete}
          onImageLoadComplete={onImageLoadComplete}
          onImageEdit={onImageEdit}
        />
        {uploadState.tempUrls.map(tempUrl => (
          <UploadingPlaceholder key={tempUrl} progress={uploadState.progress} />
        ))}
      </div>
      <ImageUploadNotice />
    </SurveyQuestionTemplate>
  );
}
