"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { cn } from "@/app/admin/lib/utils";
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
    <div ref={setNodeRef} style={style} className="w-full">
      <Button
        variant="ghost"
        onClick={onSelect}
        className={cn(
          "w-full h-auto p-3 justify-start hover:bg-accent/50 transition-colors",
          isSelected && "bg-accent border-2 border-primary/20",
        )}
      >
        <div className="flex items-center gap-3 w-full min-w-0">
          <div
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4 text-muted-foreground" />
          </div>
          <div
            className={`flex items-center justify-center shrink-0 w-10 h-10 rounded-md ${typeInfo.bgColor}`}
          >
            <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4
              className={cn(
                "text-sm truncate",
                isSelected ? "font-semibold text-foreground" : "font-medium text-foreground/80",
              )}
            >
              {action.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{typeInfo.label}</span>
              {action.order !== null && (
                <>
                  <span>•</span>
                  <span>{getDisplayOrder(action.order)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Button>
    </div>
  );
}
