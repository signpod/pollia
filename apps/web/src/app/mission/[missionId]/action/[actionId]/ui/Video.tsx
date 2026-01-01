import { ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { VideoUpload } from "./VideoUpload";
import { VideoList } from "./components/VideoList";
import { VideoUploadNotice } from "./components/VideoUploadNotice";

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
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [videoFileUploadIds, setVideoFileUploadIds] = useState<string[]>([]);
  const [uploadingVideoUrl, setUploadingVideoUrl] = useState<string | null>(null);
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
      // 업로드 중이면 제출 불가
      if (isUploading) {
        updateCanGoNextRef.current?.(false);
        return;
      }

      if (!urls.length || !fileIds.length) {
        updateCanGoNextRef.current?.(false);
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
    if (existingAnswer) {
      const answerWithFileUploads = existingAnswer as typeof existingAnswer & {
        fileUploads?: Array<{
          id: string;
          originalFileName: string;
          fileSize: number;
          publicUrl: string;
        }>;
      };

      if (answerWithFileUploads.fileUploads && answerWithFileUploads.fileUploads.length > 0) {
        const videoUrlsFromAnswer = answerWithFileUploads.fileUploads.map(
          fileUpload => fileUpload.publicUrl,
        );

        const videoFileUploadIdsFromAnswer = answerWithFileUploads.fileUploads.map(
          fileUpload => fileUpload.id,
        );

        setVideoUrls(videoUrlsFromAnswer);
        setVideoFileUploadIds(videoFileUploadIdsFromAnswer);
        validateAndUpdateAnswer(videoUrlsFromAnswer, videoFileUploadIdsFromAnswer);
      } else {
        // 기존 답변이 있지만 fileUploads가 없는 경우
        // 이미 제출된 답변이므로 빈 배열로 설정하고 validation 통과
        setVideoUrls([]);
        setVideoFileUploadIds([]);
        // 기존 답변이 이미 제출되어 있으므로 validation 통과 처리
        updateCanGoNextRef.current?.(true);
      }
    }
  }, [existingAnswer, validateAndUpdateAnswer]);

  useEffect(() => {
    validateAndUpdateAnswer(videoUrls, videoFileUploadIds);
  }, [videoUrls, videoFileUploadIds, validateAndUpdateAnswer]);

  const handleUploadChange = useCallback(
    (hasUploadedVideo: boolean, newVideoUrls: string[], newFileUploadIds: string[], file?: File) => {
      if (hasUploadedVideo && newVideoUrls.length > 0 && newFileUploadIds.length > 0) {
        const newVideoUrl = newVideoUrls[0];
        const newFileUploadId = newFileUploadIds[0];

        if (newVideoUrl && newFileUploadId) {
          setUploadingVideoUrl(newVideoUrl);
          setVideoUrls(prev => [...prev, newVideoUrl]);
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
  }, []);

  const handleVideoDelete = useCallback((videoUrl: string) => {
    let deletedIndex = -1;
    setVideoUrls(prev => {
      const index = prev.indexOf(videoUrl);
      if (index === -1) return prev;
      deletedIndex = index;
      return prev.filter(url => url !== videoUrl);
    });
    setVideoFileUploadIds(prev => {
      if (deletedIndex === -1) return prev;
      return prev.filter((_, i) => i !== deletedIndex);
    });
    setUploadingVideoUrl(prev => (prev === videoUrl ? null : prev));
    // blob: URL인 경우에만 revokeObjectURL 호출 (기존 답변의 publicUrl은 제외)
    if (videoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(videoUrl);
    }
  }, []);

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
    >
      {videoUrls.length === 0 && (
        <VideoUpload
          onUploadChange={handleUploadChange}
          onUploadingChange={handleUploadingChange}
        />
      )}
      <VideoList
        videoUrls={videoUrls}
        uploadingVideoUrl={uploadingVideoUrl}
        isUploading={isUploading}
        onVideoDelete={handleVideoDelete}
        onVideoLoadComplete={handleVideoLoadComplete}
      />
      <VideoUploadNotice />
    </SurveyQuestionTemplate>
  );
}
