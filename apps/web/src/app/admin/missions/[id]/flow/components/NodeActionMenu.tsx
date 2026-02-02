"use client";

import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import { ArrowRight, Unlink } from "lucide-react";

interface NodeActionMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConnection?: {
    targetId: string;
    targetTitle: string;
    targetType: "action" | "completion";
  };
  onDisconnect: () => void;
  onReconnect: () => void;
}

export function NodeActionMenu({
  open,
  onOpenChange,
  currentConnection,
  onDisconnect,
  onReconnect,
}: NodeActionMenuProps) {
  const handleDisconnect = () => {
    onDisconnect();
    onOpenChange(false);
  };

  const handleReconnect = () => {
    onReconnect();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>연결 관리</DialogTitle>
          <DialogDescription>현재 연결된 단계를 변경하거나 해제할 수 있습니다.</DialogDescription>
        </DialogHeader>

        {currentConnection && (
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">
                    {currentConnection.targetType === "action" ? "액션" : "완료화면"}
                  </Badge>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">{currentConnection.targetTitle}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReconnect}
            className="w-full sm:w-auto"
          >
            연결 변경
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDisconnect}
            className="w-full sm:w-auto"
          >
            <Unlink className="size-4" />
            연결 해제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
