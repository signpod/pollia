"use client";

import { useMultipleImages, useSingleImage } from "@/app/admin/hooks/admin-image";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import {
  ACTION_DESCRIPTION_MAX_LENGTH,
  ACTION_OPTION_DESCRIPTION_MAX_LENGTH,
  ACTION_OPTION_TITLE_MAX_LENGTH,
  ACTION_TITLE_MAX_LENGTH,
  BRANCH_OPTIONS_COUNT,
  MULTIPLE_CHOICE_MAX_OPTIONS,
  MULTIPLE_CHOICE_MIN_OPTIONS,
  SCALE_MAX_OPTIONS,
  SCALE_MIN_OPTIONS,
  TAG_MAX_OPTIONS,
  TAG_MIN_OPTIONS,
} from "@/schemas/action";
import type { ActionDetail } from "@/types/dto";
import { ActionType } from "@prisma/client";
import {
  Button,
  CounterInput,
  ImageSelector,
  Input,
  LabelText,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Toggle,
  Typo,
} from "@repo/ui/components";
import { Plus, Trash2 } from "lucide-react";
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

function generateOptionKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface OptionFormItem {
  _key: string;
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  fileUploadId?: string | null;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
  order: number;
}

export interface ActionFormValues {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  isRequired: boolean;
  hasOther?: boolean;
  maxSelections?: number;
  options?: Omit<OptionFormItem, "_key">[];
  nextActionId?: string | null;
  nextCompletionId?: string | null;
}

export interface ActionFormHandle {
  validateAndGetValues: () => ActionFormValues | null;
  validateAndGetSubmission: () => { actionType: ActionType; values: ActionFormValues } | null;
  isUploading: () => boolean;
  deleteMarkedInitialImages: () => void;
  isDirty: () => boolean;
}

