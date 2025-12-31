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
      if (!urls.length || !fileIds.length) {
        updateCanGoNextRef.current?.(false);
        return;
      }

      const answer: ActionAnswerItem = {
        actionId: actionData.id,
        type: ActionType.VIDEO,
        fileUploadIds: fileIds,
      };

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      updateCanGoNextRef.current?.(validationResult.success);

      if (validationResult.success) {
        onAnswerChangeRef.current?.(answer);
      }
    },
    [actionData.id],
  );

  useEffect(() => {
    if (existingAnswer) {
      setVideoUrls([]);
      setVideoFileUploadIds([]);
      validateAndUpdateAnswer([], []);
    }
  }, [existingAnswer, validateAndUpdateAnswer]);

  useEffect(() => {
    validateAndUpdateAnswer(videoUrls, videoFileUploadIds);
  }, [videoUrls, videoFileUploadIds, validateAndUpdateAnswer]);

  const handleUploadChange = useCallback(
    (hasUploadedVideo: boolean, newVideoUrls: string[], newFileUploadIds: string[]) => {
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
      <VideoUpload onUploadChange={handleUploadChange} onUploadingChange={handleUploadingChange} />
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
