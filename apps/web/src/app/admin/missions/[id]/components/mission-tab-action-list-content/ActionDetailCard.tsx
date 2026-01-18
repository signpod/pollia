"use client";

import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Separator } from "@/app/admin/components/shadcn-ui/separator";
import { cleanTiptapHTML } from "@/lib/utils";
import type { ActionDetail } from "@/types/dto";
import { Copy, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { ClientDateDisplay } from "../mission-tab-basic-info-content/ClientDateDisplay";
import { getActionTypeInfo, getDisplayOrder } from "./action-type-info";

interface ActionDetailCardProps {
  action: ActionDetail;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function ActionDetailCard({ action, onEdit, onDuplicate, onDelete }: ActionDetailCardProps) {
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
            {action.description && cleanTiptapHTML(action.description) && (
              <CardDescription className="mt-2">
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Tiptap HTML content
                  dangerouslySetInnerHTML={{ __html: cleanTiptapHTML(action.description) }}
                />
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="size-4 mr-1" />
              편집
            </Button>
            <Button variant="outline" size="sm" onClick={onDuplicate}>
              <Copy className="size-4 mr-1" />
              복제
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4 mr-1" />
              삭제
            </Button>
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