interface ActionFormProps {
  actionType: ActionType;
  initialValues?: ActionFormValues;
  editingAction?: ActionDetail | null;
  allActions: Array<Pick<ActionDetail, "id" | "title" | "order">>;
  completionOptions: Array<{ id: string; title: string }>;
  isLoading: boolean;
  onSubmit: (values: ActionFormValues) => void;
  onCancel: () => void;
  hideFooter?: boolean;
  hideTitle?: boolean;
  enableTypeSelect?: boolean;
  enforceExclusiveNextLink?: boolean;
  onActionTypeChange?: (type: ActionType) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

const NEEDS_OPTIONS: ActionType[] = [
  ActionType.MULTIPLE_CHOICE,
  ActionType.SCALE,
  ActionType.TAG,
  ActionType.BRANCH,
];

const NEEDS_MAX_SELECTIONS: ActionType[] = [
  ActionType.MULTIPLE_CHOICE,
  ActionType.TAG,
  ActionType.IMAGE,
  ActionType.DATE,
  ActionType.TIME,
];

const ACTION_TYPE_VALUES = Object.values(ActionType);

function getDefaultOptions(type: ActionType): OptionFormItem[] {
  if (type === ActionType.BRANCH) {
    return Array.from({ length: BRANCH_OPTIONS_COUNT }, (_, i) => ({
      _key: generateOptionKey(),
      title: "",
      order: i,
    }));
  }
  return [
    { _key: generateOptionKey(), title: "", order: 0 },
    { _key: generateOptionKey(), title: "", order: 1 },
  ];
}

function getOptionLimits(type: ActionType): { min: number; max: number } {
  switch (type) {
    case ActionType.MULTIPLE_CHOICE:
      return { min: MULTIPLE_CHOICE_MIN_OPTIONS, max: MULTIPLE_CHOICE_MAX_OPTIONS };
    case ActionType.SCALE:
      return { min: SCALE_MIN_OPTIONS, max: SCALE_MAX_OPTIONS };
    case ActionType.TAG:
      return { min: TAG_MIN_OPTIONS, max: TAG_MAX_OPTIONS };
    case ActionType.BRANCH:
      return { min: BRANCH_OPTIONS_COUNT, max: BRANCH_OPTIONS_COUNT };
    default:
      return { min: 0, max: 0 };
  }
}

const BRANCH_ACTION_PREFIX = "action:";
const BRANCH_COMPLETION_PREFIX = "completion:";

function getBranchTargetValue(option: OptionFormItem): string {
  if (option.nextActionId) {
    return `${BRANCH_ACTION_PREFIX}${option.nextActionId}`;
  }
  if (option.nextCompletionId) {
    return `${BRANCH_COMPLETION_PREFIX}${option.nextCompletionId}`;
  }
  return "";
}

function parseBranchTargetValue(value: string): {
  nextActionId: string | null;
  nextCompletionId: string | null;
} {
  if (!value) {
    return { nextActionId: null, nextCompletionId: null };
  }

  if (value.startsWith(BRANCH_COMPLETION_PREFIX)) {
    return {
      nextActionId: null,
      nextCompletionId: value.slice(BRANCH_COMPLETION_PREFIX.length) || null,
    };
  }

  if (value.startsWith(BRANCH_ACTION_PREFIX)) {
    return {
      nextActionId: value.slice(BRANCH_ACTION_PREFIX.length) || null,
      nextCompletionId: null,
    };
  }

  return {
    nextActionId: value || null,
    nextCompletionId: null,
  };
}

function ActionFormComponent(
  {
    actionType,
    initialValues,
    editingAction,
    allActions,
    completionOptions,
    isLoading,
    onSubmit,
    onCancel,
    hideFooter = false,
    hideTitle = false,
    enableTypeSelect = false,
    enforceExclusiveNextLink = false,
    onActionTypeChange,
    onDirtyChange,
  }: ActionFormProps,
  ref: ForwardedRef<ActionFormHandle>,
) {
  const initialNextLinkType: "action" | "completion" = initialValues?.nextCompletionId
    ? "completion"
    : "action";
  const hasConflictingInitialNextLink = Boolean(
    initialValues?.nextActionId && initialValues?.nextCompletionId,
  );
  const normalizedInitialNextActionId =
    enforceExclusiveNextLink &&
    hasConflictingInitialNextLink &&
    initialNextLinkType === "completion"
      ? null
      : (initialValues?.nextActionId ?? null);
  const normalizedInitialNextCompletionId =
    enforceExclusiveNextLink && hasConflictingInitialNextLink && initialNextLinkType === "action"
      ? null
      : (initialValues?.nextCompletionId ?? null);

  const [selectedActionType, setSelectedActionType] = useState(actionType);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initialValues?.imageUrl ?? null);
  const [imageFileUploadId, setImageFileUploadId] = useState<string | null>(
    initialValues?.imageFileUploadId ?? null,
  );
  const [isRequired, setIsRequired] = useState(initialValues?.isRequired ?? true);
  const [hasOther, setHasOther] = useState(initialValues?.hasOther ?? false);
  const [maxSelections, setMaxSelections] = useState(initialValues?.maxSelections ?? 1);
  const [options, setOptions] = useState<OptionFormItem[]>(() => {
    if (initialValues?.options) {
      return initialValues.options.map(o => ({ ...o, _key: generateOptionKey() }));
    }
    return NEEDS_OPTIONS.includes(actionType) ? getDefaultOptions(actionType) : [];
  });
  const [nextActionId, setNextActionId] = useState<string | null>(normalizedInitialNextActionId);
  const [nextCompletionId, setNextCompletionId] = useState<string | null>(
    normalizedInitialNextCompletionId,
  );
  const [nextLinkType, setNextLinkType] = useState<"action" | "completion">(initialNextLinkType);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const enableEditorActionMedia = enforceExclusiveNextLink;
  const needsOptions = NEEDS_OPTIONS.includes(selectedActionType);
  const needsMaxSelections = NEEDS_MAX_SELECTIONS.includes(selectedActionType);
  const isBranch = selectedActionType === ActionType.BRANCH;
  const optionLimits = getOptionLimits(selectedActionType);
  const showOptionDescription =
    enableEditorActionMedia &&
    (selectedActionType === ActionType.MULTIPLE_CHOICE ||
      selectedActionType === ActionType.SCALE ||
      selectedActionType === ActionType.BRANCH);
  const showOptionImage =
    enableEditorActionMedia &&
    (selectedActionType === ActionType.MULTIPLE_CHOICE || selectedActionType === ActionType.BRANCH);

  const selectableActions = allActions.filter(a => !editingAction || a.id !== editingAction.id);
  const hasLinkTargets = selectableActions.length > 0 || completionOptions.length > 0;
  const completionIdSet = useMemo(
    () => new Set(completionOptions.map(completion => completion.id)),
    [completionOptions],
  );
  const [initialOptionImages] = useState(() =>
    options.flatMap(option =>
      option.imageUrl
        ? [
            {
              id: option._key,
              url: option.imageUrl,
              fileUploadId: option.fileUploadId ?? undefined,
            },
          ]
        : [],
    ),
  );

