"use client";

import { Button } from "@repo/ui/components";
import { Dialog, DialogOverlay, DialogPortal } from "@repo/ui/components";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useCallback, useRef } from "react";

export interface QuizFeedbackConfig {
  isCorrect: boolean;
  correctAnswer?: string | null;
  explanation?: string | null;
  confirmText: string;
  onConfirm: () => void;
}

interface QuizFeedbackModalProps {
  config: QuizFeedbackConfig | null;
  onClose: () => void;
}

export function QuizFeedbackModal({ config, onClose }: QuizFeedbackModalProps) {
  const openTimeRef = useRef(0);

  const handleConfirm = useCallback(() => {
    if (Date.now() - openTimeRef.current < 300) return;
    config?.onConfirm();
    onClose();
  }, [config, onClose]);

  if (config && openTimeRef.current === 0) {
    openTimeRef.current = Date.now();
  }
  if (!config) {
    openTimeRef.current = 0;
  }

  return (
    <Dialog open={!!config} onOpenChange={() => onClose()}>
      <DialogPortal>
        <DialogOverlay onClick={onClose} className="inset-0" />
        {config && (
          <div
            className={cn(
              "fixed top-1/2 left-1/2 z-50 w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-lg",
              "flex flex-col items-center gap-5 p-6",
            )}
          >
            {config.isCorrect ? (
              <CheckCircle2Icon className="size-12 text-blue-500" />
            ) : (
              <XCircleIcon className="size-12 text-rose-500" />
            )}

            <div className="flex flex-col items-center gap-1">
              <Typo.MainTitle size="small">
                {config.isCorrect ? "정답이에요!" : "오답이에요"}
              </Typo.MainTitle>
              <Typo.Body size="large" className="text-gray-500">
                {config.isCorrect ? "잘 맞혔어요 👏" : "아쉽지만 틀렸어요"}
              </Typo.Body>
            </div>

            {(!config.isCorrect && config.correctAnswer) || config.explanation ? (
              <div className="flex w-full flex-col gap-2 rounded-xl bg-zinc-50 px-4 py-3">
                {!config.isCorrect && config.correctAnswer && (
                  <div className="flex items-start gap-2">
                    <Typo.Body size="small" className="shrink-0 font-semibold text-violet-600">
                      정답
                    </Typo.Body>
                    <Typo.Body size="small" className="text-violet-600">
                      {config.correctAnswer}
                    </Typo.Body>
                  </div>
                )}
                {config.explanation && (
                  <div className="flex items-start gap-2">
                    <Typo.Body size="small" className="shrink-0 font-semibold text-emerald-600">
                      해설
                    </Typo.Body>
                    <Typo.Body size="small" className="text-emerald-600">
                      {config.explanation}
                    </Typo.Body>
                  </div>
                )}
              </div>
            ) : null}

            <Button variant="primary" fullWidth onClick={handleConfirm}>
              {config.confirmText}
            </Button>
          </div>
        )}
      </DialogPortal>
    </Dialog>
  );
}
