"use client";

import { MediaUploadNotice } from "./MediaUploadNotice";

const VIDEO_NOTICE_ITEMS = [
  "MP4, MOV, HEIC, WEBM 형식의 동영상 파일만 업로드할 수 있습니다.",
  "파일 크기는 개당 50MB 이하로 제한됩니다.",
  "파일 첨부는 최대 10개까지 가능합니다.",
];

export function VideoUploadNotice() {
  return <MediaUploadNotice title="동영상 첨부 유의사항" noticeItems={VIDEO_NOTICE_ITEMS} />;
}
