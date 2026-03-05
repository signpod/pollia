"use client";

import type { MyMissionResponse } from "@/types/dto/mission-response";
import { ActionType } from "@prisma/client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Typo } from "@repo/ui/components";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useMemo } from "react";
import { ACTION_TYPE_CONFIG, AnswerContent } from "./AnswerContent";

interface AnswerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: MyMissionResponse;
}

export function AnswerDetailModal({ isOpen, onClose, response }: AnswerDetailModalProps) {
  const { mission, answers } = response;

  const sortedAnswers = useMemo(
    () => [...answers].sort((a, b) => (a.action.order ?? 0) - (b.action.order ?? 0)),
    [answers],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPrimitive.Root open={isOpen} onOpenChange={open => !open && onClose()}>
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg outline-none"
              onOpenAutoFocus={e => e.preventDefault()}
              asChild
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              >
                <div className="rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)]">
                  <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                    <DialogPrimitive.Title asChild>
                      <Typo.SubTitle className="truncate pr-8">{mission.title}</Typo.SubTitle>
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Close asChild>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100"
                      >
                        <XIcon className="h-5 w-5 text-zinc-500" />
                      </button>
                    </DialogPrimitive.Close>
                  </div>

                  <div data-drawer-scrollable className="max-h-[60vh] overflow-y-auto px-5 py-4">
                    {sortedAnswers.length > 0 ? (
                      <div className="space-y-4">
                        {sortedAnswers.map((answer, index) => {
                          const actionType = answer.action.type as ActionType;
                          const config = ACTION_TYPE_CONFIG[actionType] ?? {
                            icon: null,
                            label: actionType,
                          };

                          return (
                            <motion.div
                              key={answer.id}
                              className="border-b border-zinc-100 p-4"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <div className="mb-3 flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2">
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                                    {index + 1}
                                  </span>
                                  <Typo.Body size="medium" className="font-semibold text-zinc-700">
                                    {answer.action.title}
                                  </Typo.Body>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                      answer.action.isRequired
                                        ? "bg-rose-50 text-rose-600"
                                        : "bg-zinc-100 text-zinc-500"
                                    }`}
                                  >
                                    {answer.action.isRequired ? "필수" : "선택"}
                                  </span>
                                  <div className="flex items-center gap-1 text-zinc-400">
                                    {config.icon}
                                    <span className="text-xs">{config.label}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="pl-7">
                                <AnswerContent answer={answer} />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <Typo.Body size="large" className="text-zinc-400">
                          응답 내용이 없어요
                        </Typo.Body>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </AnimatePresence>
  );
}
