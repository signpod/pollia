"use client";

import { Button, IconButton, Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components";
import { Copy, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";

interface EditorItemMenuSlotProps {
  onDelete: () => void;
  onDuplicate: () => void;
  deleteDisabled?: boolean;
  duplicateDisabled?: boolean;
  ariaLabel?: string;
}

export function EditorItemMenuSlot({
  onDelete,
  onDuplicate,
  deleteDisabled = false,
  duplicateDisabled = false,
  ariaLabel = "더보기",
}: EditorItemMenuSlotProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex shrink-0 items-center border-l border-zinc-200 px-2.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <IconButton
            icon={MoreVertical}
            aria-label={ariaLabel}
            onClick={event => {
              event.stopPropagation();
            }}
            iconClassName="size-5 text-zinc-500"
          />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 bg-white p-1 shadow-lg">
          <Button
            variant="ghost"
            fullWidth
            textAlign="left"
            iconGap="compact"
            leftIcon={<Copy className="size-4" />}
            disabled={duplicateDisabled}
            className="h-auto rounded-md px-3 py-2 text-sm font-normal"
            onClick={() => {
              onDuplicate();
              setOpen(false);
            }}
          >
            복제
          </Button>
          <Button
            variant="ghost"
            fullWidth
            textAlign="left"
            iconGap="compact"
            leftIcon={<Trash2 className="size-4" />}
            disabled={deleteDisabled}
            className="h-auto rounded-md px-3 py-2 text-sm font-normal text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            삭제
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
