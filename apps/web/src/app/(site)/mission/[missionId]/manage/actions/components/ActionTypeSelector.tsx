"use client";

import { ACTION_TYPE_LABELS } from "@/constants/action";
import { ActionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import {
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  GitBranch,
  ImageIcon,
  Scale,
  Star,
  Tag,
  TextCursor,
  Type,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ActionTypeSelectorProps {
  onSelect: (type: ActionType) => void;
}

interface ActionTypeItem {
  type: ActionType;
  icon: LucideIcon;
  color: string;
}

const ACTION_TYPE_ITEMS: ActionTypeItem[] = [
  { type: ActionType.MULTIPLE_CHOICE, icon: CheckSquare, color: "text-blue-500" },
  { type: ActionType.SHORT_TEXT, icon: Type, color: "text-emerald-500" },
  { type: ActionType.SUBJECTIVE, icon: TextCursor, color: "text-green-500" },
  { type: ActionType.SCALE, icon: Scale, color: "text-purple-500" },
  { type: ActionType.RATING, icon: Star, color: "text-yellow-500" },
  { type: ActionType.TAG, icon: Tag, color: "text-pink-500" },
  { type: ActionType.IMAGE, icon: ImageIcon, color: "text-orange-500" },
  { type: ActionType.VIDEO, icon: Video, color: "text-violet-500" },
  { type: ActionType.PDF, icon: FileText, color: "text-red-500" },
  { type: ActionType.DATE, icon: Calendar, color: "text-cyan-500" },
  { type: ActionType.TIME, icon: Clock, color: "text-indigo-500" },
  { type: ActionType.BRANCH, icon: GitBranch, color: "text-amber-500" },
];

export function ActionTypeSelector({ onSelect }: ActionTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Typo.SubTitle>액션 유형 선택</Typo.SubTitle>
      <div className="grid grid-cols-3 gap-3">
        {ACTION_TYPE_ITEMS.map(({ type, icon: Icon, color }) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className="flex flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-white p-4 transition-colors active:bg-zinc-50"
          >
            <Icon className={`size-6 ${color}`} />
            <Typo.Body size="small" className="text-zinc-700">
              {ACTION_TYPE_LABELS[type]}
            </Typo.Body>
          </button>
        ))}
      </div>
    </div>
  );
}
