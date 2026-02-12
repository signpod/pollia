"use client";

import { useDeleteAnswer } from "@/hooks/action/useDeleteAnswer";
import { useDeleteFile } from "@/hooks/common/useDeleteFile";
import { ActionType } from "@/types/domain/action";
import type { FileInfo, TempFileInfo } from "@/types/domain/file";
import type { ActionAnswerItem, ActionDetail, GetMissionResponseResponse } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UploadState {
  isUploading: boolean;
  progress: number;
  tempFileInfo: TempFileInfo | null;
}

interface UsePdfUploadStateParams {
  actionData: ActionDetail;
  missionResponse?: GetMissionResponseResponse;
  onAnswerChange: (answer: ActionAnswerItem) => void;
  updateCanGoNext: (canGoNext: boolean) => void;
}

export function usePdfUploadState({
  actionData,
  missionResponse,
  onAnswerChange,
  updateCanGoNext,
}: UsePdfUploadStateParams) {
  const { mutate: deleteFileMutation } = useDeleteFile();
  const { mutate: deleteAnswerMutation } = useDeleteAnswer();

  const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    tempFileInfo: null,
  });

  const isInitializedRef = useRef(false);
  const prevFileCountRef = useRef(0);

  const existingAnswer = useMemo(() => {
    if (!missionResponse?.data?.answers?.length) return null;
    return missionResponse.data.answers.find(a => a.actionId === actionData.id) ?? null;
  }, [missionResponse, actionData.id]);

  const fileUploadIds = useMemo(
    () => fileInfos.map(f => f.fileUploadId).filter(Boolean) as string[],
    [fileInfos],
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
      const initialFiles: FileInfo[] = existingAnswer.fileUploads.map(f => ({
        fileName: f.originalFileName,
        fileSize: f.fileSize,
        fileUrl: f.publicUrl,
        fileUploadId: f.id,
        filePath: f.filePath,
      }));
      setFileInfos(initialFiles);
      prevFileCountRef.current = initialFiles.length;
    }
    isInitializedRef.current = true;
  }, [existingAnswer]);

  useEffect(() => {
    updateCanGoNext(canGoNext);

    const answer: ActionAnswerItem = {
      actionId: actionData.id,
      type: ActionType.PDF,
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

    const hadFiles = prevFileCountRef.current > 0;
    const hasNoFiles = fileInfos.length === 0;

    if (hadFiles && hasNoFiles && existingAnswer?.id) {
      deleteAnswerMutation(existingAnswer.id);
    }

    prevFileCountRef.current = fileInfos.length;
  }, [fileInfos.length, existingAnswer?.id, deleteAnswerMutation]);

  const addFile = useCallback((fileInfo: FileInfo) => {
    setFileInfos(prev => [...prev, fileInfo]);
    setUploadState({ isUploading: false, progress: 0, tempFileInfo: null });
  }, []);

  const removeFile = useCallback(
    (fileUrl: string) => {
      const file = fileInfos.find(f => f.fileUrl === fileUrl);
      if (!file) return;

      setFileInfos(prev => prev.filter(f => f.fileUrl !== fileUrl));
      if (file.filePath) {
        deleteFileMutation(file.filePath);
      }
    },
    [fileInfos, deleteFileMutation],
  );

  const startUpload = useCallback((file: File, tempUrl: string) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      tempFileInfo: {
        fileName: file.name,
        fileSize: file.size,
        fileUrl: tempUrl,
      },
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setUploadState(prev => ({ ...prev, progress }));
  }, []);

  const cancelUpload = useCallback(() => {
    setUploadState({ isUploading: false, progress: 0, tempFileInfo: null });
  }, []);

  return {
    fileInfos,
    fileUploadIds,
    uploadState,
    canGoNext,
    addFile,
    removeFile,
    startUpload,
    updateProgress,
    cancelUpload,
  };
}
