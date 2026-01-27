"use client";

import type { MyMissionResponse, MyMissionResponseAnswer } from "@/types/dto/mission-response";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Typo } from "@repo/ui/components";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon,
  CheckSquareIcon,
  FileTextIcon,
  ImageIcon,
  MessageSquareIcon,
  StarIcon,
  TagIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { useMemo } from "react";

interface AnswerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: MyMissionResponse;
}

type ActionType =
  | "MULTIPLE_CHOICE"
  | "SCALE"
  | "RATING"
  | "TAG"
  | "SUBJECTIVE"
  | "SHORT_TEXT"
  | "IMAGE"
  | "VIDEO"
  | "PDF"
  | "DATE"
  | "TIME";

const ACTION_TYPE_CONFIG: Record<ActionType, { icon: React.ReactNode; label: string }> = {
  MULTIPLE_CHOICE: { icon: <CheckSquareIcon className="h-4 w-4" />, label: "객관식" },
  TAG: { icon: <TagIcon className="h-4 w-4" />, label: "태그" },
  SCALE: { icon: <StarIcon className="h-4 w-4" />, label: "척도" },
  RATING: { icon: <StarIcon className="h-4 w-4" />, label: "평점" },
  SUBJECTIVE: { icon: <MessageSquareIcon className="h-4 w-4" />, label: "서술형" },
  SHORT_TEXT: { icon: <MessageSquareIcon className="h-4 w-4" />, label: "단답형" },
  IMAGE: { icon: <ImageIcon className="h-4 w-4" />, label: "이미지" },
  VIDEO: { icon: <VideoIcon className="h-4 w-4" />, label: "동영상" },
  PDF: { icon: <FileTextIcon className="h-4 w-4" />, label: "PDF" },
  DATE: { icon: <CalendarIcon className="h-4 w-4" />, label: "날짜" },
  TIME: { icon: <CalendarIcon className="h-4 w-4" />, label: "시간" },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AnswerContent({ answer }: { answer: MyMissionResponseAnswer }) {
  const actionType = answer.action.type as ActionType;

  switch (actionType) {
    case "MULTIPLE_CHOICE":
    case "TAG":
      if (answer.options.length === 0 && !answer.textAnswer) {
        return <span className="text-zinc-400">선택 없음</span>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {answer.options.map(option => (
            <span
              key={option.id}
              className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700"
            >
              {option.title}
            </span>
          ))}
          {answer.textAnswer && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
              기타: {answer.textAnswer}
            </span>
          )}
        </div>
      );

    case "SCALE":
    case "RATING":
      if (answer.scaleAnswer === null) {
        return <span className="text-zinc-400">응답 없음</span>;
      }
      return (
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-violet-600">{answer.scaleAnswer}</span>
          <span className="text-zinc-500">점</span>
        </div>
      );

    case "SUBJECTIVE":
    case "SHORT_TEXT":
      if (!answer.textAnswer) {
        return <span className="text-zinc-400">응답 없음</span>;
      }
      return <p className="whitespace-pre-wrap text-zinc-800">{answer.textAnswer}</p>;

    case "IMAGE":
    case "VIDEO":
    case "PDF":
      if (answer.fileUploads.length === 0) {
        return <span className="text-zinc-400">파일 없음</span>;
      }
      return (
        <div className="space-y-2">
          {answer.fileUploads.map(file => (
            <div key={file.id} className="flex items-center gap-2">
              {actionType === "IMAGE" && file.publicUrl ? (
                <img
                  src={file.publicUrl}
                  alt={file.originalFileName}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              ) : (
                <a
                  href={file.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-violet-600 hover:underline"
                >
                  {actionType === "VIDEO" ? (
                    <VideoIcon className="h-4 w-4" />
                  ) : (
                    <FileTextIcon className="h-4 w-4" />
                  )}
                  <span>{file.originalFileName}</span>
                </a>
              )}
            </div>
          ))}
        </div>
      );

    case "DATE":
      if (answer.dateAnswers.length === 0) {
        return <span className="text-zinc-400">응답 없음</span>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {answer.dateAnswers.map((date, idx) => (
            <span
              key={idx}
              className="rounded-lg bg-zinc-50 px-3 py-1 text-sm font-medium text-zinc-700"
            >
              {formatDate(date)}
            </span>
          ))}
        </div>
      );

    case "TIME":
      if (answer.dateAnswers.length === 0) {
        return <span className="text-zinc-400">응답 없음</span>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {answer.dateAnswers.map((date, idx) => (
            <span
              key={idx}
              className="rounded-lg bg-zinc-50 px-3 py-1 text-sm font-medium text-zinc-700"
            >
              {formatTime(date)}
            </span>
          ))}
        </div>
      );

    default:
      return <span className="text-zinc-400">-</span>;
  }
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
