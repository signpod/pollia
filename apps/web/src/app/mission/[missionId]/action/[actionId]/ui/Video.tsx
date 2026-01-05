import { ActionStepContentProps } from "@/constants/action";
import { useDeleteAnswer } from "@/hooks/action/useDeleteAnswer";
import { useDeleteFile } from "@/hooks/common/useDeleteFile";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { FileInfo } from "@/types/domain/file";
import type { ActionAnswerItem } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { VideoUpload } from "./VideoUpload";
import { VideoList } from "./components/VideoList";
import { VideoUploadNotice } from "./components/VideoUploadNotice";

type VideoInfo = FileInfo;

export function ActionVideo({
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
  const [videoInfos, setVideoInfos] = useState<VideoInfo[]>([]);
  const [videoFileUploadIds, setVideoFileUploadIds] = useState<string[]>([]);
  const [uploadingVideoUrl, setUploadingVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { mutate: deleteFileMutation } = useDeleteFile();
  const { mutate: deleteAnswerMutation } = useDeleteAnswer();

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
    (fileIds: string[]) => {
      // 업로드 중이면 제출 불가
      if (isUploading) {
        updateCanGoNextRef.current?.(false);
        return;
      }

      if (!fileIds.length) {
        if (!actionData.isRequired) {
          updateCanGoNextRef.current?.(true);
          onAnswerChangeRef.current?.({
            actionId: actionData.id,
            type: ActionType.VIDEO,
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
        type: ActionType.VIDEO,
        isRequired: actionData.isRequired,
        fileUploadIds: fileIds,
      };

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      updateCanGoNextRef.current?.(validationResult.success);

      if (validationResult.success) {
        onAnswerChangeRef.current?.(answer);
      }
    },
    [actionData.id, actionData.isRequired, isUploading],
  );

  useEffect(() => {
    if (existingAnswer?.fileUploads && existingAnswer.fileUploads.length > 0) {
      const videoInfosFromAnswer: VideoInfo[] = existingAnswer.fileUploads.map(fileUpload => ({
        fileName: fileUpload.originalFileName,
        fileSize: fileUpload.fileSize,
        fileUrl: fileUpload.publicUrl,
        fileUploadId: fileUpload.id,
        filePath: fileUpload.filePath,
      }));

      const videoFileUploadIdsFromAnswer = existingAnswer.fileUploads.map(
        fileUpload => fileUpload.id,
      );

      setVideoInfos(videoInfosFromAnswer);
      setVideoFileUploadIds(videoFileUploadIdsFromAnswer);
      validateAndUpdateAnswer(videoFileUploadIdsFromAnswer);
    } else if (existingAnswer) {
      setVideoInfos([]);
      setVideoFileUploadIds([]);
      updateCanGoNextRef.current?.(true);
    }
  }, [existingAnswer, validateAndUpdateAnswer]);

  useEffect(() => {
    validateAndUpdateAnswer(videoFileUploadIds);
  }, [videoFileUploadIds, validateAndUpdateAnswer]);

  const handleUploadChange = useCallback(
    (
      hasUploadedVideo: boolean,
      newVideoUrls: string[],
      newFileUploadIds: string[],
      newFilePaths: string[],
      file?: File,
    ) => {
      if (
        hasUploadedVideo &&
        newVideoUrls.length > 0 &&
        newFileUploadIds.length > 0 &&
        newFilePaths.length > 0 &&
        file
      ) {
        const newVideoUrl = newVideoUrls[0];
        const newFileUploadId = newFileUploadIds[0];
        const newFilePath = newFilePaths[0];

        if (newVideoUrl && newFileUploadId && newFilePath) {
          setUploadingVideoUrl(newVideoUrl);
          const videoInfo: VideoInfo = {
            fileName: file.name,
            fileSize: file.size,
            fileUrl: newVideoUrl,
            fileUploadId: newFileUploadId,
            filePath: newFilePath,
          };
          setVideoInfos(prev => [...prev, videoInfo]);
          setVideoFileUploadIds(prev => [...prev, newFileUploadId]);
        }
      } else if (!hasUploadedVideo) {
        setUploadingVideoUrl(null);
      }
    },
    [],
  );

  const handleUploadingChange = useCallback((uploading: boolean) => {
    setIsUploading(uploading);
    if (!uploading) {
      setUploadingVideoUrl(null);
    }
  }, []);

  const handleVideoDelete = useCallback(
    (videoUrl: string) => {
      const videoInfo = videoInfos.find(v => v.fileUrl === videoUrl);
      if (!videoInfo) return;

      const willBeEmpty = videoInfos.length === 1;

      setVideoInfos(prev => prev.filter(v => v.fileUrl !== videoUrl));

      deleteFileMutation(videoInfo.filePath);

      setVideoFileUploadIds(prevIds => prevIds.filter(id => id !== videoInfo.fileUploadId));

      if (willBeEmpty && existingAnswer?.id) {
        deleteAnswerMutation(existingAnswer.id);
      }

      if (videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }

      setUploadingVideoUrl(prevUrl => (prevUrl === videoUrl ? null : prevUrl));
    },
    [deleteFileMutation, deleteAnswerMutation, existingAnswer, videoInfos],
  );

  const handleVideoLoadComplete = useCallback((videoUrl: string) => {
    setUploadingVideoUrl(prev => (prev === videoUrl ? null : prev));
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
      isRequired={actionData.isRequired}
    >
      {videoInfos.length === 0 && (
        <VideoUpload
          onUploadChange={handleUploadChange}
          onUploadingChange={handleUploadingChange}
        />
      )}
      <VideoList
        videoUrls={videoInfos.map(v => v.fileUrl)}
        uploadingVideoUrl={uploadingVideoUrl}
        isUploading={isUploading}
        onVideoDelete={handleVideoDelete}
        onVideoLoadComplete={handleVideoLoadComplete}
      />
      <VideoUploadNotice />
    </SurveyQuestionTemplate>
  );
}
