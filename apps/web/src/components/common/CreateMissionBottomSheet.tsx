"use client";

import { ROUTES } from "@/constants/routes";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface CreateMissionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMissionBottomSheet({ isOpen, onClose }: CreateMissionBottomSheetProps) {
  const router = useRouter();

  const handleSelect = useCallback(
    (category: "RESEARCH" | "TEST") => {
      onClose();
      router.push(`${ROUTES.CREATE_MISSION}?category=${category}`);
    },
    [router, onClose],
  );

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
            <div className="flex flex-col gap-1 p-4">
              <button
                type="button"
                onClick={() => handleSelect("RESEARCH")}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
              >
                <span className="text-lg">📋</span>
                <span>설문조사/리서치</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect("TEST")}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
              >
                <span className="text-lg">🧠</span>
                <span>심리/유형 테스트</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
