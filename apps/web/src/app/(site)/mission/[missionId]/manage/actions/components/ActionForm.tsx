"use client";

import { CounterSettingRow } from "@/app/(site)/(main)/create/components/CounterSettingRow";
import { getActionTypeLabel } from "@/constants/action";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { useMultipleImages, useSingleImage } from "@/hooks/image";
import { sanitizeTiptapContent } from "@/lib/tiptap/utils";
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
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ActionType, MatchMode } from "@prisma/client";
import {
  Button,
  ImageSelector,
  Input,
  LabelText,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  TiptapEditor,
  Toggle,
  Typo,
  toast,
} from "@repo/ui/components";
import { AlertCircle, Plus, X } from "lucide-react";
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
import { NextLinkDisplay } from "./NextLinkDisplay";
import { NextLinkDrawer } from "./NextLinkDrawer";
import { SortableOptionItem } from "./SortableOptionItem";
import { moveOptionByKey, patchOptionByKey, removeOptionByKey } from "./actionFormOptionUtils";

function getTextLengthFromHtml(html: string): number {
  if (!html) return 0;

  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent?.replace(/\u00a0/g, " ").trim().length || 0;
  }

  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim().length;
}

const UPLOAD_ERROR_MESSAGES = {
  ACTION_IMAGE: "질문 이미지 업로드에 실패했습니다.",
  OPTION_IMAGE: "옵션 이미지 업로드에 실패했습니다.",
} as const;

const ERROR_ICON_CLASS = "text-red-500";

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
  isCorrect?: boolean;
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
  score?: number | null;
  matchMode?: MatchMode | null;
  hint?: string | null;
  explanation?: string | null;
}

