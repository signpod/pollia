"use client";

import { createShortTextAction } from "@/actions/action/create";
import { deleteAction } from "@/actions/action/delete";
import { reorderActions } from "@/actions/action/reorder";
import { ButtonV2, Typo } from "@repo/ui/components";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useEditor } from "../context/EditorContext";
import type { PreviewAction } from "../context/EditorContext";
import { toPreviewActionFromAction } from "../lib/toEditorPreview";
import { ActionCard } from "./ActionCard";

export function ActionsSection() {
  const {
    missionId,
    previewActions,
    setPreviewActions,
    activeActionIndex,
    setActiveActionIndex,
    setActiveSection,
    requestedActionId,
    clearRequestedIds,
  } = useEditor();

  const [openIndex, setOpenIndex] = useState<number | null>(activeActionIndex);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setActiveSection("actions");
  }, [setActiveSection]);

  useEffect(() => {
    if (!requestedActionId) return;
    const idx = previewActions.findIndex(a => a.id === requestedActionId);
    if (idx >= 0) {
      setOpenIndex(idx);
      setActiveActionIndex(idx);
      clearRequestedIds();
    }
  }, [requestedActionId, previewActions, setActiveActionIndex, clearRequestedIds]);

  useEffect(() => {
    setOpenIndex(prev => (prev !== null ? Math.min(prev, previewActions.length - 1) : null));
  }, [previewActions.length]);

  const handleAddAction = useCallback(async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const order = previewActions.length;
      const { data } = await createShortTextAction({
        missionId,
        title: "새 질문",
        description: undefined,
        imageUrl: null,
        imageFileUploadId: null,
        order,
        isRequired: true,
      });
      const newPreview = toPreviewActionFromAction({
        id: data.id,
        title: data.title,
        type: data.type,
        order: data.order ?? 0,
        isRequired: data.isRequired,
        nextActionId: data.nextActionId ?? null,
        nextCompletionId: data.nextCompletionId ?? null,
      });
      setPreviewActions(prev =>
        [...prev, newPreview].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );
      setOpenIndex(previewActions.length);
      setActiveActionIndex(previewActions.length);
    } catch (e) {
      toast.error("질문 추가에 실패했습니다.", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setIsAdding(false);
    }
  }, [missionId, isAdding, previewActions.length, setPreviewActions, setActiveActionIndex]);

  const handleMoveUp = useCallback(
    async (index: number) => {
      if (index <= 0) return;
      const reordered = [...previewActions];
      const a = reordered[index];
      const b = reordered[index - 1];
      if (!a || !b) return;
      reordered[index - 1] = a;
      reordered[index] = b;
      const actionOrders = reordered.map((act, i) => ({ id: act.id, order: i }));
      try {
        await reorderActions({ missionId, actionOrders });
        setPreviewActions(reordered.map((a, i) => ({ ...a, order: i })));
        setOpenIndex(index - 1);
        setActiveActionIndex(index - 1);
      } catch (_e) {
        toast.error("순서 변경에 실패했습니다.");
      }
    },
    [missionId, previewActions, setPreviewActions, setActiveActionIndex],
  );

  const handleMoveDown = useCallback(
    async (index: number) => {
      if (index >= previewActions.length - 1) return;
      const reordered = [...previewActions];
      const a = reordered[index];
      const b = reordered[index + 1];
      if (!a || !b) return;
      reordered[index] = b;
      reordered[index + 1] = a;
      const actionOrders = reordered.map((act, i) => ({ id: act.id, order: i }));
      try {
        await reorderActions({ missionId, actionOrders });
        setPreviewActions(reordered.map((a, i) => ({ ...a, order: i })));
        setOpenIndex(index + 1);
        setActiveActionIndex(index + 1);
      } catch (_e) {
        toast.error("순서 변경에 실패했습니다.");
      }
    },
    [missionId, previewActions, setPreviewActions, setActiveActionIndex],
  );

  const handleDelete = useCallback(
    async (actionId: string) => {
      try {
        await deleteAction(actionId);
        const next = previewActions.filter(a => a.id !== actionId);
        setPreviewActions(next);
        setOpenIndex(prev => (prev !== null ? Math.max(0, Math.min(prev, next.length - 1)) : null));
      } catch (_e) {
        toast.error("삭제에 실패했습니다.");
      }
    },
    [previewActions, setPreviewActions],
  );

  const handleUpdate = useCallback(
    (updated: PreviewAction) => {
      setPreviewActions(prev => prev.map(a => (a.id === updated.id ? updated : a)));
    },
    [setPreviewActions],
  );

  return (
    <section className="px-5">
      <Typo.SubTitle className="text-base">진행 목록</Typo.SubTitle>
      <Typo.Body size="medium" className="mt-1 text-zinc-500">
        미션에 포함할 질문을 순서대로 추가하세요.
      </Typo.Body>
      <div className="mt-4 space-y-2">
        {previewActions.map((action, index) => (
          <ActionCard
            key={action.id}
            action={action}
            index={index}
            total={previewActions.length}
            isOpen={openIndex === index}
            onToggle={() => {
              const next = openIndex === index ? null : index;
              setOpenIndex(next);
              if (next !== null) setActiveActionIndex(next);
            }}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            onDelete={() => handleDelete(action.id)}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
      <ButtonV2
        variant="secondary"
        size="medium"
        className="mt-4 w-full"
        onClick={handleAddAction}
        disabled={isAdding}
      >
        <Plus className="mr-1 h-4 w-4" />
        질문 추가
      </ButtonV2>
    </section>
  );
}
