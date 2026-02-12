import { ActionStepContentProps } from "@/constants/action";
import type { FileInfo } from "@/types/domain/file";
import { SurveyQuestionTemplate } from "../common/ActionTemplate";
import { FileList } from "./FileList";
import { PdfUpload } from "./PdfUpload";
import { PdfUploadNotice } from "./PdfUploadNotice";

interface TempFileInfo {
  fileName: string;
  fileSize: number;
  fileUrl: string;
}

export interface PdfUploadState {
  fileInfos: FileInfo[];
  uploadState: {
    isUploading: boolean;
    progress: number;
    tempFileInfo: TempFileInfo | null;
  };
  onUploadChange: (
    hasUploadedFile: boolean,
    newFileUrls: string[],
    newFileUploadIds: string[],
    newFilePaths: string[],
    file?: File,
  ) => void;
  onUploadingChange: (isUploading: boolean) => void;
  onProgressChange: (progress: number) => void;
  onFileDelete: (fileUrl: string) => void;
}

export interface ActionPdfProps extends ActionStepContentProps {
  upload: PdfUploadState;
}

export function ActionPdf({ actionData, upload }: ActionPdfProps) {
  const {
    fileInfos,
    uploadState,
    onUploadChange,
    onUploadingChange,
    onProgressChange,
    onFileDelete,
  } = upload;

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
          onUploadChange={onUploadChange}
          onUploadingChange={onUploadingChange}
          onProgressChange={onProgressChange}
          onUploadStart={() => {}}
          currentCount={fileInfos.length}
          maxCount={1}
        />
        {displayFiles.length > 0 && (
          <FileList
            files={displayFiles}
            uploadingFileUrl={uploadState.tempFileInfo?.fileUrl ?? null}
            isUploading={uploadState.isUploading}
            uploadProgress={uploadState.progress}
            onFileDelete={onFileDelete}
          />
        )}
      </div>
      <PdfUploadNotice />
    </SurveyQuestionTemplate>
  );
}
