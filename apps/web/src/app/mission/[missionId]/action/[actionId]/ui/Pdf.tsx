import { ActionStepContentProps } from "@/constants/action";
import { useDeleteAnswer } from "@/hooks/action/useDeleteAnswer";
import { useDeleteFile } from "@/hooks/common/useDeleteFile";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { FileInfo, TempFileInfo } from "@/types/domain/file";
import type { ActionAnswerItem } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { PdfUpload } from "./PdfUpload";
import { FileList } from "./components/FileList";
import { PdfUploadNotice } from "./components/PdfUploadNotice";

export function ActionPdf({
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
  const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);
  const [fileUploadIds, setFileUploadIds] = useState<string[]>([]);
  const [uploadingFileUrl, setUploadingFileUrl] = useState<string | null>(null);
  const [uploadingFileInfo, setUploadingFileInfo] = useState<TempFileInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { mutate: deleteFileMutation } = useDeleteFile();
  const { mutate: deleteAnswerMutation, isPending: isDeletingAnswer } = useDeleteAnswer();

  const prevHadFilesRef = useRef(false);
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
            type: ActionType.PDF,
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
        type: ActionType.PDF,
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
    if (isInitializedRef.current) return;

    if (existingAnswer?.fileUploads && existingAnswer.fileUploads.length > 0) {
      const fileInfosFromAnswer: FileInfo[] = existingAnswer.fileUploads.map(fileUpload => ({
        fileName: fileUpload.originalFileName,
        fileSize: fileUpload.fileSize,
        fileUrl: fileUpload.publicUrl,
        fileUploadId: fileUpload.id,
        filePath: fileUpload.filePath,
      }));

      const fileUploadIdsFromAnswer = existingAnswer.fileUploads.map(fileUpload => fileUpload.id);

      setFileInfos(fileInfosFromAnswer);
      setFileUploadIds(fileUploadIdsFromAnswer);
      isInitializedRef.current = true;
      validateAndUpdateAnswer(fileUploadIdsFromAnswer);
    } else if (existingAnswer) {
      setFileInfos([]);
      setFileUploadIds([]);
      isInitializedRef.current = true;
      updateCanGoNextRef.current?.(true);
    }
  }, [existingAnswer, validateAndUpdateAnswer]);

  useEffect(() => {
    validateAndUpdateAnswer(fileUploadIds);
  }, [fileUploadIds, validateAndUpdateAnswer]);

  useEffect(() => {
    if (!isInitializedRef.current) return;

    if (prevHadFilesRef.current && fileInfos.length === 0 && existingAnswer?.id) {
      deleteAnswerMutation(existingAnswer.id);
    }
    prevHadFilesRef.current = fileInfos.length > 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileInfos.length, existingAnswer?.id]);

  const handleUploadChange = useCallback(
    (
      hasUploadedFile: boolean,
      newFileUrls: string[],
      newFileUploadIds: string[],
      newFilePaths: string[],
      file?: File,
    ) => {
      if (
        hasUploadedFile &&
        newFileUrls.length > 0 &&
        newFileUploadIds.length > 0 &&
        newFilePaths.length > 0 &&
        file
      ) {
        const newFileUrl = newFileUrls[0];
        const newFileUploadId = newFileUploadIds[0];
        const newFilePath = newFilePaths[0];

        if (newFileUrl && newFileUploadId && newFilePath) {
          const fileInfo: FileInfo = {
            fileName: file.name,
            fileSize: file.size,
            fileUrl: newFileUrl,
            fileUploadId: newFileUploadId,
            filePath: newFilePath,
          };

          setFileInfos(prev => [...prev, fileInfo]);
          setFileUploadIds(prev => [...prev, newFileUploadId]);
          setUploadingFileUrl(null);
        }
      } else if (!hasUploadedFile) {
        setUploadingFileUrl(null);
      }
    },
    [],
  );

  const handleUploadingChange = useCallback((uploading: boolean) => {
    setIsUploading(uploading);
    if (!uploading) {
      setUploadingFileUrl(null);
      setUploadingFileInfo(null);
      setUploadProgress(0);
    }
  }, []);

  const handleProgressChange = useCallback((progress: number) => {
    setUploadProgress(progress);
  }, []);

  const handleUploadStart = useCallback((file: File, tempUrl: string) => {
    setUploadingFileUrl(tempUrl);
    setUploadingFileInfo({
      fileName: file.name,
      fileSize: file.size,
      fileUrl: tempUrl,
    });
  }, []);

  const handleFileDelete = useCallback(
    (fileUrl: string) => {
      const fileInfo = fileInfos.find(f => f.fileUrl === fileUrl);
      if (!fileInfo) return;

      setFileInfos(prev => prev.filter(f => f.fileUrl !== fileUrl));

      if (fileInfo.filePath) {
        deleteFileMutation(fileInfo.filePath);
      }

      if (fileInfo.fileUploadId) {
        setFileUploadIds(prev => prev.filter(id => id !== fileInfo.fileUploadId));
      }
    },
    [deleteFileMutation, fileInfos],
  );

  const handleFileClick = useCallback((fileUrl: string) => {
    window.open(fileUrl, "_blank");
  }, []);

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalActionCount={totalActionCount}
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isFirstAction={isFirstAction}
      isNextDisabled={isNextDisabledProp || isDeletingAnswer}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      isLoading={isLoading}
      isRequired={actionData.isRequired}
    >
      <div className="flex flex-col gap-3">
        <PdfUpload
          onUploadChange={handleUploadChange}
          onUploadingChange={handleUploadingChange}
          onProgressChange={handleProgressChange}
          onUploadStart={handleUploadStart}
          currentCount={fileInfos.length}
          maxCount={1}
        />
        {(fileInfos.length > 0 || uploadingFileInfo) && (
          <FileList
            files={uploadingFileInfo ? [...fileInfos, uploadingFileInfo] : fileInfos}
            uploadingFileUrl={uploadingFileUrl}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onFileDelete={handleFileDelete}
            onFileClick={handleFileClick}
          />
        )}
      </div>
      <PdfUploadNotice />
    </SurveyQuestionTemplate>
  );
}
