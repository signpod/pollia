import { ActionStepContentProps } from "@/constants/action";
import { useDeleteAnswer } from "@/hooks/action/useDeleteAnswer";
import { useDeleteFile } from "@/hooks/common/useDeleteFile";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { FileInfo } from "@/types/domain/file";
import type { ActionAnswerItem } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { useActionContext } from "../providers/ActionContext";
import { VideoUpload } from "./VideoUpload";
import { UploadingPlaceholder } from "./components/UploadingPlaceholder";
import { VideoList } from "./components/VideoList";
import { VideoUploadNotice } from "./components/VideoUploadNotice";

type VideoInfo = FileInfo;

export function ActionVideo({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  const [videoInfos, setVideoInfos] = useState<VideoInfo[]>([]);
  const [videoFileUploadIds, setVideoFileUploadIds] = useState<string[]>([]);
  const [uploadingVideoUrl, setUploadingVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { mutate: deleteFileMutation } = useDeleteFile();
  const { mutate: deleteAnswerMutation, isPending: isDeletingAnswer } = useDeleteAnswer();

  const prevHadVideosRef = useRef(false);
  const isInitializedRef = useRef(false);

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
            ...(actionData.nextActionId && { nextActionId: actionData.nextActionId }),
            ...(actionData.nextCompletionId && { nextCompletionId: actionData.nextCompletionId }),
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
        ...(actionData.nextActionId && { nextActionId: actionData.nextActionId }),
        ...(actionData.nextCompletionId && { nextCompletionId: actionData.nextCompletionId }),
      };

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      updateCanGoNextRef.current?.(validationResult.success);

      if (validationResult.success) {
        onAnswerChangeRef.current?.(answer);
      }
    },
    [actionData.id, actionData.isRequired, isUploading, actionData.nextActionId, actionData.nextCompletionId],
  );

  useEffect(() => {
    if (isInitializedRef.current) return;

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
      isInitializedRef.current = true;
      validateAndUpdateAnswer(videoFileUploadIdsFromAnswer);
    } else if (existingAnswer) {
      setVideoInfos([]);
      setVideoFileUploadIds([]);
      isInitializedRef.current = true;
      updateCanGoNextRef.current?.(true);
    }
  }, [existingAnswer, validateAndUpdateAnswer]);

  useEffect(() => {
    validateAndUpdateAnswer(videoFileUploadIds);
  }, [videoFileUploadIds, validateAndUpdateAnswer]);

  useEffect(() => {
    if (!isInitializedRef.current) return;

    if (prevHadVideosRef.current && videoInfos.length === 0 && existingAnswer?.id) {
      deleteAnswerMutation(existingAnswer.id);
    }
    prevHadVideosRef.current = videoInfos.length > 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoInfos.length, existingAnswer?.id]);

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
      setUploadProgress(0);
    }
  }, []);

  const handleProgressChange = useCallback((progress: number) => {
    setUploadProgress(progress);
  }, []);

  const handleVideoDelete = useCallback(
    (videoUrl: string) => {
      const videoInfo = videoInfos.find(v => v.fileUrl === videoUrl);
      if (!videoInfo) return;

      setVideoInfos(prev => prev.filter(v => v.fileUrl !== videoUrl));

      deleteFileMutation(videoInfo.filePath);

      setVideoFileUploadIds(prevIds => prevIds.filter(id => id !== videoInfo.fileUploadId));

      if (videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }

      setUploadingVideoUrl(prevUrl => (prevUrl === videoUrl ? null : prevUrl));
    },
    [deleteFileMutation, videoInfos],
  );

  const handleVideoLoadComplete = useCallback((videoUrl: string) => {
    setUploadingVideoUrl(prev => (prev === videoUrl ? null : prev));
  }, []);

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
          onProgressChange={handleProgressChange}
          currentCount={videoInfos.length}
          maxCount={1}
        />
        {isUploading && videoInfos.length === 0 && (
          <UploadingPlaceholder progress={uploadProgress} />
        )}
        <VideoList
          videoUrls={videoInfos.map(v => v.fileUrl)}
          uploadingVideoUrl={uploadingVideoUrl}
          uploadProgress={uploadProgress}
          onVideoDelete={handleVideoDelete}
          onVideoLoadComplete={handleVideoLoadComplete}
          onVideoPreview={handleVideoPreview}
        />
      </div>
      <VideoUploadNotice />
    </SurveyQuestionTemplate>
  );
}
