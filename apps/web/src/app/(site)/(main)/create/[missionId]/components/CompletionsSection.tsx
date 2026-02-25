"use client";

import { createMissionCompletion } from "@/actions/mission-completion/create";
import { deleteMissionCompletion } from "@/actions/mission-completion/delete";
import { ButtonV2, Typo } from "@repo/ui/components";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useEditor } from "../context/EditorContext";
import type { PreviewCompletion } from "../context/EditorContext";
import { toPreviewCompletion } from "../lib/toEditorPreview";
import { CompletionCard } from "./CompletionCard";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

export function CompletionsSection() {
  const { missionId, previewCompletions, setPreviewCompletions, setActiveSection } = useEditor();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setActiveSection("completions");
  }, [setActiveSection]);

  const handleAdd = useCallback(async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const { data } = await createMissionCompletion({
        missionId,
        title: "새 결과",
        description: "<p>설명을 입력하세요.</p>",
      });
      const preview = toPreviewCompletion(data);
      setPreviewCompletions(prev => [...prev, preview]);
    } catch (_e) {
      toast.error("결과 추가에 실패했습니다.");
    } finally {
      setIsAdding(false);
    }
  }, [missionId, isAdding, setPreviewCompletions]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMissionCompletion(id);
        setPreviewCompletions(prev => prev.filter(c => c.id !== id));
        setDeleteTargetId(null);
      } catch {
        toast.error("삭제에 실패했습니다.");
      }
    },
    [setPreviewCompletions],
  );

  const handleUpdate = useCallback(
    (updated: PreviewCompletion) => {
      setPreviewCompletions(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    },
    [setPreviewCompletions],
  );

  return (
    <section className="px-5">
      <Typo.SubTitle className="text-base">완료 화면</Typo.SubTitle>
      <Typo.Body size="medium" className="mt-1 text-zinc-500">
        미션 완료 시 보여줄 결과 화면을 추가하세요.
      </Typo.Body>
      <div className="mt-4 space-y-4">
        {previewCompletions.map(completion => (
          <div key={completion.id} className="flex gap-2">
            <div className="min-w-0 flex-1">
              <CompletionCard completion={completion} onUpdate={handleUpdate} />
            </div>
            <ButtonV2
              variant="tertiary"
              size="medium"
              className="shrink-0 self-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleteTargetId(completion.id)}
            >
              삭제
            </ButtonV2>
          </div>
        ))}
      </div>
      <ButtonV2
        variant="secondary"
        size="medium"
        className="mt-4 w-full"
        onClick={handleAdd}
        disabled={isAdding}
      >
        <Plus className="mr-1 h-4 w-4" />
        결과 추가
      </ButtonV2>
      <DeleteConfirmModal
        open={!!deleteTargetId}
        onOpenChange={open => !open && setDeleteTargetId(null)}
        title="결과 삭제"
        description="이 결과 화면을 삭제할까요? 되돌릴 수 없습니다."
        onConfirm={() => deleteTargetId && handleDelete(deleteTargetId)}
      />
    </section>
  );
}
