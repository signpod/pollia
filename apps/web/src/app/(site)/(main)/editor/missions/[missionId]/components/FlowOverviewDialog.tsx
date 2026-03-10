"use client";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Typo,
} from "@repo/ui/components";
import { useSetAtom } from "jotai";
import { X } from "lucide-react";
import { useCallback, useMemo } from "react";
import { actionScrollTargetItemKeyAtom } from "../atoms/editorActionAtoms";
import { FlowOverviewCanvas } from "./FlowOverviewCanvas";
import type { FlowOverviewNodeData } from "./editor-flow-overview.utils";
import { buildFlowOverviewSummary } from "./editor-flow-overview.utils";
import type { EditorFlowAnalysisResult } from "./editor-publish-flow-validation";
import { mapFlowNodeIdToItemKey } from "./flowNodeItemKeyMap";

interface FlowOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: EditorFlowAnalysisResult | null;
  isLoading: boolean;
  errorMessage?: string | null;
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
      <Typo.Body size="small" className="text-zinc-500">
        {label}
      </Typo.Body>
      <Typo.Body size="medium" className="text-zinc-900">
        {value}
      </Typo.Body>
    </div>
  );
}

function IssueBadge({
  label,
  value,
  className,
}: { label: string; value: number; className: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label} {value}
    </span>
  );
}

export function FlowOverviewDialog({
  open,
  onOpenChange,
  analysis,
  isLoading,
  errorMessage,
}: FlowOverviewDialogProps) {
  const summary = useMemo(() => (analysis ? buildFlowOverviewSummary(analysis) : null), [analysis]);
  const setScrollTarget = useSetAtom(actionScrollTargetItemKeyAtom);

  const handleNodeClick = useCallback(
    (nodeId: string, kind: FlowOverviewNodeData["kind"]) => {
      const itemKey = mapFlowNodeIdToItemKey(nodeId, kind);
      if (itemKey) {
        setScrollTarget(itemKey);
        onOpenChange(false);
      }
    },
    [setScrollTarget, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="h-[90vh] w-[96vw] max-w-[1400px] p-0 sm:h-[85vh] sm:w-[90vw]">
          <div className="flex h-full flex-col">
            <header className="border-b border-zinc-200 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle asChild>
                    <Typo.SubTitle>플로우</Typo.SubTitle>
                  </DialogTitle>
                  <DialogDescription asChild>
                    <Typo.Body size="small" className="mt-1 text-zinc-500">
                      저장본 + 임시 변경이 반영된 전체 진행 구조를 확인합니다.
                    </Typo.Body>
                  </DialogDescription>
                </div>
                <DialogClose asChild>
                  <button
                    type="button"
                    aria-label="플로우 닫기"
                    className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    <X className="size-4" />
                  </button>
                </DialogClose>
              </div>

              {summary && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <SummaryItem label="액션" value={summary.actionCount} />
                  <SummaryItem label="완료 화면" value={summary.completionCount} />
                  <SummaryItem label="연결" value={summary.connectionCount} />
                  <IssueBadge
                    label="시작 미설정"
                    value={summary.missingEntryCount}
                    className="bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                  />
                  <IssueBadge
                    label="완료화면 미설정"
                    value={summary.missingCompletionCount}
                    className="bg-orange-100 text-orange-700 ring-1 ring-orange-200"
                  />
                  <IssueBadge
                    label="도달 불가"
                    value={summary.unreachableCount}
                    className="bg-zinc-200 text-zinc-700 ring-1 ring-zinc-300"
                  />
                  <IssueBadge
                    label="Dead-end"
                    value={summary.deadEndCount}
                    className="bg-red-100 text-red-700 ring-1 ring-red-200"
                  />
                </div>
              )}
            </header>

            <div className="min-h-0 flex-1 p-5">
              {isLoading ? (
                <div className="flex h-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
                  <Typo.Body size="medium" className="text-zinc-500">
                    플로우를 불러오는 중...
                  </Typo.Body>
                </div>
              ) : errorMessage ? (
                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 text-center">
                  <Typo.SubTitle className="text-red-600">
                    플로우를 불러오지 못했습니다
                  </Typo.SubTitle>
                  <Typo.Body size="medium" className="mt-2 text-red-500">
                    {errorMessage}
                  </Typo.Body>
                </div>
              ) : analysis ? (
                <FlowOverviewCanvas analysis={analysis} onNodeClick={handleNodeClick} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-center">
                  <Typo.SubTitle>표시할 플로우가 없습니다</Typo.SubTitle>
                  <Typo.Body size="medium" className="mt-2 text-zinc-500">
                    액션과 완료 화면을 연결하면 플로우를 확인할 수 있습니다.
                  </Typo.Body>
                </div>
              )}
            </div>

            <footer className="border-t border-zinc-200 px-5 py-3">
              <DialogClose asChild>
                <Button variant="secondary" className="h-10 px-4">
                  닫기
                </Button>
              </DialogClose>
            </footer>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
