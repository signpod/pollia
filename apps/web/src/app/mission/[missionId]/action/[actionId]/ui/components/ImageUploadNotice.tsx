"use client";

import { MAX_IMAGE_UPLOAD_COUNT } from "@/constants/image";
import { MediaUploadNotice } from "./MediaUploadNotice";

const IMAGE_NOTICE_ITEMS = [
  "JPG,JPEG, PNG, WEBP 형식의 이미지 파일만 업로드할 수 있습니다.",
  "이미지 파일은 개당 5MB 이하만 업로드할 수 있습니다.",
  `파일 첨부는 최대 ${MAX_IMAGE_UPLOAD_COUNT}개까지 가능합니다.`,
];

export function ImageUploadNotice() {
  return <MediaUploadNotice title="사진 첨부 유의사항" noticeItems={IMAGE_NOTICE_ITEMS} />;
}
