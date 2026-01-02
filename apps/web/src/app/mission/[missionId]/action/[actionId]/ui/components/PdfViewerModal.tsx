"use client";

import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { Dialog, DialogOverlay, DialogPortal } from "@repo/ui/components";
import { XIcon } from "lucide-react";

interface PdfViewerModalProps {
  isOpen: boolean;
  pdfUrl: string;
  fileName: string;
  onClose: () => void;
}

export function PdfViewerModal({ isOpen, pdfUrl, fileName, onClose }: PdfViewerModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogPortal>
        <DialogOverlay onClick={onClose} />
        <div
          className={cn(
            "fixed top-[50%] left-[50%] z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg",
            "flex flex-col max-h-[90vh]",
          )}
        >
          <div className="flex items-center justify-between border-b border-divider-default p-4 flex-shrink-0">
            <Typo.MainTitle size="small" className="truncate flex-1 mr-4">
              {fileName}
            </Typo.MainTitle>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center size-8 rounded-sm hover:bg-zinc-100 transition-colors flex-shrink-0"
            >
              <XIcon className="size-5 text-zinc-500" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <iframe src={pdfUrl} className="w-full h-full border-0" title={fileName} />
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
