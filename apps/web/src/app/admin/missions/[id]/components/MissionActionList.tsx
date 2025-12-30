"use client";

import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Separator } from "@/app/admin/components/shadcn-ui/separator";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { useReadActionsDetail } from "@/app/admin/hooks/use-read-actions-detail";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import type { ActionDetail } from "@/types/dto";
import { ActionType } from "@prisma/client";
import {
  AlertCircle,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  ImageIcon,
  Scale,
  Star,
  Tag,
  TextCursor,
} from "lucide-react";
import Image from "next/image";
import { ClientDateDisplay } from "./ClientDateDisplay";

interface MissionActionListProps {
  missionId: string;
}

const SKELETON_LOADING_COUNT = 3;

/**
 * 0-based order를 1-based 표시용 번호로 변환
 */
const getDisplayOrder = (order: number) => order + 1;

function getActionTypeInfo(type: ActionType) {
  const label = ACTION_TYPE_LABELS[type] || "기타";

  switch (type) {
    case ActionType.MULTIPLE_CHOICE:
      return {
        label,
        icon: CheckSquare,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950",
      };
    case ActionType.SCALE:
      return {
        label,
        icon: Scale,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-50 dark:bg-purple-950",
      };
    case ActionType.SUBJECTIVE:
      return {
        label,
        icon: TextCursor,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-950",
      };
    case ActionType.IMAGE:
      return {
        label,
        icon: ImageIcon,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-950",
      };
    case ActionType.RATING:
      return {
        label,
        icon: Star,
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-50 dark:bg-yellow-950",
      };
    case ActionType.TAG:
      return {
        label,
        icon: Tag,
        color: "text-pink-600 dark:text-pink-400",
        bgColor: "bg-pink-50 dark:bg-pink-950",
      };
    case ActionType.DATE:
      return {
        label,
        icon: Calendar,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-50 dark:bg-cyan-950",
      };
    case ActionType.TIME:
      return {
        label,
        icon: Clock,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-50 dark:bg-indigo-950",
      };
    default:
      return {
        label,
        icon: FileText,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-950",
      };
  }
}

function ActionCard({ action }: { action: ActionDetail }) {
  const typeInfo = getActionTypeInfo(action.type);
  const TypeIcon = typeInfo.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="shrink-0">
                액션 {getDisplayOrder(action.order)}
              </Badge>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${typeInfo.bgColor}`}>
                <TypeIcon className={`h-3.5 w-3.5 ${typeInfo.color}`} />
                <span className={`text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
              </div>
              <Badge
                variant={action.isRequired ? "destructive" : "outline"}
                className={
                  action.isRequired
                    ? "shrink-0 text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 dark:bg-orange-950 dark:text-orange-300"
                    : "shrink-0 text-xs font-medium text-muted-foreground border-muted-foreground/30"
                }
              >
                {action.isRequired ? "필수" : "선택"}
              </Badge>
              {action.maxSelections && (
                <Badge variant="secondary" className="shrink-0">
                  최대 {action.maxSelections}개 선택
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{action.title}</CardTitle>
            {action.description && (
              <CardDescription className="mt-2">{action.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {action.imageUrl && (
            <div className="shrink-0">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">액션 이미지</h4>
              <div className="relative w-full lg:w-80 aspect-350/233 rounded-lg overflow-hidden border bg-muted/20">
                <Image
                  src={action.imageUrl}
                  alt={action.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 320px"
                />
              </div>
            </div>
          )}

          {action.options.length > 0 && (
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                옵션 목록 ({action.options.length}개)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                {action.options
                  .sort((a, b) => a.order - b.order)
                  .map(option => (
                    <div
                      key={option.id}
                      className="p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {getDisplayOrder(option.order)}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm mb-1 wrap-break-word">
                            {option.title}
                          </h5>
                          {option.description && (
                            <p className="text-xs text-muted-foreground wrap-break-words">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {option.imageUrl && (
                        <div className="relative w-full aspect-square rounded-md overflow-hidden border bg-muted/20">
                          <Image
                            src={option.imageUrl}
                            alt={option.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 200px"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Separator className="mb-4" />
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium text-muted-foreground">생성일: </span>
              <span className="text-foreground">
                <ClientDateDisplay date={action.createdAt} format="datetime" />
              </span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">수정일: </span>
              <span className="text-foreground">
                <ClientDateDisplay date={action.updatedAt} format="datetime" />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MissionActionList({ missionId }: MissionActionListProps) {
  const { data, isLoading, error } = useReadActionsDetail(missionId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: SKELETON_LOADING_COUNT }).map((_, i) => (
          <Card
            key={`skeleton-${
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              i
            }`}
          >
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="h-4 w-full max-w-lg mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full max-w-2xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">액션 목록을 불러올 수 없습니다</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const actions = data?.data ?? [];

  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">아직 추가된 액션이 없습니다</p>
            <p className="text-xs text-muted-foreground mt-1">
              미션에 액션을 추가하여 사용자 응답을 수집하세요
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedActions = [...actions].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">액션 목록</h3>
          <p className="text-sm text-muted-foreground mt-1">
            총 {actions.length}개의 액션이 등록되어 있습니다
          </p>
        </div>
      </div>

      {sortedActions.map(action => (
        <ActionCard key={action.id} action={action} />
      ))}
    </div>
  );
}
