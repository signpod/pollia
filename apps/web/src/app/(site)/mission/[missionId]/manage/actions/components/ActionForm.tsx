"use client";

import { completionIdSetAtom } from "@/app/(site)/(main)/editor/missions/[missionId]/atoms/editorDerivedAtoms";
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
import { useAtomValue } from "jotai";
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
import { patchOptionByKey, removeOptionByKey } from "./actionFormOptionState";

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

export interface ActionFormRawSnapshot {
  actionType: ActionType;
  values: ActionFormValues;
  nextLinkType: "action" | "completion";
}

export interface ActionFormHandle {
  validateAndGetValues: (options?: { showErrors?: boolean }) => ActionFormValues | null;
  validateAndGetSubmission: (options?: { showErrors?: boolean }) => {
    actionType: ActionType;
    values: ActionFormValues;
  } | null;
  isUploading: () => boolean;
  deleteMarkedInitialImages: () => void;
  isDirty: () => boolean;
  getRawSnapshot: () => ActionFormRawSnapshot;
  applyRawSnapshot: (snapshot: ActionFormRawSnapshot) => void;
}

interface ActionFormProps {
  actionType: ActionType;
  initialValues?: ActionFormValues;
  dirtyBaselineValues?: ActionFormValues;
  editingAction?: ActionDetail | null;
  allActions: Array<Pick<ActionDetail, "id" | "title" | "order">>;
  completionOptions: Array<{ id: string; title: string }>;
  allowCompletionLink?: boolean;
  isLoading: boolean;
  onSubmit: (values: ActionFormValues) => void;
  onCancel: () => void;
  hideFooter?: boolean;
  hideTitle?: boolean;
  enableTypeSelect?: boolean;
  enforceExclusiveNextLink?: boolean;
  wordingMode?: "action" | "question";
  onActionTypeChange?: (type: ActionType) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onValidationStateChange?: (issueCount: number) => void;
  onRawSnapshotChange?: (snapshot: ActionFormRawSnapshot) => void;
}

type NextLinkType = "action" | "completion";

interface NextLinkSelectorProps {
  itemLabel: string;
  allowCompletionLink: boolean;
  linkType: NextLinkType;
  actionValue: string | null;
  completionValue: string | null;
  selectableActions: Array<Pick<ActionDetail, "id" | "title" | "order">>;
  completionOptions: Array<{ id: string; title: string }>;
  onLinkTypeChange: (type: NextLinkType) => void;
  onActionChange: (value: string) => void;
  onCompletionChange: (value: string) => void;
  errorMessage?: string;
}

