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
      if (!fileIds.length) {
        updateCanGoNextRef.current?.(false);
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
    [actionData.id, actionData.isRequired],
  );

  useEffect(() => {
    if (existingAnswer) {
      setFileInfos([]);
      setFileUploadIds([]);
      validateAndUpdateAnswer([]);
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
    URL.revokeObjectURL(fileUrl);
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
