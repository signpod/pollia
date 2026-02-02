"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Plus } from "lucide-react";

export interface PlusButtonProps {
  onOpenSelector?: () => void;
}

export function PlusButton({ onOpenSelector }: PlusButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenSelector?.();
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="h-8 w-8 rounded-full p-0 border-dashed hover:border-solid hover:bg-primary hover:text-primary-foreground transition-all"
      onClick={handleClick}
    >
      <Plus className="size-4" />
      <span className="sr-only">다음 단계 추가</span>
    </Button>
  );
}
