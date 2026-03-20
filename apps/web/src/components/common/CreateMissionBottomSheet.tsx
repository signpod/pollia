"use client";

import { ROUTES } from "@/constants/routes";
import { ButtonV2 } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface CreateMissionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function CreateMissionBottomSheet({
  isOpen,
  onClose,
  className,
}: CreateMissionBottomSheetProps) {
  const router = useRouter();

  const handleSelect = useCallback(
    (category: "RESEARCH" | "TEST") => {
      onClose();
      router.push(`${ROUTES.CREATE_MISSION}?category=${category}`);
    },
    [router, onClose],
  );

  const handleQuizSelect = useCallback(() => {
    onClose();
    router.push(ROUTES.EDITOR_QUIZ_CREATE);
  }, [router, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[600px] rounded-t-2xl bg-white"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
          >
            <div className={cn("flex flex-col gap-1 p-4", className)}>
              <ButtonV2
                variant="tertiary"
                size="large"
                onClick={() => handleSelect("RESEARCH")}
                className="justify-start rounded-xl"
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">📋</span>
                  설문조사/리서치
                </span>
              </ButtonV2>
              <ButtonV2
                variant="tertiary"
                size="large"
                onClick={() => handleSelect("TEST")}
                className="justify-start rounded-xl"
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">🧠</span>
                  심리/유형 테스트
                </span>
              </ButtonV2>
              <ButtonV2
                variant="tertiary"
                size="large"
                onClick={handleQuizSelect}
                className="justify-start rounded-xl"
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">🎮</span>
                  퀴즈
                </span>
              </ButtonV2>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
