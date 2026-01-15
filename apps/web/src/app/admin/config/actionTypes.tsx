import { getActionTypeLabel } from "@/app/admin/constants/actionTypes";
import type { ActionType } from "@prisma/client";
import {
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  Hash,
  ImageIcon,
  type LucideIcon,
  MessageSquare,
  SlidersHorizontal,
  Star,
  Text,
  Video,
} from "lucide-react";

export interface ActionTypeConfig {
  value: ActionType;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const ACTION_TYPE_CONFIGS: readonly ActionTypeConfig[] = [
  {
    value: "MULTIPLE_CHOICE",
    label: getActionTypeLabel("MULTIPLE_CHOICE"),
    description: "여러 선택지 중 하나 이상을 선택",
    icon: ClipboardList,
  },
  {
    value: "SCALE",
    label: getActionTypeLabel("SCALE"),
    description: "관리자가 설정한 스케일로 응답",
    icon: SlidersHorizontal,
  },
  {
    value: "RATING",
    label: getActionTypeLabel("RATING"),
    description: "1~10점인 별점으로 평가",
    icon: Star,
  },
  {
    value: "TAG",
    label: getActionTypeLabel("TAG"),
    description: "여러 태그 중 선택",
    icon: Hash,
  },
  {
    value: "SUBJECTIVE",
    label: getActionTypeLabel("SUBJECTIVE"),
    description: "자유롭게 텍스트로 응답",
    icon: MessageSquare,
  },
  {
    value: "SHORT_TEXT",
    label: getActionTypeLabel("SHORT_TEXT"),
    description: "짧은 텍스트 입력 (최대 50자)",
    icon: Text,
  },
  {
    value: "IMAGE",
    label: getActionTypeLabel("IMAGE"),
    description: "이미지 파일을 업로드하여 응답",
    icon: ImageIcon,
  },
  {
    value: "PDF",
    label: getActionTypeLabel("PDF"),
    description: "PDF 파일을 업로드하여 응답",
    icon: FileText,
  },
  {
    value: "VIDEO",
    label: getActionTypeLabel("VIDEO"),
    description: "동영상 파일을 업로드하여 응답",
    icon: Video,
  },
  {
    value: "DATE",
    label: getActionTypeLabel("DATE"),
    description: "날짜를 선택하여 응답",
    icon: Calendar,
  },
  {
    value: "TIME",
    label: getActionTypeLabel("TIME"),
    description: "시간을 선택하여 응답",
    icon: Clock,
  },
] as const;
