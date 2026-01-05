export interface FileUploadInfo {
  fileUrl: string;
  fileUploadId: string;
  filePath: string;
}

export interface FileInfo extends FileUploadInfo {
  fileName: string;
  fileSize: number;
}
