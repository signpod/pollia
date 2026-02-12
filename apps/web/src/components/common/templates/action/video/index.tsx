import { ActionStepContentProps } from "@/constants/action";
import type { FileInfo } from "@/types/domain/file";
import { SurveyQuestionTemplate } from "../common/ActionTemplate";
import { UploadingPlaceholder } from "../common/UploadingPlaceholder";
import { VideoList } from "./VideoList";
import { VideoUpload } from "./VideoUpload";
import { VideoUploadNotice } from "./VideoUploadNotice";

type VideoInfo = FileInfo;

export interface VideoUploadState {
  videoInfos: VideoInfo[];
  uploadState: {
    isUploading: boolean;
    progress: number;
    uploadingUrl: string | null;
  };
  onUploadChange: (
    hasUploadedVideo: boolean,
    newVideoUrls: string[],
    newFileUploadIds: string[],
    newFilePaths: string[],
    file?: File,
  ) => void;
  onUploadingChange: (isUploading: boolean) => void;
  onProgressChange: (progress: number) => void;
  onVideoDelete: (videoUrl: string) => void;
  onVideoLoadComplete: (videoUrl: string) => void;
  onVideoPreview: (videoUrl: string) => void;
}

export interface ActionVideoProps extends ActionStepContentProps {
  upload: VideoUploadState;
}

export function ActionVideo({ actionData, upload }: ActionVideoProps) {
  const {
    videoInfos,
    uploadState,
    onUploadChange,
    onUploadingChange,
    onProgressChange,
    onVideoDelete,
    onVideoLoadComplete,
    onVideoPreview,
  } = upload;

  return (
    <SurveyQuestionTemplate
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
    >
      <div className="grid grid-cols-3 gap-2">
        <VideoUpload
          onUploadChange={onUploadChange}
          onUploadingChange={onUploadingChange}
          onProgressChange={onProgressChange}
          currentCount={videoInfos.length}
          maxCount={1}
        />
        {uploadState.isUploading && videoInfos.length === 0 && (
          <UploadingPlaceholder progress={uploadState.progress} />
        )}
        <VideoList
          videoUrls={videoInfos.map(v => v.fileUrl)}
          uploadingVideoUrl={uploadState.uploadingUrl}
          uploadProgress={uploadState.progress}
          onVideoDelete={onVideoDelete}
          onVideoLoadComplete={onVideoLoadComplete}
          onVideoPreview={onVideoPreview}
        />
      </div>
      <VideoUploadNotice />
    </SurveyQuestionTemplate>
  );
}
