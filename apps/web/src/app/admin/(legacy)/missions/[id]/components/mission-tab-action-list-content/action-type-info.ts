import { ACTION_TYPE_LABELS } from "@/constants/action";
import { ActionType } from "@prisma/client";
import {
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  ImageIcon,
  type LucideIcon,
  Scale,
  Star,
  Tag,
  TextCursor,
  Video,
} from "lucide-react";

export interface ActionTypeInfo {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const getDisplayOrder = (order: number | null | undefined) =>
  order === null || order === undefined ? null : `#${order + 1}`;

export function getActionTypeInfo(type: ActionType): ActionTypeInfo {
  const label = ACTION_TYPE_LABELS[type] || "기타";

  switch (type) {
    case ActionType.MULTIPLE_CHOICE:
      return {
        label,
        icon: CheckSquare,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950",
      };
    case ActionType.SCALE:
      return {
        label,
        icon: Scale,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-50 dark:bg-purple-950",
      };
    case ActionType.SUBJECTIVE:
      return {
        label,
        icon: TextCursor,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-950",
      };
    case ActionType.IMAGE:
      return {
        label,
        icon: ImageIcon,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-950",
      };
    case ActionType.PDF:
      return {
        label,
        icon: FileText,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-950",
      };
    case ActionType.VIDEO:
      return {
        label,
        icon: Video,
        color: "text-violet-600 dark:text-violet-400",
        bgColor: "bg-violet-50 dark:bg-violet-950",
      };
    case ActionType.RATING:
      return {
        label,
        icon: Star,
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-50 dark:bg-yellow-950",
      };
    case ActionType.TAG:
      return {
        label,
        icon: Tag,
        color: "text-pink-600 dark:text-pink-400",
        bgColor: "bg-pink-50 dark:bg-pink-950",
      };
    case ActionType.DATE:
      return {
        label,
        icon: Calendar,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-50 dark:bg-cyan-950",
      };
    case ActionType.TIME:
      return {
        label,
        icon: Clock,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-50 dark:bg-indigo-950",
      };
    default:
      return {
        label,
        icon: FileText,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-950",
      };
  }
}
