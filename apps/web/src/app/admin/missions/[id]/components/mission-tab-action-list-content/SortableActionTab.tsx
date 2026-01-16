"use client";

import type { ActionDetail } from "@/types/dto";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { getActionTypeInfo, getDisplayOrder } from "./action-type-info";

interface SortableActionTabProps {
  action: ActionDetail;
  isSelected: boolean;
  onSelect: () => void;
}

export function SortableActionTab({ action, isSelected, onSelect }: SortableActionTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeInfo = getActionTypeInfo(action.type);
  const TypeIcon = typeInfo.icon;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <button
        type="button"
        onClick={onSelect}
        className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2 transition-colors ${
          isSelected
            ? "bg-background border-primary text-foreground"
            : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
        }`}
      >
        <div
          className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5 text-muted-foreground" />
        </div>
        <TypeIcon className={`size-4 ${typeInfo.color}`} />
        <span className="text-sm font-medium whitespace-nowrap">
          {getDisplayOrder(action.order)}.{" "}
          {action.title.length > 15 ? `${action.title.slice(0, 15)}...` : action.title}
        </span>
      </button>
    </div>
  );
}
