"use client";

import { useDeleteAnswer } from "@/hooks/action/useDeleteAnswer";
import { useDeleteFile } from "@/hooks/common/useDeleteFile";
import { ActionType } from "@/types/domain/action";
import type { FileInfo } from "@/types/domain/file";
import type { ActionAnswerItem, ActionDetail, GetMissionResponseResponse } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type VideoInfo = FileInfo;

interface UploadState {
  isUploading: boolean;
  progress: number;
  uploadingUrl: string | null;
}

interface UseVideoUploadStateParams {
  actionData: ActionDetail;
  missionResponse?: GetMissionResponseResponse;
  onAnswerChange: (answer: ActionAnswerItem) => void;
  updateCanGoNext: (canGoNext: boolean) => void;
}

export function useVideoUploadState({
  actionData,
  missionResponse,
  onAnswerChange,
  updateCanGoNext,
}: UseVideoUploadStateParams) {
  const { mutate: deleteFileMutation } = useDeleteFile();
  const { mutate: deleteAnswerMutation } = useDeleteAnswer();

  const [videoInfos, setVideoInfos] = useState<VideoInfo[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    uploadingUrl: null,
  });

  const isInitializedRef = useRef(false);
  const prevVideoCountRef = useRef(0);

  const existingAnswer = useMemo(() => {
    if (!missionResponse?.data?.answers?.length) return null;
    return missionResponse.data.answers.find(a => a.actionId === actionData.id) ?? null;
  }, [missionResponse, actionData.id]);

  const fileUploadIds = useMemo(
    () => videoInfos.map(v => v.fileUploadId).filter(Boolean) as string[],
    [videoInfos],
  );

  const canGoNext = useMemo(() => {
    if (uploadState.isUploading) return false;
    if (!fileUploadIds.length) return !actionData.isRequired;
    return true;
  }, [uploadState.isUploading, fileUploadIds.length, actionData.isRequired]);

  useEffect(() => {
    if (isInitializedRef.current) return;
    if (!existingAnswer) return;

    if (existingAnswer.fileUploads?.length) {
      const initialVideos: VideoInfo[] = existingAnswer.fileUploads.map(f => ({
        fileName: f.originalFileName,
        fileSize: f.fileSize,
        fileUrl: f.publicUrl,
        fileUploadId: f.id,
        filePath: f.filePath,
      }));
      setVideoInfos(initialVideos);
      prevVideoCountRef.current = initialVideos.length;
    }
    isInitializedRef.current = true;
  }, [existingAnswer]);

  useEffect(() => {
    updateCanGoNext(canGoNext);

    const answer: ActionAnswerItem = {
      actionId: actionData.id,
      type: ActionType.VIDEO,
      isRequired: actionData.isRequired,
      fileUploadIds,
      ...(actionData.nextActionId && { nextActionId: actionData.nextActionId }),
      ...(actionData.nextCompletionId && { nextCompletionId: actionData.nextCompletionId }),
    };
    onAnswerChange(answer);
  }, [
    canGoNext,
    fileUploadIds,
    actionData.id,
    actionData.isRequired,
    actionData.nextActionId,
    actionData.nextCompletionId,
    onAnswerChange,
    updateCanGoNext,
  ]);

  useEffect(() => {
    if (!isInitializedRef.current) return;

    const hadVideos = prevVideoCountRef.current > 0;
    const hasNoVideos = videoInfos.length === 0;

    if (hadVideos && hasNoVideos && existingAnswer?.id) {
      deleteAnswerMutation(existingAnswer.id);
    }

    prevVideoCountRef.current = videoInfos.length;
  }, [videoInfos.length, existingAnswer?.id, deleteAnswerMutation]);

  const addVideo = useCallback((videoInfo: VideoInfo) => {
    setVideoInfos(prev => [...prev, videoInfo]);
    setUploadState(prev => ({ ...prev, uploadingUrl: videoInfo.fileUrl }));
  }, []);

  const removeVideo = useCallback(
    (videoUrl: string) => {
      const video = videoInfos.find(v => v.fileUrl === videoUrl);
      if (!video) return;

      setVideoInfos(prev => prev.filter(v => v.fileUrl !== videoUrl));
      deleteFileMutation(video.filePath);

      if (videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }

      setUploadState(prev => ({
        ...prev,
        uploadingUrl: prev.uploadingUrl === videoUrl ? null : prev.uploadingUrl,
      }));
    },
    [videoInfos, deleteFileMutation],
  );

  const startUpload = useCallback(() => {
    setUploadState({
      isUploading: true,
      progress: 0,
      uploadingUrl: null,
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setUploadState(prev => ({ ...prev, progress }));
  }, []);

  const finishUpload = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      progress: 0,
    }));
  }, []);

  const onVideoLoaded = useCallback((videoUrl: string) => {
    setUploadState(prev => ({
      ...prev,
      uploadingUrl: prev.uploadingUrl === videoUrl ? null : prev.uploadingUrl,
    }));
  }, []);

  return {
    videoInfos,
    uploadState,
    addVideo,
    removeVideo,
    startUpload,
    updateProgress,
    finishUpload,
    onVideoLoaded,
  };
}
