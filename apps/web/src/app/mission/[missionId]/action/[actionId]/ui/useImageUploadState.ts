"use client";

import { toast } from "@/components/common/Toast";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { useDeleteAnswer } from "@/hooks/action/useDeleteAnswer";
import { useDeleteFile } from "@/hooks/common/useDeleteFile";
import { useMultipleImageUpload } from "@/hooks/common/useImageUpload";
import { ActionType } from "@/types/domain/action";
import type { FileUploadInfo } from "@/types/domain/file";
import type { ActionAnswerItem, ActionDetail, GetMissionResponseResponse } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const IMAGE_UPLOAD_ERROR_MESSAGE = "이미지 업로드에 실패했어요.\n다시 시도해주세요." as const;

type ImageInfo = FileUploadInfo;

interface UploadState {
  isUploading: boolean;
  progress: number;
  tempUrls: string[];
}

interface UseImageUploadStateParams {
  actionData: ActionDetail;
  missionResponse?: GetMissionResponseResponse;
  onAnswerChange: (answer: ActionAnswerItem) => void;
  updateCanGoNext: (canGoNext: boolean) => void;
}

export function useImageUploadState({
  actionData,
  missionResponse,
  onAnswerChange,
  updateCanGoNext,
}: UseImageUploadStateParams) {
  const { mutate: deleteFileMutation } = useDeleteFile();
  const { mutate: deleteAnswerMutation } = useDeleteAnswer();

  const [imageInfos, setImageInfos] = useState<ImageInfo[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    tempUrls: [],
  });

  const isInitializedRef = useRef(false);
  const isReuploadingRef = useRef(false);
  const prevImageCountRef = useRef(0);

  const { uploadMultiple } = useMultipleImageUpload({
    bucket: STORAGE_BUCKETS.ACTION_ANSWER_IMAGES,
    onError: error => {
      toast.warning(error.message || IMAGE_UPLOAD_ERROR_MESSAGE);
    },
  });

  const existingAnswer = useMemo(() => {
    if (!missionResponse?.data?.answers?.length) return null;
    return missionResponse.data.answers.find(a => a.actionId === actionData.id) ?? null;
  }, [missionResponse, actionData.id]);

  // 파생 상태
  const fileUploadIds = useMemo(() => imageInfos.map(i => i.fileUploadId), [imageInfos]);

  const canGoNext = useMemo(() => {
    if (uploadState.isUploading) return false;
    if (!fileUploadIds.length) return !actionData.isRequired;
    return true;
  }, [uploadState.isUploading, fileUploadIds.length, actionData.isRequired]);

  // 초기화 + 재업로드 로직
  useEffect(() => {
    if (isInitializedRef.current) return;
    if (!existingAnswer) return;

    if (existingAnswer.fileUploads?.length) {
      const reuploadExistingImages = async () => {
        if (isReuploadingRef.current) return;
        isReuploadingRef.current = true;

        const initialInfos: ImageInfo[] = existingAnswer.fileUploads.map(f => ({
          fileUrl: f.publicUrl,
          fileUploadId: f.id,
          filePath: f.filePath,
        }));

        setImageInfos(initialInfos);
        prevImageCountRef.current = initialInfos.length;
        isInitializedRef.current = true;

        try {
          const files = await Promise.all(
            initialInfos.map(async info => {
              const response = await fetch(info.fileUrl);
              const blob = await response.blob();
              const extension = info.fileUrl.split(".").pop()?.split("?")[0] || "jpg";
              return new File([blob], `image.${extension}`, { type: blob.type });
            }),
          );

          const uploadResults = await uploadMultiple(files);

          if (uploadResults.length > 0) {
            setImageInfos(prev =>
              prev.map((oldInfo, index) => {
                const result = uploadResults[index];
                if (!result?.fileUploadId || !result?.path) return oldInfo;
                return {
                  fileUrl: oldInfo.fileUrl,
                  fileUploadId: result.fileUploadId,
                  filePath: result.path,
                };
              }),
            );
          }
        } catch (error) {
          console.error("기존 이미지 재업로드 실패:", error);
        }
      };

      reuploadExistingImages();
    } else {
      isInitializedRef.current = true;
    }
  }, [existingAnswer, uploadMultiple]);

  // 통합 effect: canGoNext 업데이트 + 답변 동기화
  useEffect(() => {
    updateCanGoNext(canGoNext);

    const answer: ActionAnswerItem = {
      actionId: actionData.id,
      type: ActionType.IMAGE,
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

  // 이미지 모두 삭제 시 answer 삭제
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const hadImages = prevImageCountRef.current > 0;
    const hasNoImages = imageInfos.length === 0;

    if (hadImages && hasNoImages && existingAnswer?.id) {
      deleteAnswerMutation(existingAnswer.id);
    }

    prevImageCountRef.current = imageInfos.length;
  }, [imageInfos.length, existingAnswer?.id, deleteAnswerMutation]);

  // 이미지 추가
  const addImages = useCallback((newInfos: ImageInfo[], tempUrls?: string[]) => {
    setImageInfos(prev => {
      const existingUrlsSet = new Set(prev.map(info => info.fileUrl));
      const filtered = newInfos.filter(info => !existingUrlsSet.has(info.fileUrl));
      return [...prev, ...filtered];
    });

    if (tempUrls) {
      tempUrls.forEach(url => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    }

    setUploadState({ isUploading: false, progress: 0, tempUrls: [] });
  }, []);

  // 이미지 삭제
  const removeImage = useCallback(
    (imageUrl: string) => {
      const info = imageInfos.find(i => i.fileUrl === imageUrl);
      if (!info) return;

      setImageInfos(prev => prev.filter(i => i.fileUrl !== imageUrl));
      deleteFileMutation(info.filePath);

      if (imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }

      setUploadState(prev => ({
        ...prev,
        tempUrls: prev.tempUrls.filter(url => url !== imageUrl),
      }));
    },
    [imageInfos, deleteFileMutation],
  );

  // 이미지 편집 (교체)
  const editImage = useCallback(
    async (originalUrl: string, editedFile: File) => {
      const originalInfo = imageInfos.find(i => i.fileUrl === originalUrl);
      if (!originalInfo) return;

      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        tempUrls: [originalUrl],
      }));

      try {
        const results = await uploadMultiple([editedFile]);
        const result = results[0];

        if (!result?.publicUrl || !result?.fileUploadId || !result?.path) {
          toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
          setUploadState({ isUploading: false, progress: 0, tempUrls: [] });
          return;
        }

        setImageInfos(prev => {
          const index = prev.findIndex(i => i.fileUrl === originalUrl);
          if (index === -1) return prev;

          const updated = [...prev];
          updated[index] = {
            fileUrl: result.publicUrl,
            fileUploadId: result.fileUploadId,
            filePath: result.path,
          };
          return updated;
        });

        deleteFileMutation(originalInfo.filePath);
        setUploadState({ isUploading: false, progress: 0, tempUrls: [] });
      } catch (error) {
        console.error("이미지 편집 업로드 실패:", error);
        toast.warning(IMAGE_UPLOAD_ERROR_MESSAGE);
        setUploadState({ isUploading: false, progress: 0, tempUrls: [] });
      }
    },
    [imageInfos, uploadMultiple, deleteFileMutation],
  );

  // 업로드 시작
  const startUpload = useCallback((files: Array<{ file: File; tempUrl: string }>) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      tempUrls: files.map(f => f.tempUrl),
    });
  }, []);

  // 진행률 업데이트
  const updateProgress = useCallback((progress: number) => {
    setUploadState(prev => ({ ...prev, progress }));
  }, []);

  // 업로드 취소
  const cancelUpload = useCallback(() => {
    setUploadState({ isUploading: false, progress: 0, tempUrls: [] });
  }, []);

  // 이미지 로드 완료
  const onImageLoaded = useCallback((imageUrl: string) => {
    setUploadState(prev => ({
      ...prev,
      tempUrls: prev.tempUrls.filter(url => url !== imageUrl),
    }));
  }, []);

  return {
    imageInfos,
    uploadState,
    addImages,
    removeImage,
    editImage,
    startUpload,
    updateProgress,
    cancelUpload,
    onImageLoaded,
  };
}