export interface ActionFormRawSnapshot {
  actionType: ActionType;
  values: ActionFormValues;
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
  disabledActionIds?: Set<string>;
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
  isQuizMode?: boolean;
  showHintField?: boolean;
  showExplanationField?: boolean;
  onActionTypeChange?: (type: ActionType) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onValidationStateChange?: (issueCount: number) => void;
  onRawSnapshotChange?: (snapshot: ActionFormRawSnapshot) => void;
  onCreateLinkedAction?: () => string;
  onCreateLinkedCompletion?: () => string;
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

const QUIZ_ACTION_TYPES: ActionType[] = [
  ActionType.MULTIPLE_CHOICE,
  ActionType.OX,
  ActionType.SHORT_TEXT,
];

const QUIZ_SHORT_TEXT_MIN_OPTIONS = 1;
const QUIZ_SHORT_TEXT_MAX_OPTIONS = 10;

function getDefaultOptions(type: ActionType, isQuizMode = false): OptionFormItem[] {
  if (type === ActionType.BRANCH) {
    return Array.from({ length: BRANCH_OPTIONS_COUNT }, (_, i) => ({
      _key: generateOptionKey(),
      title: "",
      order: i,
    }));
  }
  if (isQuizMode && type === ActionType.OX) {
    return [
      { _key: generateOptionKey(), title: "O", order: 0 },
      { _key: generateOptionKey(), title: "X", order: 1 },
    ];
  }
  if (isQuizMode && type === ActionType.SHORT_TEXT) {
    return [{ _key: generateOptionKey(), title: "", order: 0 }];
  }
  if (isQuizMode && type === ActionType.MULTIPLE_CHOICE) {
    return Array.from({ length: 4 }, (_, i) => ({
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

function getOptionLimits(type: ActionType, isQuizMode = false): { min: number; max: number } {
  switch (type) {
    case ActionType.MULTIPLE_CHOICE:
      return { min: MULTIPLE_CHOICE_MIN_OPTIONS, max: MULTIPLE_CHOICE_MAX_OPTIONS };
    case ActionType.SCALE:
      return { min: SCALE_MIN_OPTIONS, max: SCALE_MAX_OPTIONS };
    case ActionType.TAG:
      return { min: TAG_MIN_OPTIONS, max: TAG_MAX_OPTIONS };
    case ActionType.BRANCH:
      return { min: BRANCH_OPTIONS_COUNT, max: BRANCH_OPTIONS_COUNT };
    case ActionType.OX:
      return isQuizMode ? { min: 2, max: 2 } : { min: 0, max: 0 };
    case ActionType.SHORT_TEXT:
      return isQuizMode
        ? { min: QUIZ_SHORT_TEXT_MIN_OPTIONS, max: QUIZ_SHORT_TEXT_MAX_OPTIONS }
        : { min: 0, max: 0 };
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
  allowCompletionLink: boolean;
  enableEditorActionMedia: boolean;
  isQuizMode?: boolean;
}) {
  const { actionType, values, allowCompletionLink, enableEditorActionMedia, isQuizMode } = params;
  const quizNeedsOpts = isQuizMode && QUIZ_ACTION_TYPES.includes(actionType);
  const needsOptions = quizNeedsOpts || NEEDS_OPTIONS.includes(actionType);
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
      description: sanitizeTiptapContent(values.description ?? ""),
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
          ...(isQuizMode && {
            isCorrect: actionType === ActionType.SHORT_TEXT ? true : (option.isCorrect ?? false),
          }),
          nextCompletionId: allowCompletionLink ? (option.nextCompletionId ?? null) : null,
          order: index,
        })),
      }),
      ...(!isBranch && {
        nextActionId: values.nextActionId ?? null,
        nextCompletionId: allowCompletionLink ? (values.nextCompletionId ?? null) : null,
      }),
      ...(isQuizMode && {
        score: values.score ?? 10,
        matchMode: values.matchMode ?? null,
        hint: values.hint?.trim() || null,
        explanation: values.explanation?.trim() || null,
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
    disabledActionIds,
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
    isQuizMode = false,
    showHintField = true,
    showExplanationField = false,
    onActionTypeChange,
    onDirtyChange,
    onValidationStateChange,
    onRawSnapshotChange,
    onCreateLinkedAction,
    onCreateLinkedCompletion,
  }: ActionFormProps,
  ref: ForwardedRef<ActionFormHandle>,
) {
  const hasConflictingInitialNextLink = Boolean(
    initialValues?.nextActionId && initialValues?.nextCompletionId,
  );
  const initialHasCompletion = allowCompletionLink && !!initialValues?.nextCompletionId;
  const normalizedInitialNextActionId =
    allowCompletionLink &&
    enforceExclusiveNextLink &&
    hasConflictingInitialNextLink &&
    initialHasCompletion
      ? null
      : (initialValues?.nextActionId ?? null);
  const normalizedInitialNextCompletionId = !allowCompletionLink
    ? null
    : enforceExclusiveNextLink && hasConflictingInitialNextLink && !initialHasCompletion
      ? null
      : (initialValues?.nextCompletionId ?? null);

  const [selectedActionType, setSelectedActionType] = useState(actionType);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initialValues?.imageUrl ?? null);
  const [imageFileUploadId, setImageFileUploadId] = useState<string | null>(
    initialValues?.imageFileUploadId ?? null,
  );
  const [isRequired, setIsRequired] = useState(
    isQuizMode ? true : (initialValues?.isRequired ?? true),
  );
  const [hasOther, setHasOther] = useState(initialValues?.hasOther ?? false);
  const [maxSelections, setMaxSelections] = useState(initialValues?.maxSelections ?? 1);
  const [options, setOptions] = useState<OptionFormItem[]>(() => {
    if (initialValues?.options) {
      return initialValues.options.map(o => ({
        ...o,
        _key: generateOptionKey(),
        nextCompletionId: allowCompletionLink ? (o.nextCompletionId ?? null) : null,
      }));
    }
    const quizNeedsOpts = isQuizMode && QUIZ_ACTION_TYPES.includes(actionType);
    return quizNeedsOpts || NEEDS_OPTIONS.includes(actionType)
      ? getDefaultOptions(actionType, isQuizMode)
      : [];
  });
  const [nextActionId, setNextActionId] = useState<string | null>(normalizedInitialNextActionId);
  const [nextCompletionId, setNextCompletionId] = useState<string | null>(
    normalizedInitialNextCompletionId,
  );
  const [score, setScore] = useState<number>(initialValues?.score ?? 10);
  const [matchMode, setMatchMode] = useState<MatchMode | null>(initialValues?.matchMode ?? null);
  const [hint, setHint] = useState(initialValues?.hint ?? "");
  const [explanation, setExplanation] = useState(initialValues?.explanation ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasValidationStarted, setHasValidationStarted] = useState(false);
  const [validationIssueCount, setValidationIssueCount] = useState(0);
  const initialActionTypeRef = useRef(actionType);

  const enableEditorActionMedia = enforceExclusiveNextLink;
  const descriptionTextLength = useMemo(() => getTextLengthFromHtml(description), [description]);
  const itemLabel = wordingMode === "question" ? "질문" : "액션";
  const quizNeedsOptions = isQuizMode && QUIZ_ACTION_TYPES.includes(selectedActionType);
  const needsOptions = quizNeedsOptions || NEEDS_OPTIONS.includes(selectedActionType);
  const needsMaxSelections = NEEDS_MAX_SELECTIONS.includes(selectedActionType);
  const isBranch = selectedActionType === ActionType.BRANCH;
  const optionLimits = getOptionLimits(selectedActionType, isQuizMode);
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
  const hasCreateCallbacks = Boolean(onCreateLinkedAction || onCreateLinkedCompletion);
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
    onUploadError: error => {
      toast({
        message: error.message || UPLOAD_ERROR_MESSAGES.ACTION_IMAGE,
        icon: AlertCircle,
        iconClassName: ERROR_ICON_CLASS,
      });
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
    onUploadError: (_optionKey, error) => {
      toast({
        message: error.message || UPLOAD_ERROR_MESSAGES.OPTION_IMAGE,
        icon: AlertCircle,
        iconClassName: ERROR_ICON_CLASS,
      });
    },
  });

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
    const quizNeedsOpts = isQuizMode && QUIZ_ACTION_TYPES.includes(nextType);
    setOptions(
      quizNeedsOpts || NEEDS_OPTIONS.includes(nextType)
        ? getDefaultOptions(nextType, isQuizMode)
        : [],
    );
    setNextActionId(null);
    setNextCompletionId(null);
    if (isQuizMode) setMatchMode(null);
    setErrors({});
    onActionTypeChange?.(nextType);
  };

  const handleNextActionChange = (value: string | null) => {
    setNextActionId(value);
    if (enforceExclusiveNextLink && value) {
      setNextCompletionId(null);
    }
  };

  const handleNextCompletionChange = (value: string | null) => {
    if (!allowCompletionLink) return;
    setNextCompletionId(value);
    if (enforceExclusiveNextLink && value) {
      setNextActionId(null);
    }
  };

  const handleBranchOptionNextActionChange = (optionKey: string, value: string | null) => {
    setOptions(prev =>
      patchOptionByKey(prev, optionKey, {
        nextActionId: value,
        nextCompletionId: null,
      }),
    );
  };

  const handleBranchOptionNextCompletionChange = (optionKey: string, value: string | null) => {
    if (!allowCompletionLink) return;
    setOptions(prev =>
      patchOptionByKey(prev, optionKey, {
        nextActionId: null,
        nextCompletionId: value,
      }),
    );
  };

  const handleCreateNextAction = useCallback(() => {
    if (!onCreateLinkedAction) return;
    const id = onCreateLinkedAction();
    setNextActionId(id);
    if (enforceExclusiveNextLink) setNextCompletionId(null);
  }, [onCreateLinkedAction, enforceExclusiveNextLink]);

  const handleCreateNextCompletion = useCallback(() => {
    if (!onCreateLinkedCompletion) return;
    const id = onCreateLinkedCompletion();
    setNextCompletionId(id);
    if (enforceExclusiveNextLink) setNextActionId(null);
  }, [onCreateLinkedCompletion, enforceExclusiveNextLink]);

  const handleBranchCreateNextAction = useCallback(
    (optionKey: string) => {
      if (!onCreateLinkedAction) return;
      const id = onCreateLinkedAction();
      setOptions(prev =>
        patchOptionByKey(prev, optionKey, {
          nextActionId: id,
          nextCompletionId: null,
        }),
      );
    },
    [onCreateLinkedAction],
  );

  const handleBranchCreateNextCompletion = useCallback(
    (optionKey: string) => {
      if (!onCreateLinkedCompletion || !allowCompletionLink) return;
      const id = onCreateLinkedCompletion();
      setOptions(prev =>
        patchOptionByKey(prev, optionKey, {
          nextActionId: null,
          nextCompletionId: id,
        }),
      );
    },
    [onCreateLinkedCompletion, allowCompletionLink],
  );

  const [drawerOpenKey, setDrawerOpenKey] = useState<string | null>(null);
  const MAIN_DRAWER_KEY = "__main__";

  const handleDeleteNextLink = useCallback(() => {
    setNextActionId(null);
    setNextCompletionId(null);
  }, []);

  const handleDeleteBranchOptionNextLink = useCallback((optionKey: string) => {
    setOptions(prev =>
      patchOptionByKey(prev, optionKey, {
        nextActionId: null,
        nextCompletionId: null,
      }),
    );
  }, []);

  const activeDrawerOption =
    drawerOpenKey && drawerOpenKey !== MAIN_DRAWER_KEY
      ? (options.find(o => o._key === drawerOpenKey) ?? null)
      : null;

  const buildValidationErrors = useCallback((): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    } else if (title.length > ACTION_TITLE_MAX_LENGTH) {
      newErrors.title = `제목은 ${ACTION_TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`;
    }

    if (descriptionTextLength > ACTION_DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `설명은 ${ACTION_DESCRIPTION_MAX_LENGTH}자를 초과할 수 없습니다.`;
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

    if (isQuizMode && needsOptions && selectedActionType !== ActionType.SHORT_TEXT) {
      const hasCorrectAnswer = options.some(o => o.isCorrect);
      if (!hasCorrectAnswer) {
        newErrors.correctAnswer = "정답을 1개 이상 선택해주세요.";
      }
    }

    if (!isQuizMode && hasLinkTargets) {
      if (isBranch) {
        const missingBranchNext =
          allowCompletionLink && options.some(o => !o.nextActionId && !o.nextCompletionId);
        if (allowCompletionLink && missingBranchNext) {
          newErrors.branchNextAction = "모든 분기 옵션의 다음 이동을 설정해주세요.";
        }
      } else {
        if (allowCompletionLink && !nextActionId && !nextCompletionId) {
          newErrors.nextLink = `다음 이동할 ${itemLabel} 또는 완료 화면을 선택해주세요.`;
        }
      }
    }

    return newErrors;
  }, [
    title,
    descriptionTextLength,
    needsOptions,
    options,
    optionLimits.min,
    isQuizMode,
    selectedActionType,
    isBranch,
    allowCompletionLink,
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
      setHasValidationStarted(true);
      const validationResult = runValidation({ showErrors });
      if (!validationResult.isValid) {
        return null;
      }

      return {
        title: title.trim(),
        description: sanitizeTiptapContent(description ?? ""),
        imageUrl,
        imageFileUploadId,
        isRequired,
        ...(needsMaxSelections && { maxSelections }),
        ...(!isQuizMode && selectedActionType === ActionType.MULTIPLE_CHOICE && { hasOther }),
        ...(!isQuizMode && selectedActionType === ActionType.TAG && { hasOther }),
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
              ...(isQuizMode && {
                isCorrect:
                  selectedActionType === ActionType.SHORT_TEXT ? true : (o.isCorrect ?? false),
              }),
              order: i,
            };
          }),
        }),
        ...(!isBranch && {
          nextActionId: nextActionId ?? null,
          nextCompletionId: allowCompletionLink ? (nextCompletionId ?? null) : null,
        }),
        ...(isQuizMode && {
          score,
          matchMode:
            selectedActionType === ActionType.SHORT_TEXT ? (matchMode ?? MatchMode.EXACT) : null,
          hint: hint.trim() || null,
          explanation: explanation.trim() || null,
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
      nextActionId,
      nextCompletionId,
      isQuizMode,
      score,
      matchMode,
      hint,
      explanation,
    ],
  );

  const getRawSnapshot = useCallback((): ActionFormRawSnapshot => {
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
            ...(isQuizMode && { isCorrect: rest.isCorrect ?? false }),
            nextActionId: rest.nextActionId ?? null,
            nextCompletionId: allowCompletionLink ? (rest.nextCompletionId ?? null) : null,
          };
        }),
      }),
      ...(!isBranch && {
        nextActionId: nextActionId ?? null,
        nextCompletionId: allowCompletionLink ? (nextCompletionId ?? null) : null,
      }),
      ...(isBranch && { nextActionId: null, nextCompletionId: null }),
      ...(isQuizMode && {
        score,
        matchMode,
        hint: hint || null,
        explanation: explanation || null,
      }),
    };

    return {
      actionType: selectedActionType,
      values: rawValues,
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
    options,
    selectedActionType,
    title,
    maxSelections,
    isQuizMode,
    score,
    matchMode,
    hint,
    explanation,
  ]);

  const applyRawSnapshot = useCallback(
    (snapshot: ActionFormRawSnapshot) => {
      const nextType = snapshot.actionType;
      const nextValues = snapshot.values;

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
        isCorrect: option.isCorrect ?? false,
        nextActionId: option.nextActionId ?? null,
        nextCompletionId: allowCompletionLink ? (option.nextCompletionId ?? null) : null,
        order: option.order ?? index,
      }));
      setOptions(nextOptions);
      setNextActionId(nextValues.nextActionId ?? null);
      setNextCompletionId(allowCompletionLink ? (nextValues.nextCompletionId ?? null) : null);
      setScore(nextValues.score ?? 10);
      setMatchMode(nextValues.matchMode ?? null);
      setHint(nextValues.hint ?? "");
      setExplanation(nextValues.explanation ?? "");
      setErrors({});
    },
    [allowCompletionLink, onActionTypeChange],
  );

  const dirtyComparableString = useMemo(
    () =>
      JSON.stringify(
        buildActionDirtyComparable({
          actionType: selectedActionType,
          isQuizMode,
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
            ...(isQuizMode && { score, matchMode, hint, explanation }),
          },
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
      nextActionId,
      nextCompletionId,
      isQuizMode,
      score,
      matchMode,
      hint,
      explanation,
    ],
  );
  const initialDirtyComparableStringRef = useRef(dirtyComparableString);
  const dirtyBaselineComparableString = useMemo(() => {
    if (!dirtyBaselineValues) {
      return initialDirtyComparableStringRef.current;
    }

    return JSON.stringify(
      buildActionDirtyComparable({
        actionType: initialActionTypeRef.current,
        values: dirtyBaselineValues,
        allowCompletionLink,
        enableEditorActionMedia,
        isQuizMode,
      }),
    );
  }, [allowCompletionLink, dirtyBaselineValues, enableEditorActionMedia, isQuizMode]);
  const isDirty = dirtyComparableString !== dirtyBaselineComparableString;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [onDirtyChange, isDirty]);

  useEffect(() => {
    onValidationStateChange?.(validationIssueCount);
  }, [onValidationStateChange, validationIssueCount]);

  useEffect(() => {
    if (!onRawSnapshotChange) return;
    const id = window.setTimeout(() => {
      onRawSnapshotChange(getRawSnapshot());
    }, 300);
    return () => window.clearTimeout(id);
  }, [getRawSnapshot, onRawSnapshotChange]);

  useEffect(() => {
    runValidation({ showErrors: hasValidationStarted });
  }, [hasValidationStarted, runValidation]);

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

  const handleOptionIsCorrectChange = (optionKey: string, checked: boolean) => {
    if (isQuizMode) {
      setHasValidationStarted(true);
    }

    if (isQuizMode && selectedActionType === ActionType.OX) {
      setOptions(prev =>
        prev.map(opt => ({
          ...opt,
          isCorrect: opt._key === optionKey ? checked : false,
        })),
      );
    } else if (isQuizMode && selectedActionType === ActionType.MULTIPLE_CHOICE) {
      if (checked) {
        const correctCount = options.filter(o => o.isCorrect).length;
        if (correctCount >= maxSelections) return;
      }
      setOptions(prev => patchOptionByKey(prev, optionKey, { isCorrect: checked }));
    } else {
      setOptions(prev => patchOptionByKey(prev, optionKey, { isCorrect: checked }));
    }
  };

  const handleMaxSelectionsChange = (value: number) => {
    setMaxSelections(value);
    if (isQuizMode) {
      setOptions(prev => {
        let correctCount = 0;
        return prev.map(opt => {
          if (opt.isCorrect) {
            correctCount++;
            if (correctCount > value) {
              return { ...opt, isCorrect: false };
            }
          }
          return opt;
        });
      });
    }
  };

  const [openOptionKey, setOpenOptionKey] = useState<string | null>(null);

  const handleMoveOption = useCallback((optionKey: string, direction: "up" | "down") => {
    setOptions(prev => moveOptionByKey(prev, optionKey, direction));
  }, []);

  const handleOptionDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOptions(prev => {
      const oldIndex = prev.findIndex(o => o._key === active.id);
      const newIndex = prev.findIndex(o => o._key === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const optionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div className="flex flex-col gap-5 p-4" onBlurCapture={handleBlurCapture}>
      {!hideTitle && (
        <Typo.SubTitle>
          {editingAction
            ? `${itemLabel} 수정`
            : `${getActionTypeLabel(selectedActionType, isQuizMode)} ${itemLabel} 추가`}
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
              {(isQuizMode ? QUIZ_ACTION_TYPES : ACTION_TYPE_VALUES).map(type => (
                <SelectItem key={type} value={type}>
                  {getActionTypeLabel(type, isQuizMode)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div data-field-error={errors.title ? "title" : undefined}>
        <Input
          label="제목"
          required
          placeholder={`${itemLabel} 제목을 입력해주세요`}
          maxLength={ACTION_TITLE_MAX_LENGTH}
          value={title}
          onChange={e => setTitle(e.target.value)}
          errorMessage={errors.title}
        />
      </div>

      <div
        className="flex flex-col gap-2"
        data-field-error={errors.description ? "description" : undefined}
      >
        <div className="flex items-center justify-between">
          <LabelText required={false}>설명</LabelText>
          <Typo.Body
            size="small"
            className={
              descriptionTextLength > ACTION_DESCRIPTION_MAX_LENGTH
                ? "text-red-500"
                : "text-zinc-400"
            }
          >
            {descriptionTextLength}/{ACTION_DESCRIPTION_MAX_LENGTH}
          </Typo.Body>
        </div>
        <TiptapEditor
          content={description ?? ""}
          onUpdate={content => setDescription(content)}
          placeholder={`${itemLabel}에 대한 설명을 입력해주세요`}
          showToolbar
          className={`min-h-[220px] rounded-sm bg-white ring-1 ${errors.description ? "ring-red-500" : "ring-zinc-200"} focus-within:ring-violet-500`}
        />
        {errors.description ? (
          <Typo.Body size="small" className="text-red-500">
            {errors.description}
          </Typo.Body>
        ) : null}
      </div>

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

      {!isQuizMode && (
        <div className="flex items-center justify-between">
          <LabelText required={false}>필수 응답</LabelText>
          <Toggle checked={isRequired} onCheckedChange={setIsRequired} />
        </div>
      )}

      {needsMaxSelections && !isBranch && (
        <CounterSettingRow
          label={isQuizMode ? "정답 수" : "최대 선택 수"}
          description={
            isQuizMode
              ? "정답으로 인정할 선택지 개수를 설정합니다."
              : "사용자가 선택할 수 있는 최대 개수를 설정합니다."
          }
          value={maxSelections}
          onChange={handleMaxSelectionsChange}
          min={1}
          max={isQuizMode ? 2 : needsOptions ? options.length : 10}
        />
      )}

      {!isQuizMode &&
        (selectedActionType === ActionType.MULTIPLE_CHOICE ||
          selectedActionType === ActionType.TAG) && (
          <div className="flex items-center justify-between">
            <LabelText required={false}>기타 옵션 허용</LabelText>
            <Toggle checked={hasOther} onCheckedChange={setHasOther} />
          </div>
        )}

      {needsOptions && isQuizMode && selectedActionType === ActionType.OX && (
        <div
          className="flex flex-col gap-3"
          data-field-error={errors.correctAnswer ? "correctAnswer" : undefined}
        >
          <LabelText required>항목</LabelText>
          {options.map(option => (
            <div
              key={option._key}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-4"
            >
              <div className="flex items-center justify-between">
                <Typo.Body size="medium" className="font-semibold text-zinc-800">
                  {option.title}
                </Typo.Body>
                <div className="flex items-center gap-2">
                  <LabelText required={false}>정답</LabelText>
                  <Toggle
                    checked={option.isCorrect ?? false}
                    onCheckedChange={checked => handleOptionIsCorrectChange(option._key, checked)}
                  />
                </div>
              </div>
              <Textarea
                placeholder="설명 (선택)"
                maxLength={ACTION_OPTION_DESCRIPTION_MAX_LENGTH}
                rows={2}
                value={option.description ?? ""}
                onChange={e => updateOptionByKey(option._key, "description", e.target.value)}
              />
            </div>
          ))}
          {errors.correctAnswer && (
            <Typo.Body size="small" className="text-red-500">
              {errors.correctAnswer}
            </Typo.Body>
          )}
        </div>
      )}

      {needsOptions && isQuizMode && selectedActionType === ActionType.SHORT_TEXT && (
        <div
          className="flex flex-col gap-3"
          data-field-error={errors.options ? "options" : undefined}
        >
          <LabelText required>{`정답 목록 (${options.length}/${optionLimits.max})`}</LabelText>
          <Typo.Body size="medium" className="text-zinc-400">
            허용할 정답 텍스트를 입력합니다. 참여자의 답변이 이 중 하나와 일치하면 정답으로
            처리됩니다.
          </Typo.Body>
          {options.map((option, index) => (
            <div key={option._key} className="flex items-center gap-2">
              <Input
                containerClassName="flex-1"
                placeholder={`정답 ${index + 1}`}
                value={option.title}
                onChange={e => updateOptionByKey(option._key, "title", e.target.value)}
                maxLength={ACTION_OPTION_TITLE_MAX_LENGTH}
              />
              {options.length > optionLimits.min && (
                <button
                  type="button"
                  onClick={() => removeOptionByOptionKey(option._key)}
                  className="shrink-0 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                  aria-label="정답 삭제"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
          {options.length < optionLimits.max && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 py-2.5 text-sm text-zinc-500 transition-colors hover:border-violet-400 hover:text-violet-500"
            >
              <Plus className="size-4" />
              정답 추가
            </button>
          )}
          {errors.options && (
            <Typo.Body size="small" className="text-red-500">
              {errors.options}
            </Typo.Body>
          )}
        </div>
      )}

      {needsOptions &&
        !(
          isQuizMode &&
          (selectedActionType === ActionType.OX || selectedActionType === ActionType.SHORT_TEXT)
        ) && (
          <div
            className="flex flex-col gap-3"
            data-field-error={
              errors.options || errors.correctAnswer || errors.branchNextAction
                ? "options"
                : undefined
            }
          >
            <LabelText required>{`항목 (${options.length}/${optionLimits.max})`}</LabelText>
            <DndContext
              sensors={optionSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleOptionDragEnd}
            >
              <SortableContext
                items={options.map(o => o._key)}
                strategy={verticalListSortingStrategy}
              >
                {(() => {
                  const correctCount = options.filter(o => o.isCorrect).length;
                  const isCorrectLimitReached =
                    isQuizMode &&
                    selectedActionType === ActionType.MULTIPLE_CHOICE &&
                    correctCount >= maxSelections;

                  return options.map((option, index) => {
                    const optionPreviewUrl = showOptionImage
                      ? (optionImages.getPreviewUrl(option._key) ?? option.imageUrl ?? undefined)
                      : undefined;

                    return (
                      <SortableOptionItem
                        key={option._key}
                        optionKey={option._key}
                        index={index}
                        title={option.title}
                        description={option.description ?? null}
                        previewImageUrl={optionPreviewUrl}
                        isOpen={openOptionKey === option._key}
                        isFirst={index === 0}
                        isLast={index === options.length - 1}
                        showDescription={showOptionDescription}
                        showImage={showOptionImage}
                        showDelete={!isBranch && options.length > optionLimits.min}
                        showIsCorrect={isQuizMode && selectedActionType !== ActionType.SHORT_TEXT}
                        isCorrect={option.isCorrect ?? false}
                        isCorrectDisabled={isCorrectLimitReached && !option.isCorrect}
                        disabled={isLoading}
                        isImageUploading={optionImages.isUploading(option._key)}
                        titleMaxLength={ACTION_OPTION_TITLE_MAX_LENGTH}
                        descriptionMaxLength={ACTION_OPTION_DESCRIPTION_MAX_LENGTH}
                        onToggle={() =>
                          setOpenOptionKey(prev => (prev === option._key ? null : option._key))
                        }
                        onTitleChange={value => updateOptionByKey(option._key, "title", value)}
                        onDescriptionChange={value =>
                          updateOptionByKey(option._key, "description", value)
                        }
                        onIsCorrectChange={checked =>
                          handleOptionIsCorrectChange(option._key, checked)
                        }
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
                        onDelete={() => removeOptionByOptionKey(option._key)}
                        onMoveUp={() => handleMoveOption(option._key, "up")}
                        onMoveDown={() => handleMoveOption(option._key, "down")}
                        branchSlot={
                          !isQuizMode && isBranch && (hasLinkTargets || hasCreateCallbacks) ? (
                            <div className="flex flex-col gap-2">
                              <LabelText required={allowCompletionLink}>다음 이동</LabelText>
                              <NextLinkDisplay
                                itemLabel={itemLabel}
                                nextActionId={option.nextActionId ?? null}
                                nextCompletionId={option.nextCompletionId ?? null}
                                selectableActions={selectableActions}
                                completionOptions={completionOptions}
                                onAdd={() => setDrawerOpenKey(option._key)}
                                onEdit={() => setDrawerOpenKey(option._key)}
                                onDelete={() => handleDeleteBranchOptionNextLink(option._key)}
                              />
                            </div>
                          ) : undefined
                        }
                      />
                    );
                  });
                })()}
              </SortableContext>
            </DndContext>

            {errors.options && (
              <Typo.Body size="small" className="text-red-500">
                {errors.options}
              </Typo.Body>
            )}
            {errors.correctAnswer && (
              <Typo.Body size="small" className="text-red-500">
                {errors.correctAnswer}
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

      {isQuizMode && (
        <>
          <CounterSettingRow
            label="배점"
            description="이 질문의 배점을 설정합니다. 기본값은 10점입니다."
            value={score}
            onChange={setScore}
            min={0}
            max={100}
          />

          {selectedActionType === ActionType.SHORT_TEXT && (
            <div className="flex flex-col gap-2">
              <LabelText required={false}>매칭 모드</LabelText>
              <Typo.Body size="medium" className="text-zinc-400">
                정답 비교 방식을 선택합니다.
              </Typo.Body>
              <Select
                value={matchMode ?? MatchMode.EXACT}
                onValueChange={value => setMatchMode(value as MatchMode)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="매칭 모드를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MatchMode.EXACT}>완전 일치</SelectItem>
                  <SelectItem value={MatchMode.CONTAINS}>포함</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showHintField && (
            <div className="flex flex-col gap-2">
              <LabelText required={false}>힌트</LabelText>
              <Typo.Body size="medium" className="text-zinc-400">
                참여자에게 표시할 힌트를 입력합니다.
              </Typo.Body>
              <Input
                placeholder="힌트를 입력하세요 (선택)"
                value={hint}
                onChange={e => setHint(e.target.value)}
              />
            </div>
          )}

          {showExplanationField && (
            <div className="flex flex-col gap-2">
              <LabelText required={false}>정답 설명</LabelText>
              <Typo.Body size="medium" className="text-zinc-400">
                오답 시 표시할 정답에 대한 설명을 입력합니다.
              </Typo.Body>
              <Textarea
                placeholder="정답 설명을 입력하세요 (선택)"
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </>
      )}

      {!isQuizMode && !isBranch && (hasLinkTargets || hasCreateCallbacks) && (
        <div
          className="flex flex-col gap-3 rounded-lg border border-violet-100 bg-violet-50/50 p-4"
          data-field-error={errors.nextLink ? "nextLink" : undefined}
        >
          <LabelText required={allowCompletionLink && hasLinkTargets}>다음 이동 설정</LabelText>

          <NextLinkDisplay
            itemLabel={itemLabel}
            nextActionId={nextActionId}
            nextCompletionId={nextCompletionId}
            selectableActions={selectableActions}
            completionOptions={completionOptions}
            onAdd={() => setDrawerOpenKey(MAIN_DRAWER_KEY)}
            onEdit={() => setDrawerOpenKey(MAIN_DRAWER_KEY)}
            onDelete={handleDeleteNextLink}
            errorMessage={errors.nextLink}
          />
        </div>
      )}

      <NextLinkDrawer
        isOpen={drawerOpenKey !== null}
        onClose={() => setDrawerOpenKey(null)}
        itemLabel={itemLabel}
        allowCompletionLink={allowCompletionLink}
        actionValue={activeDrawerOption ? (activeDrawerOption.nextActionId ?? null) : nextActionId}
        completionValue={
          activeDrawerOption ? (activeDrawerOption.nextCompletionId ?? null) : nextCompletionId
        }
        selectableActions={selectableActions}
        disabledActionIds={disabledActionIds}
        completionOptions={completionOptions}
        onActionSelect={id => {
          if (activeDrawerOption) {
            handleBranchOptionNextActionChange(activeDrawerOption._key, id);
          } else {
            handleNextActionChange(id);
          }
        }}
        onCompletionSelect={id => {
          if (activeDrawerOption) {
            handleBranchOptionNextCompletionChange(activeDrawerOption._key, id);
          } else {
            handleNextCompletionChange(id);
          }
        }}
        onCreateAction={
          onCreateLinkedAction
            ? activeDrawerOption
              ? () => handleBranchCreateNextAction(activeDrawerOption._key)
              : handleCreateNextAction
            : undefined
        }
        onCreateCompletion={
          onCreateLinkedCompletion
            ? activeDrawerOption
              ? () => handleBranchCreateNextCompletion(activeDrawerOption._key)
              : handleCreateNextCompletion
            : undefined
        }
      />

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