  const actionImageUpload = useSingleImage({
    initialUrl: initialValues?.imageUrl ?? null,
    initialFileUploadId: initialValues?.imageFileUploadId ?? null,
    bucket: STORAGE_BUCKETS.ACTION_IMAGES,
    onUploadSuccess: data => {
      setImageUrl(data.publicUrl);
      setImageFileUploadId(data.fileUploadId);
    },
  });
  const optionImages = useMultipleImages({
    bucket: STORAGE_BUCKETS.ACTION_IMAGES,
    initialImages: initialOptionImages,
    onUploadSuccess: (optionKey, data) => {
      setOptions(prev =>
        prev.map(option =>
          option._key === optionKey
            ? {
                ...option,
                imageUrl: data.publicUrl,
                fileUploadId: data.fileUploadId,
              }
            : option,
        ),
      );
    },
  });

  useEffect(() => {
    if (!nextCompletionId || completionIdSet.has(nextCompletionId)) {
      return;
    }

    setNextCompletionId(null);
    setErrors(prev => {
      if (!prev.nextLink) {
        return prev;
      }

      const { nextLink: _nextLink, ...rest } = prev;
      return rest;
    });
  }, [completionIdSet, nextCompletionId]);

  useEffect(() => {
    if (!isBranch) {
      return;
    }

    let hasChanged = false;
    const nextOptions = options.map(option => {
      if (option.nextCompletionId && !completionIdSet.has(option.nextCompletionId)) {
        hasChanged = true;
        return {
          ...option,
          nextCompletionId: null,
        };
      }

      return option;
    });

    if (hasChanged) {
      setOptions(nextOptions);
    }
  }, [isBranch, options, completionIdSet]);

  const handleActionTypeChange = (nextType: ActionType) => {
    if (nextType === selectedActionType) {
      return;
    }

    for (const option of options) {
      optionImages.discard(option._key);
    }

    setSelectedActionType(nextType);
    setHasOther(false);
    setMaxSelections(1);
    setOptions(NEEDS_OPTIONS.includes(nextType) ? getDefaultOptions(nextType) : []);
    setNextActionId(null);
    setNextCompletionId(null);
    setNextLinkType("action");
    setErrors({});
    onActionTypeChange?.(nextType);
  };

  const handleNextLinkTypeChange = (type: "action" | "completion") => {
    setNextLinkType(type);

    if (!enforceExclusiveNextLink) {
      return;
    }

    if (type === "action") {
      setNextCompletionId(null);
      return;
    }

    setNextActionId(null);
  };

  const handleNextActionChange = (value: string) => {
    setNextActionId(value || null);

    if (enforceExclusiveNextLink) {
      setNextCompletionId(null);
    }
  };

