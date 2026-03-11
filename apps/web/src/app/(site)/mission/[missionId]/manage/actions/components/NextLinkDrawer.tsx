"use client";

import { Typo } from "@repo/ui/components";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface NextLinkTarget {
  id: string;
  title: string;
  order: number | null;
}

interface CompletionOption {
  id: string;
  title: string;
}

type TabType = "action" | "completion";

interface NextLinkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemLabel: string;
  allowCompletionLink: boolean;
  actionValue: string | null;
  completionValue: string | null;
  selectableActions: NextLinkTarget[];
  completionOptions: CompletionOption[];
  onActionSelect: (id: string) => void;
  onCompletionSelect: (id: string) => void;
  onCreateAction?: () => void;
  onCreateCompletion?: () => void;
}

export function NextLinkDrawer({
  isOpen,
  onClose,
  itemLabel,
  allowCompletionLink,
  actionValue,
  completionValue,
  selectableActions,
  completionOptions,
  onActionSelect,
  onCompletionSelect,
  onCreateAction,
  onCreateCompletion,
}: NextLinkDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("action");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setActiveTab(allowCompletionLink && completionValue ? "completion" : "action");
    }
  }, [isOpen, allowCompletionLink, completionValue]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return selectableActions;
    const q = searchQuery.trim().toLowerCase();
    return selectableActions.filter(a => {
      const orderStr = String((a.order ?? 0) + 1);
      return a.title.toLowerCase().includes(q) || orderStr === q;
    });
  }, [selectableActions, searchQuery]);

  const filteredCompletions = useMemo(() => {
    if (!searchQuery.trim()) return completionOptions;
    const q = searchQuery.trim().toLowerCase();
    return completionOptions.filter(c => c.title.toLowerCase().includes(q));
  }, [completionOptions, searchQuery]);

  const handleActionClick = (id: string) => {
    onActionSelect(id);
    onClose();
  };

  const handleCompletionClick = (id: string) => {
    onCompletionSelect(id);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 mx-auto flex max-h-[85vh] w-full max-w-[600px] flex-col overflow-hidden rounded-t-lg bg-white shadow-lg pb-[env(safe-area-inset-bottom)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <Typo.SubTitle>다음 이동 설정</Typo.SubTitle>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100"
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex gap-2 px-5 pt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("action");
                  setSearchQuery("");
                }}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  activeTab === "action"
                    ? "border-violet-400 bg-violet-500 text-white"
                    : "border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                {`다음 ${itemLabel}`}
              </button>
              {allowCompletionLink && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("completion");
                    setSearchQuery("");
                  }}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    activeTab === "completion"
                      ? "border-violet-400 bg-violet-500 text-white"
                      : "border-zinc-200 bg-white text-zinc-600"
                  }`}
                >
                  결과 화면
                </button>
              )}
            </div>

            <div className="px-5 pt-3">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                <Search className="size-4 shrink-0 text-zinc-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "action"
                      ? `${itemLabel} 제목 또는 번호로 검색`
                      : "결과 화면 제목으로 검색"
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {activeTab === "action" ? (
                <ActionList
                  actions={filteredActions}
                  selectedId={actionValue}
                  itemLabel={itemLabel}
                  searchQuery={searchQuery}
                  onSelect={handleActionClick}
                  onCreateAction={onCreateAction}
                  onClose={onClose}
                />
              ) : (
                <CompletionList
                  completions={filteredCompletions}
                  selectedId={completionValue}
                  searchQuery={searchQuery}
                  onSelect={handleCompletionClick}
                  onCreateCompletion={onCreateCompletion}
                  onClose={onClose}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ActionList({
  actions,
  selectedId,
  itemLabel,
  searchQuery,
  onSelect,
  onCreateAction,
  onClose,
}: {
  actions: NextLinkTarget[];
  selectedId: string | null;
  itemLabel: string;
  searchQuery: string;
  onSelect: (id: string) => void;
  onCreateAction?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {actions.length === 0 ? (
        <div className="py-8 text-center">
          <Typo.Body size="medium" className="text-zinc-400">
            {searchQuery ? "검색 결과가 없습니다" : `선택 가능한 ${itemLabel}이 없습니다`}
          </Typo.Body>
        </div>
      ) : (
        actions.map(action => (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelect(action.id)}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
              selectedId === action.id
                ? "border-violet-300 bg-violet-50"
                : "border-zinc-100 bg-white hover:border-violet-200 hover:bg-violet-50/30"
            }`}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
              {(action.order ?? 0) + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800">
              {action.title}
            </span>
            {selectedId === action.id && <Check className="size-4 shrink-0 text-violet-500" />}
          </button>
        ))
      )}
      {onCreateAction && (
        <button
          type="button"
          onClick={() => {
            onCreateAction();
            onClose();
          }}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-2.5 text-sm text-zinc-500 transition-colors hover:border-violet-400 hover:text-violet-500"
        >
          <Plus className="size-4" />
          {`다음 ${itemLabel} 만들기`}
        </button>
      )}
    </div>
  );
}

function CompletionList({
  completions,
  selectedId,
  searchQuery,
  onSelect,
  onCreateCompletion,
  onClose,
}: {
  completions: CompletionOption[];
  selectedId: string | null;
  searchQuery: string;
  onSelect: (id: string) => void;
  onCreateCompletion?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {completions.length === 0 ? (
        <div className="py-8 text-center">
          <Typo.Body size="medium" className="text-zinc-400">
            {searchQuery ? "검색 결과가 없습니다" : "선택 가능한 결과 화면이 없습니다"}
          </Typo.Body>
        </div>
      ) : (
        completions.map(completion => (
          <button
            key={completion.id}
            type="button"
            onClick={() => onSelect(completion.id)}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
              selectedId === completion.id
                ? "border-violet-300 bg-violet-50"
                : "border-zinc-100 bg-white hover:border-violet-200 hover:bg-violet-50/30"
            }`}
          >
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800">
              {completion.title}
            </span>
            {selectedId === completion.id && <Check className="size-4 shrink-0 text-violet-500" />}
          </button>
        ))
      )}
      {onCreateCompletion && (
        <button
          type="button"
          onClick={() => {
            onCreateCompletion();
            onClose();
          }}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-2.5 text-sm text-zinc-500 transition-colors hover:border-violet-400 hover:text-violet-500"
        >
          <Plus className="size-4" />
          결과 화면 만들기
        </button>
      )}
    </div>
  );
}
