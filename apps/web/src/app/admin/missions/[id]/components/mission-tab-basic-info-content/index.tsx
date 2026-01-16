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
import { cn, stripHtmlTags } from "@/app/admin/lib/utils";
import { MISSION_TYPE_LABELS } from "@/constants/action";
import type { GetMissionResponse } from "@/types/dto";
import { MissionType } from "@prisma/client";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Gift,
  ImageIcon,
  Lock,
  type LucideIcon,
  Pencil,
  Users,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { BasicInfoEditDialog } from "../edit/BasicInfoEditDialog";
import { ImageEditDialog } from "../edit/ImageEditDialog";
import { ClientDateDisplay } from "./ClientDateDisplay";
import { MissionCompletionCard } from "./MissionCompletionCard";

interface MissionBasicInfoProps {
  mission: GetMissionResponse["data"];
}

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: React.ReactNode;
}

function StatCard({ icon: Icon, iconColor, label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3">
          <Icon className={cn("h-4 w-4", iconColor)} />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className="font-semibold truncate">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function MissionTabBasicInfoContent({ mission }: MissionBasicInfoProps) {
  const missionTypeLabel = MISSION_TYPE_LABELS[mission.type];
  const [isBasicInfoDialogOpen, setIsBasicInfoDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          icon={mission.isActive ? CheckCircle2 : XCircle}
          iconColor={mission.isActive ? "text-green-600" : "text-muted-foreground"}
          label="상태"
          value={
            <span className={mission.isActive ? "" : "text-muted-foreground"}>
              {mission.isActive ? "활성" : "비활성"}
            </span>
          }
        />

        {missionTypeLabel && (
          <StatCard
            icon={Lock}
            iconColor="text-primary"
            label="타입"
            value={
              <Badge
                variant={mission.type === MissionType.EXPERIENCE_GROUP ? "default" : "secondary"}
              >
                <span
                  className={cn(
                    "text-sm",
                    mission.type === MissionType.EXPERIENCE_GROUP
                      ? "text-muted"
                      : "text-foreground",
                  )}
                >
                  {missionTypeLabel}
                </span>
              </Badge>
            }
          />
        )}

        <StatCard
          icon={Clock}
          iconColor="text-blue-600"
          label="예상 소요 시간"
          value={
            mission.estimatedMinutes ? (
              `${mission.estimatedMinutes}분`
            ) : (
              <span className="text-sm text-muted-foreground">미설정</span>
            )
          }
        />

        <StatCard
          icon={Calendar}
          iconColor="text-orange-600"
          label="마감일"
          value={
            mission.deadline ? (
              <ClientDateDisplay date={mission.deadline} format="date" />
            ) : (
              <span className="text-sm text-muted-foreground">미설정</span>
            )
          }
        />

        <StatCard
          icon={Gift}
          iconColor="text-purple-600"
          label="리워드"
          value={
            mission.rewardId ? (
              "설정됨"
            ) : (
              <span className="text-sm text-muted-foreground">미설정</span>
            )
          }
        />

        <StatCard
          icon={Users}
          iconColor="text-purple-600"
          label="최대 참여자 수"
          value={
            mission.maxParticipants ? (
              `${mission.maxParticipants}명`
            ) : (
              <span className="text-sm text-foreground">제한 없음</span>
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>미션의 핵심 정보</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsBasicInfoDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                편집
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoField label="제목" value={mission.title} />

            <Separator />

            <InfoField
              label="타겟"
              value={
                mission.target || (
                  <span className="text-muted-foreground italic">설정되지 않음</span>
                )
              }
            />

            <Separator />

            <InfoField
              label="설명"
              value={
                mission.description ? (
                  <div className="whitespace-pre-wrap">{stripHtmlTags(mission.description)}</div>
                ) : (
                  <span className="text-muted-foreground italic">설정되지 않음</span>
                )
              }
            />

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <InfoField label="생성일" value={<ClientDateDisplay date={mission.createdAt} />} />
              <InfoField label="수정일" value={<ClientDateDisplay date={mission.updatedAt} />} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>미디어</CardTitle>
                <CardDescription>이미지 및 로고</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsImageDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                편집
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoField
              label="미션 이미지"
              value={
                mission.imageUrl ? (
                  <Image
                    src={mission.imageUrl}
                    alt="미션 이미지"
                    width={200}
                    height={200}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                    className="w-auto h-auto max-w-full max-h-64 min-h-32 rounded-lg border mt-2"
                    style={{ objectFit: "contain" }}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg bg-muted/20 mt-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <span className="text-xs text-muted-foreground">이미지 없음</span>
                  </div>
                )
              }
            />

            <InfoField
              label="브랜드 로고"
              value={
                mission.brandLogoUrl ? (
                  <Image
                    src={mission.brandLogoUrl}
                    alt="브랜드 로고"
                    width={150}
                    height={80}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
                    className="w-auto h-auto max-w-full max-h-32 min-h-16 rounded-lg border bg-gray-50 p-2 mt-2"
                    style={{ objectFit: "contain" }}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg bg-muted/20 mt-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <span className="text-xs text-muted-foreground">이미지 없음</span>
                  </div>
                )
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MissionCompletionCard missionId={mission.id} />
      </div>

      <BasicInfoEditDialog
        open={isBasicInfoDialogOpen}
        onOpenChange={setIsBasicInfoDialogOpen}
        missionId={mission.id}
      />

      <ImageEditDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        missionId={mission.id}
      />
    </div>
  );
}
