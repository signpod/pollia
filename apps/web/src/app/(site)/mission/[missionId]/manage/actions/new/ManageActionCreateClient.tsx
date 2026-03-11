"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { updateMission } from "@/actions/mission/update";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { useReadActionsDetail } from "@/hooks/action";
import { ActionType } from "@prisma/client";
import { Typo, toast } from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ActionForm, type ActionFormValues } from "../components/ActionForm";
import { ActionTypeSelector } from "../components/ActionTypeSelector";
import {
  useManageConnectAction,
  useManageConnectBranchOption,
  useManageCreateAction,
} from "../hooks";
import { type ConnectionIntent, mapCreateActionInput } from "../logic";

interface ManageActionCreateClientProps {
  missionId: string;
}

const ACTION_TYPE_VALUES = new Set<string>(Object.values(ActionType));

function parseActionType(value: string | null): ActionType | null {
  if (!value || !ACTION_TYPE_VALUES.has(value)) {
    return null;
  }
  return value as ActionType;
}

function parseConnectionIntent(searchParams: URLSearchParams): ConnectionIntent {
  const connectKind = searchParams.get("connectKind");
  const sourceActionId = searchParams.get("sourceActionId");
  const sourceOptionId = searchParams.get("sourceOptionId");

  if (connectKind === "action" && sourceActionId) {
    return { kind: "action", sourceActionId };
  }

  if (connectKind === "branch-option" && sourceActionId && sourceOptionId) {
    return {
      kind: "branch-option",
      sourceActionId,
      sourceOptionId,
    };
  }

  return null;
}

export function ManageActionCreateClient({ missionId }: ManageActionCreateClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();
  const searchParams = useMemo(
    () => new URLSearchParams(rawSearchParams.toString()),
    [rawSearchParams],
  );
  const selectedType = useMemo(() => parseActionType(searchParams.get("type")), [searchParams]);
  const connectionIntent = useMemo(() => parseConnectionIntent(searchParams), [searchParams]);
  const listRoute = ROUTES.MISSION_MANAGE_ACTIONS(missionId);
  const [direction, setDirection] = useState<1 | -1>(1);

  const { data: actionsData, isLoading: actionsLoading } = useReadActionsDetail(missionId);

  const { data: completionsData } = useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getCompletionsByMissionId(missionId),
    staleTime: 5 * 60 * 1000,
  });

  const actions = useMemo(() => {
    const list = actionsData?.data ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [actionsData]);

  const completionOptions = useMemo(
    () =>
      (completionsData?.data ?? []).map(c => ({
        id: c.id,
        title: c.title ?? "완료 화면",
      })),
    [completionsData],
  );

  const createAction = useManageCreateAction();
  const connectAction = useManageConnectAction();
  const connectBranchOption = useManageConnectBranchOption();

  const isSubmitting =
    createAction.isPending || connectAction.isPending || connectBranchOption.isPending;

  const handleSelectType = (type: ActionType) => {
    setDirection(1);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("type", type);
    router.replace(`${pathname}?${nextParams.toString()}`);
  };

  const handleBack = () => {
    if (selectedType) {
      setDirection(-1);
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("type");
      const queryString = nextParams.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
      return;
    }
    router.push(listRoute);
  };

  const handleCreate = async (values: ActionFormValues) => {
    if (!selectedType) return;

    try {
      const result = await createAction.mutateAsync(
        mapCreateActionInput({
          missionId,
          selectedType,
          values,
          order: actions.length,
        }),
      );

      const createdActionId = result?.data?.id;

      if (actions.length === 0 && createdActionId) {
        try {
          await updateMission(missionId, { entryActionId: createdActionId });
        } catch {
          toast({
            message: "시작 액션 설정 중 오류가 발생했습니다.",
            icon: AlertCircle,
            iconClassName: "text-red-500",
          });
        }
      }

      let isConnectionFailed = false;
      if (connectionIntent && createdActionId) {
        try {
          if (connectionIntent.kind === "action") {
            await connectAction.mutateAsync({
              sourceActionId: connectionIntent.sourceActionId,
              targetId: createdActionId,
              isCompletion: false,
              missionId,
            });
          } else {
            await connectBranchOption.mutateAsync({
              actionId: connectionIntent.sourceActionId,
              optionId: connectionIntent.sourceOptionId,
              targetId: createdActionId,
              isCompletion: false,
              missionId,
            });
          }
        } catch {
          isConnectionFailed = true;
        }
      }

      toast({
        message: isConnectionFailed
          ? "액션은 추가되었지만 연결에는 실패했습니다."
          : "액션이 추가되었습니다.",
        ...(isConnectionFailed && {
          icon: AlertCircle,
          iconClassName: "text-red-500",
        }),
      });
      router.replace(listRoute);
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "액션 추가에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    }
  };

  const screenTitle = selectedType
    ? connectionIntent
      ? "연결할 액션 만들기"
      : "새 액션"
    : connectionIntent
      ? "연결할 액션 유형 선택"
      : "액션 유형 선택";

  return (
    <div className="flex-1 bg-zinc-50">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
        <button type="button" onClick={handleBack} className="p-1">
          <ChevronLeft className="size-6" />
        </button>
        <Typo.SubTitle>{screenTitle}</Typo.SubTitle>
      </header>

      <div className="relative overflow-hidden pb-6">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={selectedType ? `create-form-${selectedType}` : "create-type-selector"}
            custom={direction}
            initial={{ x: direction > 0 ? "24%" : "-24%", opacity: 0.7 }}
            animate={{
              x: "0%",
              opacity: 1,
              transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
            }}
            exit={{
              x: direction > 0 ? "-20%" : "20%",
              opacity: 0.7,
              transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
            }}
            className="will-change-transform"
          >
            {selectedType ? (
              <ActionForm
                key={`create-${selectedType}`}
                actionType={selectedType}
                allActions={actions}
                completionOptions={completionOptions}
                isLoading={isSubmitting || actionsLoading}
                onSubmit={handleCreate}
                onCancel={handleBack}
              />
            ) : (
              <ActionTypeSelector onSelect={handleSelectType} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
