"use client";

import { updateMission } from "@/actions/mission/update";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { MISSION_DESCRIPTION_MAX_LENGTH, MISSION_TITLE_MAX_LENGTH } from "@/schemas/mission";
import { MissionCategory } from "@prisma/client";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Toggle,
  Typo,
} from "@repo/ui/components";
import { ImageSelector } from "@repo/ui/components";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditor } from "../context/EditorContext";

const DEBOUNCE_MS = 2000;

export function MissionInfoSection() {
  const {
    missionId,
    previewMission,
    setPreviewMission,
    setHasUnsavedChanges,
    pendingIsActive,
    setPendingIsActive,
    setActiveSection,
  } = useEditor();

  const [title, setTitle] = useState(previewMission?.title ?? "");
  const [description, setDescription] = useState(previewMission?.description ?? "");
  const [category, setCategory] = useState<MissionCategory>(
    previewMission?.category ?? MissionCategory.EVENT,
  );
  const [imageUrl, setImageUrl] = useState<string | null>(previewMission?.imageUrl ?? null);
  const [, setImageFileUploadId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setActiveSection("info");
  }, [setActiveSection]);

  useEffect(() => {
    if (!previewMission) return;
    setTitle(previewMission.title);
    setDescription(previewMission.description ?? "");
    setCategory(previewMission.category);
    setImageUrl(previewMission.imageUrl);
  }, [previewMission]);

  const saveMission = useCallback(
    async (payload: Parameters<typeof updateMission>[1]) => {
      try {
        const { data } = await updateMission(missionId, payload);
        if (!isMountedRef.current) return;
        setPreviewMission({
          id: data.id,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          category: data.category,
          isActive: data.isActive,
          entryActionId: previewMission?.entryActionId ?? null,
        });
        setHasUnsavedChanges(false);
      } catch (e) {
        toast.error("저장에 실패했습니다.", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    },
    [missionId, previewMission, setPreviewMission, setHasUnsavedChanges],
  );

  const flushDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const scheduleSave = useCallback(
    (payload: Parameters<typeof updateMission>[1]) => {
      flushDebounce();
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        saveMission(payload);
      }, DEBOUNCE_MS);
    },
    [saveMission, flushDebounce],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      flushDebounce();
    };
  }, [flushDebounce]);

  const missionImageUpload = useImageUpload({
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onSuccess: async data => {
      setImageUrl(data.publicUrl);
      setImageFileUploadId(data.fileUploadId);
      setHasUnsavedChanges(true);
      await saveMission({
        imageUrl: data.publicUrl,
        imageFileUploadId: data.fileUploadId,
      });
    },
    onError: error => {
      toast.error("이미지 업로드 실패", { description: error.message });
    },
  });

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasUnsavedChanges(true);
    scheduleSave({ title: value.trim() });
  };

  const handleTitleBlur = () => {
    flushDebounce();
    if (title.trim()) saveMission({ title: title.trim() });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setHasUnsavedChanges(true);
    scheduleSave({ description: value || undefined });
  };

  const handleDescriptionBlur = () => {
    flushDebounce();
    saveMission({ description: description || undefined });
  };

  const handleCategoryChange = (value: MissionCategory) => {
    setCategory(value);
    setHasUnsavedChanges(true);
    scheduleSave({ category: value });
  };

  const handleCategoryBlur = () => {
    flushDebounce();
    saveMission({ category });
  };

  const handleVisibilityChange = async (checked: boolean) => {
    setPendingIsActive(checked);
    await saveMission({ isActive: checked });
  };

  const handleMissionImageDelete = () => {
    setImageUrl(null);
    setImageFileUploadId(null);
    setHasUnsavedChanges(true);
    saveMission({ imageUrl: null, imageFileUploadId: null });
  };

  return (
    <section className="px-5">
      <Typo.SubTitle className="text-base">기본 정보</Typo.SubTitle>
      <Typo.Body size="medium" className="mt-1 text-zinc-500">
        미션의 제목, 설명, 카테고리 등을 입력하세요.
      </Typo.Body>

      <div className="mt-6 space-y-2">
        <Typo.Body size="medium" className="font-medium text-zinc-900">
          썸네일 (선택)
        </Typo.Body>
        <ImageSelector
          imageUrl={imageUrl ?? undefined}
          onImageSelect={file => missionImageUpload.upload(file)}
          onImageDelete={handleMissionImageDelete}
          disabled={missionImageUpload.isUploading}
        />
        {missionImageUpload.isUploading && (
          <Typo.Body size="small" className="text-zinc-500">
            업로드 중...
          </Typo.Body>
        )}
      </div>

      <div className="mt-6">
        <Input
          label="제목"
          required
          placeholder="미션 제목을 입력하세요"
          maxLength={MISSION_TITLE_MAX_LENGTH}
          showLength
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          onBlur={handleTitleBlur}
          helperText="미션의 제목을 입력하세요."
        />
      </div>

      <div className="mt-4 space-y-2">
        <Typo.Body size="medium" className="font-medium text-zinc-900">
          카테고리
        </Typo.Body>
        <Select value={category} onValueChange={v => handleCategoryChange(v as MissionCategory)}>
          <SelectTrigger className="w-full" onBlur={handleCategoryBlur}>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(MISSION_CATEGORY_LABELS) as MissionCategory[]).map(cat => (
              <SelectItem key={cat} value={cat}>
                {MISSION_CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-visible">
        <MarkdownEditor
          label="설명 (선택)"
          labelSize="small"
          placeholder="미션에 대한 설명을 입력하세요"
          value={description}
          onChange={handleDescriptionChange}
          onBlur={handleDescriptionBlur}
          rows={6}
          maxLength={MISSION_DESCRIPTION_MAX_LENGTH}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <Typo.Body size="medium" className="font-medium text-zinc-900">
            공개 여부
          </Typo.Body>
          <Typo.Body size="small" className="text-zinc-500">
            공개 시 미션 목록에 표시됩니다
          </Typo.Body>
        </div>
        <Toggle checked={pendingIsActive} onCheckedChange={handleVisibilityChange} />
      </div>
    </section>
  );
}
