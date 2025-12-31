"use client";

import { MAX_IMAGE_UPLOAD_COUNT } from "@/constants/image";
import { MediaUploadNotice } from "./MediaUploadNotice";

const VIDEO_NOTICE_ITEMS = [
  "MP4, MOV, AVI 형식의 동영상 파일만 업로드할 수 있습니다.",
  "동영상 파일은 개당 100MB 이하만 업로드할 수 있습니다.",
  `파일 첨부는 최대 ${MAX_IMAGE_UPLOAD_COUNT}개까지 가능합니다.`,
];

export function VideoUploadNotice() {
  return <MediaUploadNotice title="동영상 첨부 유의사항" noticeItems={VIDEO_NOTICE_ITEMS} />;
}