  const handleNextCompletionChange = (value: string) => {
    setNextCompletionId(value || null);

    if (enforceExclusiveNextLink) {
      setNextActionId(null);
    }
  };

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    } else if (title.length > ACTION_TITLE_MAX_LENGTH) {
      newErrors.title = `제목은 ${ACTION_TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`;
    }

    if (needsOptions) {
      const emptyOptions = options.filter(o => !o.title.trim());
      if (emptyOptions.length > 0) {
        newErrors.options = "모든 항목의 제목을 입력해주세요.";
      }
      if (options.length < optionLimits.min) {
        newErrors.options = `최소 ${optionLimits.min}개 이상의 항목이 필요합니다.`;
      }
    }

    if (hasLinkTargets) {
      if (isBranch) {
        const missingBranchNext = options.some(o => !o.nextActionId && !o.nextCompletionId);
        if (missingBranchNext) {
          newErrors.branchNextAction = "모든 분기 옵션의 다음 이동을 설정해주세요.";
        }
      } else {
        if (nextLinkType === "action" && !nextActionId) {
          newErrors.nextLink = "다음 이동할 액션을 선택해주세요.";
        }
        if (nextLinkType === "completion" && !nextCompletionId) {
          newErrors.nextLink = "완료 화면을 선택해주세요.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    title,
    needsOptions,
    options,
    optionLimits.min,
    isBranch,
    nextLinkType,
    nextActionId,
    nextCompletionId,
    hasLinkTargets,
  ]);

  const buildValidatedValues = useCallback((): ActionFormValues | null => {
    if (!validate()) return null;

    return {
      title: title.trim(),
      description: description?.trim() || null,
      imageUrl,
      imageFileUploadId,
      isRequired,
      ...(needsMaxSelections && { maxSelections }),
      ...(selectedActionType === ActionType.MULTIPLE_CHOICE && { hasOther }),
      ...(selectedActionType === ActionType.TAG && { hasOther }),
      ...(needsOptions && {
        options: options.map((o, i) => {
          const { _key, ...rest } = o;
          return {
            ...rest,
            title: o.title.trim(),
            description: enableEditorActionMedia
              ? showOptionDescription
                ? o.description?.trim() || null
                : null
              : o.description?.trim() || null,
            imageUrl: enableEditorActionMedia
              ? showOptionImage
                ? (o.imageUrl ?? null)
                : null
              : (o.imageUrl ?? null),
            fileUploadId: enableEditorActionMedia
              ? showOptionImage
                ? (o.fileUploadId ?? null)
                : null
              : (o.fileUploadId ?? null),
            order: i,
          };
        }),
      }),
      ...(!isBranch && nextLinkType === "action" && { nextActionId, nextCompletionId: null }),
      ...(!isBranch && nextLinkType === "completion" && { nextCompletionId, nextActionId: null }),
    };
  }, [
    validate,
    title,
    description,
    imageUrl,
    imageFileUploadId,
    isRequired,
    needsMaxSelections,
    maxSelections,
    selectedActionType,
    hasOther,
    needsOptions,
    options,
    enableEditorActionMedia,
    showOptionDescription,
    showOptionImage,
    isBranch,
    nextLinkType,
    nextActionId,
    nextCompletionId,
  ]);

  const dirtyComparableValue = useMemo(
    () => ({
      actionType: selectedActionType,
      values: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl,
        imageFileUploadId,
        isRequired,
        ...(needsMaxSelections && { maxSelections }),
        ...(selectedActionType === ActionType.MULTIPLE_CHOICE && { hasOther }),
        ...(selectedActionType === ActionType.TAG && { hasOther }),
        ...(needsOptions && {
          options: options.map((option, index) => {
            const { _key, ...rest } = option;
            return {
              ...rest,
              title: option.title.trim(),
              description: enableEditorActionMedia
                ? showOptionDescription
                  ? option.description?.trim() || null
                  : null
                : option.description?.trim() || null,
              imageUrl: enableEditorActionMedia
                ? showOptionImage
                  ? (option.imageUrl ?? null)
                  : null
                : (option.imageUrl ?? null),
              fileUploadId: enableEditorActionMedia
                ? showOptionImage
                  ? (option.fileUploadId ?? null)
                  : null
                : (option.fileUploadId ?? null),
              order: index,
            };
          }),
        }),
        ...(!isBranch && nextLinkType === "action" && { nextActionId, nextCompletionId: null }),
        ...(!isBranch && nextLinkType === "completion" && { nextCompletionId, nextActionId: null }),
      },
    }),
    [
      selectedActionType,
      title,
      description,
      imageUrl,
      imageFileUploadId,
      isRequired,
      needsMaxSelections,
      maxSelections,
      hasOther,
      needsOptions,
      options,
      enableEditorActionMedia,
      showOptionDescription,
      showOptionImage,
      isBranch,
      nextLinkType,
      nextActionId,
      nextCompletionId,
    ],
  );
  const dirtyComparableString = JSON.stringify(dirtyComparableValue);
  const initialDirtyComparableStringRef = useRef(dirtyComparableString);
  const isDirty = dirtyComparableString !== initialDirtyComparableStringRef.current;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [onDirtyChange, isDirty]);

  useImperativeHandle(
    ref,
    () => ({
      validateAndGetValues: () => buildValidatedValues() ?? null,
      validateAndGetSubmission: () => {
        const values = buildValidatedValues();
        if (!values) {
          return null;
        }

        return { actionType: selectedActionType, values };
      },
      isUploading: () => actionImageUpload.isUploading || optionImages.isAnyUploading,
      deleteMarkedInitialImages: () => {
        actionImageUpload.deleteMarkedInitial();
        optionImages.deleteAllMarkedInitials();
      },
      isDirty: () => isDirty,
    }),
    [actionImageUpload, buildValidatedValues, isDirty, optionImages, selectedActionType],
  );

  const handleSubmit = () => {
    const values = buildValidatedValues();
    if (!values) return;
    onSubmit(values);
  };

  const addOption = () => {
    if (options.length >= optionLimits.max) return;
    setOptions([
      ...options,
      {
        _key: generateOptionKey(),
        title: "",
        description: null,
        imageUrl: null,
        fileUploadId: null,
        order: options.length,
      },
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length <= optionLimits.min) return;
    const target = options[index];
    if (target) {
      optionImages.discard(target._key);
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: keyof OptionFormItem, value: string | null) => {
    setOptions(prev =>
      prev.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option,
      ),
    );
  };

  const handleActionImageDelete = () => {
    actionImageUpload.discard();
    setImageUrl(null);
    setImageFileUploadId(null);
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      {!hideTitle && (
        <Typo.SubTitle>
          {editingAction ? "액션 수정" : `${ACTION_TYPE_LABELS[selectedActionType]} 액션 추가`}
        </Typo.SubTitle>
      )}

      {enableTypeSelect && (
        <div className="flex flex-col gap-2">
          <LabelText required={false}>액션 유형</LabelText>
          <Select
            value={selectedActionType}
            onValueChange={value => handleActionTypeChange(value as ActionType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="액션 유형을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPE_VALUES.map(type => (
                <SelectItem key={type} value={type}>
                  {ACTION_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Input
        label="제목"
        required
        placeholder="액션 제목을 입력해주세요"
        maxLength={ACTION_TITLE_MAX_LENGTH}
        value={title}
        onChange={e => setTitle(e.target.value)}
        errorMessage={errors.title}
      />

      <Textarea
        label="설명"
        placeholder="액션에 대한 설명을 입력해주세요"
        maxLength={ACTION_DESCRIPTION_MAX_LENGTH}
        rows={3}
        value={description ?? ""}
        onChange={e => setDescription(e.target.value)}
      />

      {enableEditorActionMedia && (
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Typo.Body size="medium" className="font-semibold text-zinc-800">
                액션 이미지
              </Typo.Body>
              <Typo.Body size="small" className="text-zinc-500">
                {actionImageUpload.isUploading
                  ? "업로드 중..."
                  : "액션에 노출할 이미지를 설정합니다. (선택)"}
              </Typo.Body>
            </div>
            <ImageSelector
              size="large"
              imageUrl={actionImageUpload.previewUrl ?? undefined}
              onImageSelect={actionImageUpload.upload}
              onImageDelete={handleActionImageDelete}
              disabled={isLoading || actionImageUpload.isUploading}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <LabelText required={false}>필수 응답</LabelText>
        <Toggle checked={isRequired} onCheckedChange={setIsRequired} />
      </div>

      {needsMaxSelections && !isBranch && (
        <div className="flex items-center justify-between">
          <LabelText required={false}>최대 선택 수</LabelText>
          <CounterInput
            value={maxSelections}
            onChange={setMaxSelections}
            min={1}
            max={needsOptions ? options.length : 10}
          />
        </div>
      )}

      {(selectedActionType === ActionType.MULTIPLE_CHOICE ||
        selectedActionType === ActionType.TAG) && (
        <div className="flex items-center justify-between">
          <LabelText required={false}>기타 옵션 허용</LabelText>
          <Toggle checked={hasOther} onCheckedChange={setHasOther} />
        </div>
      )}

      {needsOptions && (
        <div className="flex flex-col gap-3">
          <LabelText required>
            항목 ({options.length}/{optionLimits.max})
          </LabelText>
          {options.map((option, index) => {
            const optionPreviewUrl = showOptionImage
              ? (optionImages.getPreviewUrl(option._key) ?? option.imageUrl ?? undefined)
              : undefined;

            return (
              <div
                key={option._key}
                className="flex flex-col gap-2 rounded-lg border border-zinc-100 bg-zinc-50 p-3"
              >
                <div className="flex items-center gap-2">
                  <Typo.Body size="small" className="shrink-0 font-medium text-zinc-500">
                    {index + 1}
                  </Typo.Body>
                  <input
                    type="text"
                    placeholder="항목 제목"
                    maxLength={ACTION_OPTION_TITLE_MAX_LENGTH}
                    value={option.title}
                    onChange={e => updateOption(index, "title", e.target.value)}
                    className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                  />
                  {!isBranch && options.length > optionLimits.min && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="rounded p-1 text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                {showOptionDescription && (
                  <div className="ml-6">
                    <input
                      type="text"
                      placeholder="항목 설명 (선택)"
                      maxLength={ACTION_OPTION_DESCRIPTION_MAX_LENGTH}
                      value={option.description ?? ""}
                      onChange={e => updateOption(index, "description", e.target.value)}
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                    />
                  </div>
                )}

                {showOptionImage && (
                  <div className="ml-6 rounded-md border border-zinc-200 bg-white px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <Typo.Body size="small" className="text-zinc-600">
                        항목 이미지 (선택)
                      </Typo.Body>
                      <ImageSelector
                        size="medium"
                        imageUrl={optionPreviewUrl}
                        onImageSelect={file => {
                          if (option.fileUploadId) {
                            optionImages.markInitialForDeletion(option.fileUploadId);
                          }
                          optionImages.upload(option._key, file);
                        }}
                        onImageDelete={() => {
                          optionImages.discard(option._key);
                          updateOption(index, "imageUrl", null);
                          updateOption(index, "fileUploadId", null);
                        }}
                        disabled={isLoading || optionImages.isUploading(option._key)}
                      />
                    </div>
                  </div>
                )}

                {isBranch && (
                  <div className="ml-6">
                    {hasLinkTargets ? (
                      <Select
                        value={getBranchTargetValue(option)}
                        onValueChange={val => {
                          const parsed = parseBranchTargetValue(val);
                          setOptions(prev =>
                            prev.map((currentOption, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...currentOption,
                                    nextActionId: parsed.nextActionId,
                                    nextCompletionId: parsed.nextCompletionId,
                                  }
                                : currentOption,
                            ),
                          );
                        }}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="분기 이동할 대상 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectableActions.map(a => (
                            <SelectItem key={a.id} value={`${BRANCH_ACTION_PREFIX}${a.id}`}>
                              #{(a.order ?? 0) + 1} {a.title}
                            </SelectItem>
                          ))}
                          {completionOptions.map(c => (
                            <SelectItem key={c.id} value={`${BRANCH_COMPLETION_PREFIX}${c.id}`}>
                              [완료] {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Typo.Body size="small" className="text-zinc-400">
                        다른 액션을 먼저 추가해주세요.
                      </Typo.Body>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {errors.options && (
            <Typo.Body size="small" className="text-red-500">
              {errors.options}
            </Typo.Body>
          )}
          {errors.branchNextAction && (
            <Typo.Body size="small" className="text-red-500">
              {errors.branchNextAction}
            </Typo.Body>
          )}

          {!isBranch && options.length < optionLimits.max && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 py-2.5 text-sm text-zinc-500 transition-colors hover:border-violet-400 hover:text-violet-500"
            >
              <Plus className="size-4" />
              항목 추가
            </button>
          )}
        </div>
      )}

      {!isBranch && (
        <div className="flex flex-col gap-3 rounded-lg border border-violet-100 bg-violet-50/50 p-4">
          <LabelText required={hasLinkTargets}>다음 이동 설정</LabelText>

          {!hasLinkTargets ? (
            <Typo.Body size="small" className="text-zinc-400">
              다른 액션이나 완료 화면을 먼저 추가한 후 설정할 수 있습니다.
            </Typo.Body>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleNextLinkTypeChange("action")}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    nextLinkType === "action"
                      ? "border-violet-400 bg-violet-500 text-white"
                      : "border-zinc-200 bg-white text-zinc-600"
                  }`}
                >
                  다음 액션
                </button>
                <button
                  type="button"
                  onClick={() => handleNextLinkTypeChange("completion")}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    nextLinkType === "completion"
                      ? "border-violet-400 bg-violet-500 text-white"
                      : "border-zinc-200 bg-white text-zinc-600"
                  }`}
                >
                  완료 화면
                </button>
              </div>

              {nextLinkType === "action" ? (
                <Select value={nextActionId ?? ""} onValueChange={handleNextActionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="다음 이동할 액션을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableActions.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        #{(a.order ?? 0) + 1} {a.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={nextCompletionId ?? ""} onValueChange={handleNextCompletionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="완료 화면을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {completionOptions.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {enforceExclusiveNextLink && (
                <Typo.Body size="small" className="text-zinc-500">
                  다음 액션/완료 화면 중 하나만 선택할 수 있습니다.
                </Typo.Body>
              )}

              {errors.nextLink && (
                <Typo.Body size="small" className="text-red-500">
                  {errors.nextLink}
                </Typo.Body>
              )}
            </>
          )}
        </div>
      )}

      {!hideFooter && (
        <div className="flex gap-3 pb-4 pt-2">
          <Button variant="secondary" fullWidth onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
          <Button fullWidth onClick={handleSubmit} loading={isLoading} disabled={isLoading}>
            {editingAction ? "수정" : "추가"}
          </Button>
        </div>
      )}
    </div>
  );
}

export const ActionForm = forwardRef<ActionFormHandle, ActionFormProps>(ActionFormComponent);
ActionForm.displayName = "ActionForm";
