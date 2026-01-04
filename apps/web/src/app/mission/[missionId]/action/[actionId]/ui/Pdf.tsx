import { ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { PdfUpload } from "./PdfUpload";
import { FileList } from "./components/FileList";
import { PdfUploadNotice } from "./components/PdfUploadNotice";

interface FileInfo {
  fileName: string;
  fileSize: number;
  fileUrl: string;
}

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
        const fileInfosFromAnswer: FileInfo[] = answerWithFileUploads.fileUploads.map(
          fileUpload => ({
            fileName: fileUpload.originalFileName,
            fileSize: fileUpload.fileSize,
            fileUrl: fileUpload.publicUrl,
          }),
        );

        const fileUploadIdsFromAnswer = answerWithFileUploads.fileUploads.map(
          fileUpload => fileUpload.id,
        );

        setFileInfos(fileInfosFromAnswer);
        setFileUploadIds(fileUploadIdsFromAnswer);
        validateAndUpdateAnswer(fileUploadIdsFromAnswer);
      } else {
        // 기존 답변이 있지만 fileUploads가 없는 경우
        // 이미 제출된 답변이므로 빈 배열로 설정하고 validation 통과
        setFileInfos([]);
        setFileUploadIds([]);
        // 기존 답변이 이미 제출되어 있으므로 validation 통과 처리
        updateCanGoNextRef.current?.(true);
      }
    }
  }, [existingAnswer, validateAndUpdateAnswer]);

  useEffect(() => {
    validateAndUpdateAnswer(fileUploadIds);
  }, [fileUploadIds, validateAndUpdateAnswer]);

  const handleUploadChange = useCallback(
    (hasUploadedFile: boolean, newFileUrls: string[], newFileUploadIds: string[], file?: File) => {
      if (hasUploadedFile && newFileUrls.length > 0 && newFileUploadIds.length > 0 && file) {
        const newFileUrl = newFileUrls[0];
        const newFileUploadId = newFileUploadIds[0];

        if (newFileUrl && newFileUploadId) {
          setUploadingFileUrl(newFileUrl);
          const fileInfo: FileInfo = {
            fileName: file.name,
            fileSize: file.size,
            fileUrl: newFileUrl,
          };
          setFileInfos(prev => [...prev, fileInfo]);
          setFileUploadIds(prev => [...prev, newFileUploadId]);
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
    }
  }, []);

  const handleFileDelete = useCallback((fileUrl: string) => {
    let deletedIndex = -1;
    setFileInfos(prev => {
      const index = prev.findIndex(f => f.fileUrl === fileUrl);
      if (index === -1) return prev;
      deletedIndex = index;
      return prev.filter(f => f.fileUrl !== fileUrl);
    });
    setFileUploadIds(prev => {
      if (deletedIndex === -1) return prev;
      return prev.filter((_, i) => i !== deletedIndex);
    });
    setUploadingFileUrl(prev => (prev === fileUrl ? null : prev));
    // blob: URL인 경우에만 revokeObjectURL 호출 (기존 답변의 publicUrl은 제외)
    if (fileUrl.startsWith("blob:")) {
      URL.revokeObjectURL(fileUrl);
    }
  }, []);

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
      isNextDisabled={isNextDisabledProp}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      isLoading={isLoading}
      isRequired={actionData.isRequired}
    >
      {fileInfos.length === 0 && (
        <PdfUpload onUploadChange={handleUploadChange} onUploadingChange={handleUploadingChange} />
      )}
      <FileList
        files={fileInfos}
        uploadingFileUrl={uploadingFileUrl}
        isUploading={isUploading}
        onFileDelete={handleFileDelete}
        onFileClick={handleFileClick}
      />
      <PdfUploadNotice />
    </SurveyQuestionTemplate>
  );
}
