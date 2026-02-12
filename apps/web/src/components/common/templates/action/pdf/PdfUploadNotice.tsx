"use client";

import { getFileSizeLabel } from "@/constants/fileUpload";
import { ActionType } from "@/types/domain/action";
import { MediaUploadNotice } from "../common/MediaUploadNotice";

const PDF_NOTICE_ITEMS = [
  "PDF 형식의 파일만 업로드할 수 있습니다.",
  `파일 크기는 ${getFileSizeLabel(ActionType.PDF)} 이하로 제한됩니다.`,
  "파일 첨부는 1개만 가능합니다.",
];

export function PdfUploadNotice() {
  return <MediaUploadNotice title="파일 첨부 유의사항" noticeItems={PDF_NOTICE_ITEMS} />;
}
