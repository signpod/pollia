"use client";

import { updateMissionCompletion } from "@/actions/mission-completion/update";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH } from "@/schemas/mission-completion";
import { Input, Typo } from "@repo/ui/components";
import { ImageSelector } from "@repo/ui/components";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { PreviewCompletion } from "../context/EditorContext";

const DEBOUNCE_MS = 2000;

interface CompletionCardProps {
  completion: PreviewCompletion;
  onUpdate: (completion: PreviewCompletion) => void;
}

export function CompletionCard({ completion, onUpdate }: CompletionCardProps) {
  const [title, setTitle] = useState(completion.title);
  const [description, setDescription] = useState(completion.description);
  const [imageUrl, setImageUrl] = useState<string | null>(completion.imageUrl);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const save = useCallback(
    async (payload: Parameters<typeof updateMissionCompletion>[1]) => {
      try {
        const { data } = await updateMissionCompletion(completion.id, payload);
        onUpdate({
          ...completion,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          links: completion.links,
        });
      } catch (_e) {
        toast.error("저장에 실패했습니다.");
      }
    },
    [completion, onUpdate],
  );

  const scheduleSave = useCallback(
    (payload: Parameters<typeof updateMissionCompletion>[1]) => {
      flushDebounce();
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        save(payload);
      }, DEBOUNCE_MS);
    },
    [save, flushDebounce],
  );

  const imageUpload = useImageUpload({
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onSuccess: async data => {
      setImageUrl(data.publicUrl);
      await save({ imageUrl: data.publicUrl, imageFileUploadId: data.fileUploadId });
    },
    onError: error => toast.error("이미지 업로드 실패", { description: error.message }),
  });

  const handleTitleChange = (value: string) => {
    setTitle(value);
    scheduleSave({ title: value.trim() || completion.title });
  };

  const handleTitleBlur = () => {
    flushDebounce();
    if (title.trim()) save({ title: title.trim() });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    scheduleSave({ description: value });
  };

  const handleDescriptionBlur = () => {
    flushDebounce();
    save({ description });
  };

  const handleImageDelete = () => {
    setImageUrl(null);
    save({ imageUrl: null, imageFileUploadId: null });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <Input
        label="제목"
        required
        placeholder="결과 제목"
        maxLength={100}
        showLength
        value={title}
        onChange={e => handleTitleChange(e.target.value)}
        onBlur={handleTitleBlur}
      />
      <div className="mt-4">
        <MarkdownEditor
          label="설명"
          labelSize="small"
          placeholder="결과 설명을 입력하세요"
          value={description}
          onChange={handleDescriptionChange}
          onBlur={handleDescriptionBlur}
          rows={3}
          maxLength={MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH}
        />
      </div>
      <div className="mt-4 space-y-2">
        <Typo.Body size="medium" className="font-medium text-zinc-900">
          이미지 (선택)
        </Typo.Body>
        <ImageSelector
          imageUrl={imageUrl ?? undefined}
          onImageSelect={file => imageUpload.upload(file)}
          onImageDelete={handleImageDelete}
          disabled={imageUpload.isUploading}
        />
      </div>
    </div>
  );
}
