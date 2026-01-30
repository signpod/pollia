import { ActionStepContentProps } from "@/constants/action";
import type { FileInfo } from "@/types/domain/file";
import { useCallback } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { useActionContext } from "../providers/ActionContext";
import { PdfUpload } from "./PdfUpload";
import { FileList } from "./components/FileList";
import { PdfUploadNotice } from "./components/PdfUploadNotice";
import { usePdfUploadState } from "./usePdfUploadState";

export function ActionPdf({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  const {
    fileInfos,
    uploadState,
    addFile,
    removeFile,
    startUpload,
    updateProgress,
    cancelUpload,
  } = usePdfUploadState({
    actionData,
    missionResponse,
    onAnswerChange,
    updateCanGoNext,
  });

  const handleUploadChange = useCallback(
    (
      hasUploadedFile: boolean,
      newFileUrls: string[],
      newFileUploadIds: string[],
      newFilePaths: string[],
      file?: File,
    ) => {
      if (!hasUploadedFile) {
        cancelUpload();
        return;
      }

      const [url, id, path] = [newFileUrls[0], newFileUploadIds[0], newFilePaths[0]];
      if (url && id && path && file) {
        const fileInfo: FileInfo = {
          fileName: file.name,
          fileSize: file.size,
          fileUrl: url,
          fileUploadId: id,
          filePath: path,
        };
        addFile(fileInfo);
      }
    },
    [addFile, cancelUpload],
  );

  const handleUploadingChange = useCallback(
    (isUploading: boolean) => {
      if (!isUploading) {
        cancelUpload();
      }
    },
    [cancelUpload],
  );

  const displayFiles = uploadState.tempFileInfo
    ? [...fileInfos, uploadState.tempFileInfo]
    : fileInfos;

  return (
    <SurveyQuestionTemplate
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
    >
      <div className="flex flex-col gap-3">
        <PdfUpload
          onUploadChange={handleUploadChange}
          onUploadingChange={handleUploadingChange}
          onProgressChange={updateProgress}
          onUploadStart={startUpload}
          currentCount={fileInfos.length}
          maxCount={1}
        />
        {displayFiles.length > 0 && (
          <FileList
            files={displayFiles}
            uploadingFileUrl={uploadState.tempFileInfo?.fileUrl ?? null}
            isUploading={uploadState.isUploading}
            uploadProgress={uploadState.progress}
            onFileDelete={removeFile}
          />
        )}
      </div>
      <PdfUploadNotice />
    </SurveyQuestionTemplate>
  );
}
