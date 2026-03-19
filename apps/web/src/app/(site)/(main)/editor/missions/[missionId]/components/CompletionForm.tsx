"use client";

import { ImageCropModal } from "@/components/common/templates/action/image/ImageCropModal";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { useCropperModal, useSingleImage } from "@/hooks/image";
import {
  MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH,
  MISSION_COMPLETION_LINKS_MAX_COUNT,
  MISSION_COMPLETION_LINK_NAME_MAX_LENGTH,
  MISSION_COMPLETION_TITLE_MAX_LENGTH,
} from "@/schemas/mission-completion";
import type { CompletionLinkInput } from "@/types/dto";
import {
  Button,
  ImageSelector,
  Input,
  LabelText,
  TiptapEditor,
  Typo,
  toast,
} from "@repo/ui/components";
import { AlertCircle, Plus } from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { CompletionLinkEditor } from "./CompletionLinkEditor";

function decodeHtmlEntities(text: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };

  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isNaN(code) ? `&${entity};` : String.fromCodePoint(code);
    }

    if (entity.startsWith("#")) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? `&${entity};` : String.fromCodePoint(code);
    }

    return namedEntities[entity] ?? `&${entity};`;
  });
}

function getTextLengthFromHtml(html: string): number {
  if (!html) {
    return 0;
  }

  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent?.replace(/\u00a0/g, " ").trim().length || 0;
  }

  const textWithoutTags = html.replace(/<[^>]*>/g, "");
  const decodedText = decodeHtmlEntities(textWithoutTags);
  return decodedText.trim().length;
}

export interface CompletionFormValues {
  title: string;
  description: string;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  links?: CompletionLinkInput[];
  minScoreRatio?: number | null;
  maxScoreRatio?: number | null;
}

export interface CompletionFormRawSnapshot {
  title: string;
  description: string;
  imageUrl: string | null;
  imageFileUploadId: string | null;
  links: CompletionLinkInput[];
  minScoreRatio: number | null;
  maxScoreRatio: number | null;
}

export interface CompletionFormHandle {
  validateAndGetValues: (options?: { showErrors?: boolean }) => CompletionFormValues | null;
  isUploading: () => boolean;
  deleteMarkedInitial: () => void;
  isDirty: () => boolean;
  getRawSnapshot: () => CompletionFormRawSnapshot;
  applyRawSnapshot: (snapshot: CompletionFormRawSnapshot) => void;
}

