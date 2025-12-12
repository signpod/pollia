"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { stripHtmlTags } from "@/app/admin/lib/utils";
import type { GetMissionResponse } from "@/types/dto";
import { Calendar, CheckCircle2, Clock, Gift, XCircle } from "lucide-react";
import Image from "next/image";
import { AdminMissionHeader } from "./AdminMissionHeader";
import { ClientDateDisplay } from "./ClientDateDisplay";
import { MissionNavigation } from "./MissionNavigation";

interface MissionDetailContentProps {
  mission: GetMissionResponse["data"];
}

export function MissionDetailContent({ mission }: MissionDetailContentProps) {
  return (
    <div className="max-w-7xl">
      <AdminMissionHeader
        title="미션 상세"
        description={mission.title}
        nav={<MissionNavigation missionId={mission.id} />}
        missionId={mission.id}
        isActive={mission.isActive}
      />

      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>상태</CardDescription>
            </CardHeader>
            <CardContent>
              {mission.isActive ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-medium">활성</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-lg font-medium text-muted-foreground">비활성</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>예상 소요 시간</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-medium">
                  {mission.estimatedMinutes ? `${mission.estimatedMinutes}분` : "미설정"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>마감일</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-medium">
                  {mission.deadline ? (
                    <ClientDateDisplay date={mission.deadline} format="date" />
                  ) : (
                    "미설정"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>리워드</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-medium">
                  {mission.rewardId ? "설정됨" : "미설정"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>미션의 기본 정보를 확인할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground">제목</dt>
                <dd className="text-sm">{mission.title}</dd>
              </div>

              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground">타겟</dt>
                <dd className="text-sm">{mission.target || "미설정"}</dd>
              </div>

              <div className="space-y-2 md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">설명</dt>
                <dd className="text-sm">
                  {mission.description ? stripHtmlTags(mission.description) : "미설정"}
                </dd>
              </div>

              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground">미션 이미지</dt>
                <dd>
                  {mission.imageUrl ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <Image
                        src={mission.imageUrl}
                        alt="미션 이미지"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">미설정</span>
                  )}
                </dd>
              </div>

              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground">브랜드 로고</dt>
                <dd>
                  {mission.brandLogoUrl ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <Image
                        src={mission.brandLogoUrl}
                        alt="브랜드 로고"
                        fill
                        className="object-contain bg-gray-50"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">미설정</span>
                  )}
                </dd>
              </div>

              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground">생성일</dt>
                <dd className="text-sm">
                  <ClientDateDisplay date={mission.createdAt} />
                </dd>
              </div>

              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground">수정일</dt>
                <dd className="text-sm">
                  <ClientDateDisplay date={mission.updatedAt} />
                </dd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
