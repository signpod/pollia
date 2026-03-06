import type { ActionDetail } from "@/types/dto";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Typo,
} from "@repo/ui/components";

interface ActionDeleteConfirmDialogProps {
  target: ActionDetail | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ActionDeleteConfirmDialog({
  target,
  isPending,
  onClose,
  onConfirm,
}: ActionDeleteConfirmDialogProps) {
  return (
    <Dialog
      open={Boolean(target)}
      onOpenChange={open => {
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        {target ? (
          <DialogContent
            onInteractOutside={event => {
              if (isPending) {
                event.preventDefault();
              }
            }}
            onEscapeKeyDown={event => {
              if (isPending) {
                event.preventDefault();
              }
            }}
          >
            <DialogTitle asChild>
              <Typo.SubTitle className="mb-2">질문 삭제</Typo.SubTitle>
            </DialogTitle>
            <DialogDescription asChild>
              <Typo.Body size="medium" className="mb-6 text-zinc-500">
                "{target.title}" 질문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </Typo.Body>
            </DialogDescription>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={onClose} disabled={isPending}>
                취소
              </Button>
              <Button
                fullWidth
                onClick={onConfirm}
                loading={isPending}
                disabled={isPending}
                className="bg-red-500 hover:bg-red-600"
              >
                삭제
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </DialogPortal>
    </Dialog>
  );
}