interface CompletionFormProps {
  missionId: string;
  itemKey: string;
  initialValues?: CompletionFormValues;
  dirtyBaselineValues?: CompletionFormValues;
  isLoading: boolean;
  onSubmit: (values: CompletionFormValues) => void;
  onCancel: () => void;
  hideTitle?: boolean;
  hideFooter?: boolean;
  onTitleChange?: (title: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onValidationStateChange?: (issueCount: number) => void;
  onRawSnapshotChange?: (snapshot: CompletionFormRawSnapshot) => void;
}

function areErrorMapsEqual(left: Record<string, string>, right: Record<string, string>): boolean {
  const leftEntries = Object.entries(left);
  const rightEntries = Object.entries(right);

  if (leftEntries.length !== rightEntries.length) {
    return false;
  }

  return leftEntries.every(([key, value]) => right[key] === value);
}

function buildCompletionDirtyComparable(values: CompletionFormValues) {
  return {
    title: values.title.trim(),
    description: values.description,
    imageUrl: values.imageUrl ?? null,
    imageFileUploadId: values.imageFileUploadId ?? null,
    links: values.links ?? [],
    minScoreRatio: values.minScoreRatio ?? null,
    maxScoreRatio: values.maxScoreRatio ?? null,
  };
}

function CompletionFormComponent(
  {
    initialValues,
    dirtyBaselineValues,
    isLoading,
    onSubmit,
    onCancel,
    hideTitle = false,
    hideFooter = false,
    onTitleChange,
    onDirtyChange,
    onValidationStateChange,
    onRawSnapshotChange,
  }: CompletionFormProps,
  ref: ForwardedRef<CompletionFormHandle>,
) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initialValues?.imageUrl ?? null);
  const [imageFileUploadId, setImageFileUploadId] = useState<string | null>(
    initialValues?.imageFileUploadId ?? null,
  );
  const [links, setLinks] = useState<CompletionLinkInput[]>(initialValues?.links ?? []);
  const [minScoreRatio, setMinScoreRatio] = useState<number | null>(
    initialValues?.minScoreRatio ?? null,
  );
  const [maxScoreRatio, setMaxScoreRatio] = useState<number | null>(
    initialValues?.maxScoreRatio ?? null,
  );
  const [linkKeys, setLinkKeys] = useState<string[]>(() =>
    (initialValues?.links ?? []).map((_, i) => `lk-${Date.now()}-${i}`),
  );
  const linkKeyCounterRef = useRef(initialValues?.links?.length ?? 0);
  const [openLinkIndex, setOpenLinkIndex] = useState<number | null>(null);
  const linkUploadingRef = useRef<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasValidationStarted, setHasValidationStarted] = useState(false);
  const [validationIssueCount, setValidationIssueCount] = useState(0);

  const { openCropper, cropModalProps } = useCropperModal();

  const imageUpload = useSingleImage({
    initialUrl: initialValues?.imageUrl ?? null,
    initialFileUploadId: initialValues?.imageFileUploadId ?? null,
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onUploadSuccess: data => {
      setImageUrl(data.publicUrl);
      setImageFileUploadId(data.fileUploadId);
    },
    onUploadError: error => {
      toast({
        message: error.message || "결과 화면 이미지 업로드에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const isImageBusy = isLoading || imageUpload.isUploading;
  const descriptionLength = useMemo(() => getTextLengthFromHtml(description), [description]);
  const dirtyComparableString = useMemo(
    () =>
      JSON.stringify(
        buildCompletionDirtyComparable({
          title,
          description,
          imageUrl: imageUrl ?? null,
          imageFileUploadId: imageFileUploadId ?? null,
          links,
          minScoreRatio,
          maxScoreRatio,
        }),
      ),
    [title, description, imageUrl, imageFileUploadId, links, minScoreRatio, maxScoreRatio],
  );
  const initialDirtyComparableStringRef = useRef(dirtyComparableString);
  const dirtyBaselineComparableString = useMemo(() => {
    if (!dirtyBaselineValues) {
      return initialDirtyComparableStringRef.current;
    }

    return JSON.stringify(buildCompletionDirtyComparable(dirtyBaselineValues));
  }, [dirtyBaselineValues]);
  const isDirty = dirtyComparableString !== dirtyBaselineComparableString;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [onDirtyChange, isDirty]);

  useEffect(() => {
    onValidationStateChange?.(validationIssueCount);
  }, [onValidationStateChange, validationIssueCount]);

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);
    onTitleChange?.(nextTitle);
  };

  const buildValidationErrors = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      nextErrors.title = "제목을 입력해주세요.";
    } else if (normalizedTitle.length > MISSION_COMPLETION_TITLE_MAX_LENGTH) {
      nextErrors.title = `제목은 ${MISSION_COMPLETION_TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`;
    }

    const nextDescriptionLength = getTextLengthFromHtml(description);
    if (nextDescriptionLength <= 0) {
      nextErrors.description = "설명을 입력해주세요.";
    } else if (nextDescriptionLength > MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH) {
      nextErrors.description = `설명은 ${MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH}자를 초과할 수 없습니다.`;
    }

    for (const [i, link] of links.entries()) {
      if (!link.name.trim()) {
        nextErrors[`link_${i}_name`] = "링크 이름을 입력해주세요.";
      } else if (link.name.trim().length > MISSION_COMPLETION_LINK_NAME_MAX_LENGTH) {
        nextErrors[`link_${i}_name`] =
          `링크 이름은 ${MISSION_COMPLETION_LINK_NAME_MAX_LENGTH}자를 초과할 수 없습니다.`;
      }

      if (!link.url.trim()) {
        nextErrors[`link_${i}_url`] = "URL을 입력해주세요.";
      } else {
        try {
          new URL(link.url);
        } catch {
          nextErrors[`link_${i}_url`] = "올바른 URL 형식이 아닙니다.";
        }
      }
    }

    return nextErrors;
  }, [title, description, links]);

  const runValidation = useCallback(
    ({ showErrors = true }: { showErrors?: boolean } = {}) => {
      const nextErrors = buildValidationErrors();
      const issueCount = Object.keys(nextErrors).length;

      setValidationIssueCount(prev => (prev === issueCount ? prev : issueCount));

      if (showErrors) {
        setErrors(prev => (areErrorMapsEqual(prev, nextErrors) ? prev : nextErrors));
      }

      return {
        isValid: issueCount === 0,
        issueCount,
      };
    },
    [buildValidationErrors],
  );

  useEffect(() => {
    runValidation({ showErrors: hasValidationStarted });
  }, [hasValidationStarted, runValidation]);

  const buildValidatedValues = useCallback(
    ({ showErrors = true }: { showErrors?: boolean } = {}): CompletionFormValues | null => {
      const validationResult = runValidation({ showErrors });
      if (!validationResult.isValid) {
        return null;
      }

      return {
        title: title.trim(),
        description,
        imageUrl,
        imageFileUploadId,
        links: links.length > 0 ? links.map((link, i) => ({ ...link, order: i })) : undefined,
        minScoreRatio,
        maxScoreRatio,
      };
    },
    [
      runValidation,
      title,
      description,
      imageUrl,
      imageFileUploadId,
      links,
      minScoreRatio,
      maxScoreRatio,
    ],
  );

  const getRawSnapshot = useCallback(
    (): CompletionFormRawSnapshot => ({
      title,
      description,
      imageUrl: imageUrl ?? null,
      imageFileUploadId: imageFileUploadId ?? null,
      links,
      minScoreRatio,
      maxScoreRatio,
    }),
    [description, imageFileUploadId, imageUrl, links, title, minScoreRatio, maxScoreRatio],
  );

  useEffect(() => {
    if (!onRawSnapshotChange) return;
    const id = window.setTimeout(() => {
      onRawSnapshotChange(getRawSnapshot());
    }, 300);
    return () => window.clearTimeout(id);
  }, [getRawSnapshot, onRawSnapshotChange]);

  const applyRawSnapshot = useCallback((snapshot: CompletionFormRawSnapshot) => {
    setTitle(snapshot.title ?? "");
    setDescription(snapshot.description ?? "");
    setImageUrl(snapshot.imageUrl ?? null);
    setImageFileUploadId(snapshot.imageFileUploadId ?? null);
    const nextLinks = snapshot.links ?? [];
    setLinks(nextLinks);
    linkKeyCounterRef.current += nextLinks.length;
    setLinkKeys(nextLinks.map((_, i) => `lk-${Date.now()}-${linkKeyCounterRef.current + i}`));
    setMinScoreRatio(snapshot.minScoreRatio ?? null);
    setMaxScoreRatio(snapshot.maxScoreRatio ?? null);
    setOpenLinkIndex(null);
    setErrors({});
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      validateAndGetValues: options => buildValidatedValues(options),
      isUploading: () => imageUpload.isUploading || linkUploadingRef.current.size > 0,
      deleteMarkedInitial: () => {
        imageUpload.deleteMarkedInitial();
      },
      isDirty: () => isDirty,
      getRawSnapshot,
      applyRawSnapshot,
    }),
    [applyRawSnapshot, buildValidatedValues, getRawSnapshot, imageUpload, isDirty],
  );

  const handleSubmit = () => {
    const values = buildValidatedValues();
    if (!values) {
      return;
    }

    onSubmit(values);
  };

  const handleDeleteImage = () => {
    imageUpload.discard();
    setImageUrl(null);
    setImageFileUploadId(null);
  };

  const handleBlurCapture = () => {
    setHasValidationStarted(true);
    runValidation();
  };

  return (
    <div className="flex flex-col gap-5 p-4" onBlurCapture={handleBlurCapture}>
      {!hideTitle && <Typo.SubTitle>결과 화면 편집</Typo.SubTitle>}

      <div data-field-error={errors.title ? "title" : undefined}>
        <Input
          label="제목"
          required
          placeholder="결과 화면 제목을 입력해주세요"
          maxLength={MISSION_COMPLETION_TITLE_MAX_LENGTH}
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          errorMessage={errors.title}
        />
      </div>

      <div
        className="flex flex-col gap-2"
        data-field-error={errors.description ? "description" : undefined}
      >
        <div className="flex items-center justify-between">
          <LabelText required>설명</LabelText>
          <Typo.Body
            size="small"
            className={
              descriptionLength > MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH
                ? "text-red-500"
                : "text-zinc-400"
            }
          >
            {descriptionLength}/{MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH}
          </Typo.Body>
        </div>
        <TiptapEditor
          content={description}
          onUpdate={nextValue => setDescription(nextValue)}
          placeholder="완료 화면에 표시할 설명을 입력해주세요."
          showToolbar
          editable
          className={`rounded-sm bg-white ring-1 ${errors.description ? "ring-red-500" : "ring-zinc-200"} focus-within:ring-violet-500 min-h-[220px]`}
        />
        {errors.description ? (
          <Typo.Body size="small" className="text-red-500">
            {errors.description}
          </Typo.Body>
        ) : null}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Typo.Body size="medium" className="font-semibold text-zinc-800">
              결과 화면 이미지
            </Typo.Body>
            <Typo.Body size="small" className="text-zinc-500">
              {imageUpload.isUploading ? "업로드 중..." : "이미지를 1:1 비율로 설정합니다. (선택)"}
            </Typo.Body>
          </div>
          <ImageSelector
            size="large"
            imageUrl={imageUpload.previewUrl ?? imageUrl ?? undefined}
            onImageSelect={file => openCropper(file, f => imageUpload.upload(f))}
            onImageDelete={handleDeleteImage}
            disabled={isImageBusy}
          />
        </div>
      </div>

      <div
        className="flex flex-col gap-3"
        data-field-error={
          links.some((_, i) => errors[`link_${i}_name`] || errors[`link_${i}_url`])
            ? "links"
            : undefined
        }
      >
        <div className="flex items-center justify-between">
          <Typo.Body size="medium" className="font-semibold text-zinc-800">
            링크 ({links.length}/{MISSION_COMPLETION_LINKS_MAX_COUNT})
          </Typo.Body>
          {links.length < MISSION_COMPLETION_LINKS_MAX_COUNT && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                linkKeyCounterRef.current += 1;
                const newKey = `lk-${Date.now()}-${linkKeyCounterRef.current}`;
                setLinks(prev => [...prev, { name: "", url: "", order: prev.length }]);
                setLinkKeys(prev => [...prev, newKey]);
                setOpenLinkIndex(links.length);
              }}
            >
              <Plus className="mr-1 size-4" />
              링크 추가
            </Button>
          )}
        </div>

        {links.length > 0 && (
          <div className="flex flex-col gap-2">
            {links.map((link, index) => (
              <CompletionLinkEditor
                key={linkKeys[index]}
                linkIndex={index}
                name={link.name}
                url={link.url}
                imageUrl={link.imageUrl ?? null}
                isOpen={openLinkIndex === index}
                disabled={isLoading}
                nameError={errors[`link_${index}_name`]}
                urlError={errors[`link_${index}_url`]}
                onNameChange={value => {
                  setLinks(prev => prev.map((l, i) => (i === index ? { ...l, name: value } : l)));
                }}
                onUrlChange={value => {
                  setLinks(prev => prev.map((l, i) => (i === index ? { ...l, url: value } : l)));
                }}
                onImageChange={(newImageUrl, newFileUploadId) => {
                  setLinks(prev =>
                    prev.map((l, i) =>
                      i === index
                        ? { ...l, imageUrl: newImageUrl, fileUploadId: newFileUploadId }
                        : l,
                    ),
                  );
                }}
                onIsUploadingChange={uploading => {
                  if (uploading) {
                    linkUploadingRef.current.add(index);
                  } else {
                    linkUploadingRef.current.delete(index);
                  }
                }}
                onToggle={() => setOpenLinkIndex(prev => (prev === index ? null : index))}
                onDelete={() => {
                  setLinks(prev => prev.filter((_, i) => i !== index));
                  setLinkKeys(prev => prev.filter((_, i) => i !== index));
                  linkUploadingRef.current.delete(index);
                  if (openLinkIndex === index) {
                    setOpenLinkIndex(null);
                  } else if (openLinkIndex !== null && openLinkIndex > index) {
                    setOpenLinkIndex(openLinkIndex - 1);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {!hideFooter && (
        <div className="flex gap-3 pb-4 pt-2">
          <Button variant="secondary" fullWidth onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
          <Button fullWidth onClick={handleSubmit} loading={isLoading} disabled={isLoading}>
            저장
          </Button>
        </div>
      )}

      {cropModalProps && <ImageCropModal {...cropModalProps} />}
    </div>
  );
}

export const CompletionForm = forwardRef<CompletionFormHandle, CompletionFormProps>(
  CompletionFormComponent,
);
CompletionForm.displayName = "CompletionForm";
