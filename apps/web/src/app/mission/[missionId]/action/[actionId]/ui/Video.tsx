import { ActionStepContentProps } from "@/constants/action";
import type { FileInfo } from "@/types/domain/file";
import { useCallback } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { useActionContext } from "../providers/ActionContext";
import { VideoUpload } from "./VideoUpload";
import { UploadingPlaceholder } from "./components/UploadingPlaceholder";
import { VideoList } from "./components/VideoList";
import { VideoUploadNotice } from "./components/VideoUploadNotice";
import { useVideoUploadState } from "./useVideoUploadState";

type VideoInfo = FileInfo;

export function ActionVideo({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  const {
    videoInfos,
    uploadState,
    addVideo,
    removeVideo,
    startUpload,
    updateProgress,
    finishUpload,
    onVideoLoaded,
  } = useVideoUploadState({
    actionData,
    missionResponse,
    onAnswerChange,
    updateCanGoNext,
  });

  const handleUploadChange = useCallback(
    (
      hasUploadedVideo: boolean,
      newVideoUrls: string[],
      newFileUploadIds: string[],
      newFilePaths: string[],
      file?: File,
    ) => {
      if (!hasUploadedVideo) {
        finishUpload();
        return;
      }

      const [url, id, path] = [newVideoUrls[0], newFileUploadIds[0], newFilePaths[0]];
      if (url && id && path && file) {
        const videoInfo: VideoInfo = {
          fileName: file.name,
          fileSize: file.size,
          fileUrl: url,
          fileUploadId: id,
          filePath: path,
        };
        addVideo(videoInfo);
        finishUpload();
      }
    },
    [addVideo, finishUpload],
  );

  const handleUploadingChange = useCallback(
    (isUploading: boolean) => {
      if (isUploading) {
        startUpload();
      } else {
        finishUpload();
      }
    },
    [startUpload, finishUpload],
  );

  const handleVideoPreview = useCallback((videoUrl: string) => {
    window.open(videoUrl, "_blank");
  }, []);

  return (
    <SurveyQuestionTemplate
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
    >
      <div className="grid grid-cols-3 gap-2">
        <VideoUpload
          onUploadChange={handleUploadChange}
          onUploadingChange={handleUploadingChange}
          onProgressChange={updateProgress}
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
          onVideoDelete={removeVideo}
          onVideoLoadComplete={onVideoLoaded}
          onVideoPreview={handleVideoPreview}
        />
      </div>
      <VideoUploadNotice />
    </SurveyQuestionTemplate>
  );
}
