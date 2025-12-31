"use client";

import { ActionType } from "@/types/domain/action";
import { getFileSizeLabel } from "@/constants/fileUpload";
import { MediaUploadNotice } from "./MediaUploadNotice";

const PDF_NOTICE_ITEMS = [
  "PDF 형식의 파일만 업로드할 수 있습니다.",
  `PDF 파일은 개당 ${getFileSizeLabel(ActionType.PDF)} 이하만 업로드할 수 있습니다.`,
  "파일 첨부는 최대 1개까지 가능합니다.",
];

export function PdfUploadNotice() {
  return <MediaUploadNotice title="PDF 첨부 유의사항" noticeItems={PDF_NOTICE_ITEMS} />;
}

