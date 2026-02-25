"use client";

import { updateAction } from "@/actions/action/update";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import { ACTION_DESCRIPTION_MAX_LENGTH, ACTION_TITLE_MAX_LENGTH } from "@/schemas/action";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Typo,
} from "@repo/ui/components";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { PreviewAction } from "../context/EditorContext";

const DEBOUNCE_MS = 2000;

interface ActionEditorProps {
  action: PreviewAction;
  onUpdate: (action: PreviewAction) => void;
}

export function ActionEditor({ action, onUpdate }: ActionEditorProps) {
  const [title, setTitle] = useState(action.title);
  const [description, setDescription] = useState(action.description ?? "");
  const [isRequired, setIsRequired] = useState(action.isRequired);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const save = useCallback(
    async (payload: Parameters<typeof updateAction>[1]) => {
      try {
        const { data } = await updateAction(action.id, payload);
        onUpdate({
          ...action,
          title: data.title,
          description: data.description,
          isRequired: data.isRequired,
        });
      } catch (e) {
        toast.error("저장에 실패했습니다.", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    },
    [action, onUpdate],
  );

  const scheduleSave = useCallback(
    (payload: Parameters<typeof updateAction>[1]) => {
      flushDebounce();
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        save(payload);
      }, DEBOUNCE_MS);
    },
    [save, flushDebounce],
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    scheduleSave({ title: value.trim() || action.title });
  };

  const handleTitleBlur = () => {
    flushDebounce();
    if (title.trim()) save({ title: title.trim() });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    scheduleSave({ description: value || undefined });
  };

  const handleDescriptionBlur = () => {
    flushDebounce();
    save({ description: description || undefined });
  };

  const handleRequiredChange = (value: string) => {
    const next = value === "required";
    setIsRequired(next);
    save({ isRequired: next });
  };

  return (
    <div className="space-y-4">
      <Input
        label="질문 제목"
        required
        placeholder="질문을 입력하세요"
        maxLength={ACTION_TITLE_MAX_LENGTH}
        showLength
        value={title}
        onChange={e => handleTitleChange(e.target.value)}
        onBlur={handleTitleBlur}
      />
      <MarkdownEditor
        label="질문 설명 (선택)"
        labelSize="small"
        placeholder="추가 설명이 있으면 입력하세요"
        value={description}
        onChange={handleDescriptionChange}
        onBlur={handleDescriptionBlur}
        rows={3}
        maxLength={ACTION_DESCRIPTION_MAX_LENGTH}
      />
      <div className="space-y-2">
        <Typo.Body size="medium" className="font-medium text-zinc-900">
          액션 타입
        </Typo.Body>
        <Typo.Body size="small" className="text-zinc-500">
          {ACTION_TYPE_LABELS[action.type] ?? action.type}
        </Typo.Body>
      </div>
      <div className="space-y-2">
        <Typo.Body size="medium" className="font-medium text-zinc-900">
          필수 여부
        </Typo.Body>
        <Select value={isRequired ? "required" : "optional"} onValueChange={handleRequiredChange}>
          <SelectTrigger className="w-full max-w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="required">필수</SelectItem>
            <SelectItem value="optional">선택</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
