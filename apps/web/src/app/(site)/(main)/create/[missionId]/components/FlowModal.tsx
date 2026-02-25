"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import { ReactFlowProvider } from "@xyflow/react";
import { EditorFlowGraph } from "./EditorFlowGraph";

interface FlowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlowModal({ open, onOpenChange }: FlowModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-[90vw] h-[90vh]">
        <DialogHeader>
          <DialogTitle>플로우 보기</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-[70vh] mt-2">
          <ReactFlowProvider>
            <EditorFlowGraph />
          </ReactFlowProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