function NextLinkSelector({
  itemLabel,
  allowCompletionLink,
  linkType,
  actionValue,
  completionValue,
  selectableActions,
  completionOptions,
  onLinkTypeChange,
  onActionChange,
  onCompletionChange,
  errorMessage,
}: NextLinkSelectorProps) {
  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onLinkTypeChange("action")}
          className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
            linkType === "action"
              ? "border-violet-400 bg-violet-500 text-white"
              : "border-zinc-200 bg-white text-zinc-600"
          }`}
        >
          {`다음 ${itemLabel}`}
        </button>
        {allowCompletionLink ? (
          <button
            type="button"
            onClick={() => onLinkTypeChange("completion")}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
              linkType === "completion"
                ? "border-violet-400 bg-violet-500 text-white"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            완료 화면
          </button>
        ) : null}
      </div>

      {linkType === "action" || !allowCompletionLink ? (
        <Select value={actionValue ?? ""} onValueChange={onActionChange}>
          <SelectTrigger>
            <SelectValue placeholder={`다음 이동할 ${itemLabel}을 선택하세요`} />
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
        <Select value={completionValue ?? ""} onValueChange={onCompletionChange}>
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

      {errorMessage && (
        <Typo.Body size="small" className="text-red-500">
          {errorMessage}
        </Typo.Body>
      )}
    </>
  );
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

function areErrorMapsEqual(left: Record<string, string>, right: Record<string, string>): boolean {
  const leftEntries = Object.entries(left);
  const rightEntries = Object.entries(right);

  if (leftEntries.length !== rightEntries.length) {
    return false;
  }

  return leftEntries.every(([key, value]) => right[key] === value);
}

function buildActionDirtyComparable(params: {
  actionType: ActionType;
  values: ActionFormValues;
  nextLinkType: "action" | "completion";
  allowCompletionLink: boolean;
  enableEditorActionMedia: boolean;
}) {
  const { actionType, values, nextLinkType, allowCompletionLink, enableEditorActionMedia } = params;
  const resolvedNextLinkType: NextLinkType = allowCompletionLink ? nextLinkType : "action";
  const needsOptions = NEEDS_OPTIONS.includes(actionType);
  const needsMaxSelections = NEEDS_MAX_SELECTIONS.includes(actionType);
  const isBranch = actionType === ActionType.BRANCH;
  const showOptionDescription =
    enableEditorActionMedia &&
    (actionType === ActionType.MULTIPLE_CHOICE ||
      actionType === ActionType.SCALE ||
      actionType === ActionType.BRANCH);
  const showOptionImage =
    enableEditorActionMedia &&
    (actionType === ActionType.MULTIPLE_CHOICE || actionType === ActionType.BRANCH);

  return {
    actionType,
    values: {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      imageUrl: values.imageUrl ?? null,
      imageFileUploadId: values.imageFileUploadId ?? null,
      isRequired: values.isRequired,
      ...(needsMaxSelections && { maxSelections: values.maxSelections ?? 1 }),
      ...(actionType === ActionType.MULTIPLE_CHOICE && { hasOther: Boolean(values.hasOther) }),
      ...(actionType === ActionType.TAG && { hasOther: Boolean(values.hasOther) }),
      ...(needsOptions && {
        options: (values.options ?? []).map((option, index) => ({
          ...option,
          title: option.title.trim(),
          description: showOptionDescription ? option.description?.trim() || null : null,
          imageUrl: showOptionImage ? (option.imageUrl ?? null) : null,
          fileUploadId: showOptionImage ? (option.fileUploadId ?? null) : null,
          nextCompletionId: allowCompletionLink ? (option.nextCompletionId ?? null) : null,
          order: index,
        })),
      }),
      ...(!isBranch &&
        resolvedNextLinkType === "action" && {
          nextActionId: values.nextActionId ?? null,
          nextCompletionId: null,
        }),
      ...(!isBranch &&
        resolvedNextLinkType === "completion" && {
          nextCompletionId: values.nextCompletionId ?? null,
          nextActionId: null,
        }),
    },
  };
}

function ActionFormComponent(
  {
    actionType,
    initialValues,
    dirtyBaselineValues,
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
    allowCompletionLink = true,
    wordingMode = "action",
    onActionTypeChange,
    onDirtyChange,
    onValidationStateChange,
    onRawSnapshotChange,
  }: ActionFormProps,
  ref: ForwardedRef<ActionFormHandle>,
) {
  const initialNextLinkType: "action" | "completion" =
    allowCompletionLink && initialValues?.nextCompletionId ? "completion" : "action";
  const hasConflictingInitialNextLink = Boolean(
    initialValues?.nextActionId && initialValues?.nextCompletionId,
  );
  const normalizedInitialNextActionId =
    allowCompletionLink &&
    enforceExclusiveNextLink &&
    hasConflictingInitialNextLink &&
    initialNextLinkType === "completion"
      ? null
      : (initialValues?.nextActionId ?? null);
  const normalizedInitialNextCompletionId = !allowCompletionLink
    ? null
    : enforceExclusiveNextLink && hasConflictingInitialNextLink && initialNextLinkType === "action"
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
  const [nextLinkType, setNextLinkType] = useState<NextLinkType>(
    allowCompletionLink ? initialNextLinkType : "action",
  );
  const [branchOptionLinkTypeByKey, setBranchOptionLinkTypeByKey] = useState<
    Record<string, NextLinkType>
  >({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasValidationStarted, setHasValidationStarted] = useState(false);
  const [validationIssueCount, setValidationIssueCount] = useState(0);
  const initialActionTypeRef = useRef(actionType);

  const enableEditorActionMedia = enforceExclusiveNextLink;
  const itemLabel = wordingMode === "question" ? "질문" : "액션";
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
  const hasLinkTargets =
    selectableActions.length > 0 || (allowCompletionLink && completionOptions.length > 0);
  const completionIdSet = useAtomValue(completionIdSetAtom);
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
    if (!allowCompletionLink) {
      if (nextCompletionId) {
        setNextCompletionId(null);
      }
      return;
    }

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
  }, [allowCompletionLink, completionIdSet, nextCompletionId]);

  useEffect(() => {
    if (!isBranch) {
      return;
    }

    let hasChanged = false;
    const nextOptions = options.map(option => {
      if (
        option.nextCompletionId &&
        (!allowCompletionLink || !completionIdSet.has(option.nextCompletionId))
      ) {
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
  }, [allowCompletionLink, completionIdSet, isBranch, options]);

  useEffect(() => {
    setBranchOptionLinkTypeByKey(prev => {
      const next: Record<string, NextLinkType> = {};

      for (const option of options) {
        next[option._key] = allowCompletionLink
          ? (prev[option._key] ?? (option.nextCompletionId ? "completion" : "action"))
          : "action";
      }

      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);

      if (prevKeys.length !== nextKeys.length) {
        return next;
      }

      for (const key of nextKeys) {
        if (prev[key] !== next[key]) {
          return next;
        }
      }

      return prev;
    });
  }, [allowCompletionLink, options]);

  useEffect(() => {
    if (allowCompletionLink) {
      return;
    }

    setNextLinkType("action");
    if (nextCompletionId) {
      setNextCompletionId(null);
    }

    setOptions(prev =>
      prev.map(option =>
        option.nextCompletionId ? { ...option, nextCompletionId: null } : option,
      ),
    );
  }, [allowCompletionLink, nextCompletionId]);

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
    setBranchOptionLinkTypeByKey({});
    setErrors({});
    onActionTypeChange?.(nextType);
  };

  const handleNextLinkTypeChange = (type: NextLinkType) => {
    if (!allowCompletionLink && type === "completion") {
      return;
    }

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
    if (!allowCompletionLink) {
      return;
    }

    setNextCompletionId(value || null);

    if (enforceExclusiveNextLink) {
      setNextActionId(null);
    }
  };

  const handleBranchOptionLinkTypeChange = (optionKey: string, type: NextLinkType) => {
    const resolvedType = allowCompletionLink ? type : "action";
    setBranchOptionLinkTypeByKey(prev => {
      if (prev[optionKey] === resolvedType) {
        return prev;
      }

      return {
        ...prev,
        [optionKey]: resolvedType,
      };
    });

    setOptions(prev =>
      prev.map(option => {
        if (option._key !== optionKey) {
          return option;
        }

        if (resolvedType === "action") {
          return { ...option, nextCompletionId: null };
        }

        return { ...option, nextActionId: null };
      }),
    );
  };

  const handleBranchOptionNextActionChange = (optionKey: string, value: string) => {
    setBranchOptionLinkTypeByKey(prev => ({
      ...prev,
      [optionKey]: "action",
    }));
    setOptions(prev =>
      patchOptionByKey(prev, optionKey, {
        nextActionId: value || null,
        nextCompletionId: null,
      }),
    );
  };

  const handleBranchOptionNextCompletionChange = (optionKey: string, value: string) => {
    if (!allowCompletionLink) {
      return;
    }

    setBranchOptionLinkTypeByKey(prev => ({
      ...prev,
      [optionKey]: "completion",
    }));
    setOptions(prev =>
      patchOptionByKey(prev, optionKey, {
        nextActionId: null,
        nextCompletionId: value || null,
      }),
    );
  };

  const buildValidationErrors = useCallback((): Record<string, string> => {
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
        const missingBranchNext =
          allowCompletionLink && options.some(o => !o.nextActionId && !o.nextCompletionId);
        if (allowCompletionLink && missingBranchNext) {
          newErrors.branchNextAction = "모든 분기 옵션의 다음 이동을 설정해주세요.";
        }
      } else {
        if (allowCompletionLink && nextLinkType === "action" && !nextActionId) {
          newErrors.nextLink = `다음 이동할 ${itemLabel}을 선택해주세요.`;
        }
        if (allowCompletionLink && nextLinkType === "completion" && !nextCompletionId) {
          newErrors.nextLink = "완료 화면을 선택해주세요.";
        }
      }
    }

    return newErrors;
  }, [
    title,
    needsOptions,
    options,
    optionLimits.min,
    isBranch,
    allowCompletionLink,
    nextLinkType,
    nextActionId,
    nextCompletionId,
    hasLinkTargets,
    itemLabel,
  ]);

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

  const buildValidatedValues = useCallback(
    ({ showErrors = true }: { showErrors?: boolean } = {}): ActionFormValues | null => {
      const validationResult = runValidation({ showErrors });
      if (!validationResult.isValid) {
        return null;
      }

      const resolvedNextLinkType: NextLinkType = allowCompletionLink ? nextLinkType : "action";

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
        ...(!isBranch &&
          resolvedNextLinkType === "action" && { nextActionId, nextCompletionId: null }),
        ...(!isBranch &&
          resolvedNextLinkType === "completion" && {
            nextCompletionId,
            nextActionId: null,
          }),
      };
    },
    [
      runValidation,
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
      allowCompletionLink,
      nextLinkType,
      nextActionId,
      nextCompletionId,
    ],
  );

  const getRawSnapshot = useCallback((): ActionFormRawSnapshot => {
    const resolvedNextLinkType: NextLinkType = allowCompletionLink ? nextLinkType : "action";

    const rawValues: ActionFormValues = {
      title,
      description: description ?? null,
      imageUrl,
      imageFileUploadId,
      isRequired,
      ...(needsMaxSelections && { maxSelections }),
      ...(selectedActionType === ActionType.MULTIPLE_CHOICE && { hasOther }),
      ...(selectedActionType === ActionType.TAG && { hasOther }),
      ...(needsOptions && {
        options: options.map(option => {
          const { _key: _ignored, ...rest } = option;
          return {
            ...rest,
            description: rest.description ?? null,
            imageUrl: rest.imageUrl ?? null,
            fileUploadId: rest.fileUploadId ?? null,
            nextActionId: rest.nextActionId ?? null,
            nextCompletionId: rest.nextCompletionId ?? null,
          };
        }),
      }),
      ...(!isBranch &&
        resolvedNextLinkType === "action" && { nextActionId, nextCompletionId: null }),
      ...(!isBranch &&
        resolvedNextLinkType === "completion" && { nextCompletionId, nextActionId: null }),
      ...(isBranch && { nextActionId: null, nextCompletionId: null }),
    };

    return {
      actionType: selectedActionType,
      values: rawValues,
      nextLinkType: resolvedNextLinkType,
    };
  }, [
    description,
    hasOther,
    imageFileUploadId,
    imageUrl,
    isBranch,
    isRequired,
    needsMaxSelections,
    needsOptions,
    allowCompletionLink,
    nextActionId,
    nextCompletionId,
    nextLinkType,
    options,
    selectedActionType,
    title,
    maxSelections,
  ]);

  const applyRawSnapshot = useCallback(
    (snapshot: ActionFormRawSnapshot) => {
      const nextType = snapshot.actionType;
      const nextValues = snapshot.values;
      const nextLink: NextLinkType =
        allowCompletionLink && snapshot.nextLinkType === "completion" ? "completion" : "action";

      setSelectedActionType(nextType);
      onActionTypeChange?.(nextType);
      setTitle(nextValues.title ?? "");
      setDescription(nextValues.description ?? "");
      setImageUrl(nextValues.imageUrl ?? null);
      setImageFileUploadId(nextValues.imageFileUploadId ?? null);
      setIsRequired(nextValues.isRequired ?? true);
      setHasOther(nextValues.hasOther ?? false);
      setMaxSelections(nextValues.maxSelections ?? 1);
      const nextOptions = (nextValues.options ?? []).map((option, index) => ({
        _key: generateOptionKey(),
        id: option.id,
        title: option.title ?? "",
        description: option.description ?? null,
        imageUrl: option.imageUrl ?? null,
        fileUploadId: option.fileUploadId ?? null,
        nextActionId: option.nextActionId ?? null,
        nextCompletionId: allowCompletionLink ? (option.nextCompletionId ?? null) : null,
        order: option.order ?? index,
      }));
      setOptions(nextOptions);
      setBranchOptionLinkTypeByKey(
        nextOptions.reduce<Record<string, NextLinkType>>((acc, option) => {
          acc[option._key] =
            allowCompletionLink && option.nextCompletionId ? "completion" : "action";
          return acc;
        }, {}),
      );
      setNextLinkType(nextLink ?? "action");
      setNextActionId(nextValues.nextActionId ?? null);
      setNextCompletionId(allowCompletionLink ? (nextValues.nextCompletionId ?? null) : null);
      setErrors({});
    },
    [allowCompletionLink, onActionTypeChange],
  );

  const dirtyComparableString = useMemo(
    () =>
      JSON.stringify(
        buildActionDirtyComparable({
          actionType: selectedActionType,
          values: {
            title,
            description,
            imageUrl,
            imageFileUploadId,
            isRequired,
            hasOther,
            maxSelections,
            options: options.map(option => {
              const { _key, ...rest } = option;
              return rest;
            }),
            nextActionId,
            nextCompletionId,
          },
          nextLinkType,
          allowCompletionLink,
          enableEditorActionMedia,
        }),
      ),
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
      allowCompletionLink,
      nextLinkType,
      nextActionId,
      nextCompletionId,
    ],
  );
  const initialDirtyComparableStringRef = useRef(dirtyComparableString);
  const dirtyBaselineComparableString = useMemo(() => {
    if (!dirtyBaselineValues) {
      return initialDirtyComparableStringRef.current;
    }

    const baselineNextLinkType: "action" | "completion" = dirtyBaselineValues.nextCompletionId
      ? allowCompletionLink
        ? "completion"
        : "action"
      : "action";
    return JSON.stringify(
      buildActionDirtyComparable({
        actionType: initialActionTypeRef.current,
        values: dirtyBaselineValues,
        nextLinkType: baselineNextLinkType,
        allowCompletionLink,
        enableEditorActionMedia,
      }),
    );
  }, [allowCompletionLink, dirtyBaselineValues, enableEditorActionMedia]);
  const isDirty = dirtyComparableString !== dirtyBaselineComparableString;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [onDirtyChange, isDirty]);

  useEffect(() => {
    onValidationStateChange?.(validationIssueCount);
  }, [onValidationStateChange, validationIssueCount]);

  useEffect(() => {
    onRawSnapshotChange?.(getRawSnapshot());
  }, [getRawSnapshot, onRawSnapshotChange]);

  useEffect(() => {
    if (!hasValidationStarted) {
      return;
    }

    runValidation();
  }, [
    description,
    hasLinkTargets,
    hasValidationStarted,
    itemLabel,
    needsOptions,
    nextActionId,
    nextCompletionId,
    nextLinkType,
    optionLimits.min,
    options,
    runValidation,
    title,
    isBranch,
    allowCompletionLink,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      validateAndGetValues: options => buildValidatedValues(options) ?? null,
      validateAndGetSubmission: options => {
        const values = buildValidatedValues(options);
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
      getRawSnapshot,
      applyRawSnapshot,
    }),
    [
      actionImageUpload,
      applyRawSnapshot,
      buildValidatedValues,
      getRawSnapshot,
      isDirty,
      optionImages,
      selectedActionType,
    ],
  );

  const handleSubmit = () => {
    const values = buildValidatedValues();
    if (!values) return;
    onSubmit(values);
  };

  const handleBlurCapture = () => {
    setHasValidationStarted(true);
    runValidation();
  };

  const addOption = () => {
    setOptions(prev => {
      if (prev.length >= optionLimits.max) {
        return prev;
      }

      return [
        ...prev,
        {
          _key: generateOptionKey(),
          title: "",
          description: null,
          imageUrl: null,
          fileUploadId: null,
          order: prev.length,
        },
      ];
    });
  };

  const removeOptionByOptionKey = (optionKey: string) => {
    setOptions(prev => {
      if (prev.length <= optionLimits.min) {
        return prev;
      }

      const target = prev.find(option => option._key === optionKey);
      if (target) {
        optionImages.discard(target._key);
      }

      return removeOptionByKey(prev, optionKey);
    });
  };

  const updateOptionByKey = (
    optionKey: string,
    field: keyof OptionFormItem,
    value: string | null,
  ) => {
    setOptions(prev =>
      patchOptionByKey(prev, optionKey, { [field]: value } as Partial<OptionFormItem>),
    );
  };

  const handleActionImageDelete = () => {
    actionImageUpload.discard();
    setImageUrl(null);
    setImageFileUploadId(null);
  };

  return (
    <div className="flex flex-col gap-5 p-4" onBlurCapture={handleBlurCapture}>
      {!hideTitle && (
        <Typo.SubTitle>
          {editingAction
            ? `${itemLabel} 수정`
            : `${ACTION_TYPE_LABELS[selectedActionType]} ${itemLabel} 추가`}
        </Typo.SubTitle>
      )}

      {enableTypeSelect && (
        <div className="flex flex-col gap-2">
          <LabelText required={false}>{itemLabel} 유형</LabelText>
          <Select
            value={selectedActionType}
            onValueChange={value => handleActionTypeChange(value as ActionType)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`${itemLabel} 유형을 선택하세요`} />
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
        placeholder={`${itemLabel} 제목을 입력해주세요`}
        maxLength={ACTION_TITLE_MAX_LENGTH}
        value={title}
        onChange={e => setTitle(e.target.value)}
        errorMessage={errors.title}
      />

      <Textarea
        label="설명"
        placeholder={`${itemLabel}에 대한 설명을 입력해주세요`}
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
                {itemLabel} 이미지
              </Typo.Body>
              <Typo.Body size="small" className="text-zinc-500">
                {actionImageUpload.isUploading
                  ? "업로드 중..."
                  : `${itemLabel}에 노출할 이미지를 설정합니다. (선택)`}
              </Typo.Body>
            </div>
            <ImageSelector
              size="large"
              imageUrl={actionImageUpload.previewUrl ?? imageUrl ?? undefined}
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
                    onChange={e => updateOptionByKey(option._key, "title", e.target.value)}
                    className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                  />
                  {!isBranch && options.length > optionLimits.min && (
                    <button
                      type="button"
                      onClick={() => removeOptionByOptionKey(option._key)}
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
                      onChange={e => updateOptionByKey(option._key, "description", e.target.value)}
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
                          updateOptionByKey(option._key, "imageUrl", null);
                          updateOptionByKey(option._key, "fileUploadId", null);
                        }}
                        disabled={isLoading || optionImages.isUploading(option._key)}
                      />
                    </div>
                  </div>
                )}

                {isBranch && (
                  <div className="ml-6 flex flex-col gap-2">
                    {hasLinkTargets ? (
                      <NextLinkSelector
                        itemLabel={itemLabel}
                        allowCompletionLink={allowCompletionLink}
                        linkType={
                          branchOptionLinkTypeByKey[option._key] ??
                          (allowCompletionLink && option.nextCompletionId ? "completion" : "action")
                        }
                        actionValue={option.nextActionId ?? null}
                        completionValue={option.nextCompletionId ?? null}
                        selectableActions={selectableActions}
                        completionOptions={completionOptions}
                        onLinkTypeChange={type =>
                          handleBranchOptionLinkTypeChange(option._key, type)
                        }
                        onActionChange={value =>
                          handleBranchOptionNextActionChange(option._key, value)
                        }
                        onCompletionChange={value =>
                          handleBranchOptionNextCompletionChange(option._key, value)
                        }
                      />
                    ) : (
                      <Typo.Body size="small" className="text-zinc-400">
                        {`다른 ${itemLabel}을 먼저 추가해주세요.`}
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
          <LabelText required={allowCompletionLink && hasLinkTargets}>다음 이동 설정</LabelText>

          {!hasLinkTargets ? (
            <Typo.Body size="small" className="text-zinc-400">
              {allowCompletionLink
                ? `다른 ${itemLabel}이나 완료 화면을 먼저 추가한 후 설정할 수 있습니다.`
                : `다른 ${itemLabel}을 먼저 추가한 후 설정할 수 있습니다.`}
            </Typo.Body>
          ) : (
            <>
              <NextLinkSelector
                itemLabel={itemLabel}
                allowCompletionLink={allowCompletionLink}
                linkType={nextLinkType}
                actionValue={nextActionId}
                completionValue={nextCompletionId}
                selectableActions={selectableActions}
                completionOptions={completionOptions}
                onLinkTypeChange={handleNextLinkTypeChange}
                onActionChange={handleNextActionChange}
                onCompletionChange={handleNextCompletionChange}
                errorMessage={errors.nextLink}
              />

              {enforceExclusiveNextLink && allowCompletionLink && (
                <Typo.Body size="small" className="text-zinc-500">
                  {`다음 ${itemLabel}/완료 화면 중 하나만 선택할 수 있습니다.`}
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
