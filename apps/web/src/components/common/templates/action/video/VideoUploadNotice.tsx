"use client";

import { MAX_VIDEO_FILE_SIZE_MB } from "@/constants/video";
import { MediaUploadNotice } from "../common/MediaUploadNotice";

const VIDEO_NOTICE_ITEMS = [
  "MP4, MOV,  WEBM 형식의 동영상 파일만 업로드할 수 있습니다.",
  `동영상 파일은 개당 ${MAX_VIDEO_FILE_SIZE_MB}MB 이하만 업로드할 수 있습니다.`,
  "파일 첨부는 1개만 가능합니다.",
];

export function VideoUploadNotice() {
  return <MediaUploadNotice title="동영상 첨부 유의사항" noticeItems={VIDEO_NOTICE_ITEMS} />;
}
