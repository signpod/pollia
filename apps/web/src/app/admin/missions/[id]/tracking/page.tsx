"use client";
import { FunnelViewTabs } from "@/app/admin/components/FunnelViewTabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { Switch } from "@/app/admin/components/shadcn-ui/switch";
import { useReadMission, useReadMissionFunnel } from "@/app/admin/hooks/mission";
import { useReadMissionResponses } from "@/app/admin/hooks/mission-response";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { notFound, usePathname, useRouter, useSearchParams } from "next/navigation";
import { use, useMemo } from "react";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
import { MissionNavigation } from "../components/MissionNavigation";

interface AdminMissionTrackingPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminMissionTrackingPage({ params }: AdminMissionTrackingPageProps) {
  const { id: missionId } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const membersOnly = searchParams.get("membersOnly") === "true";

  const { data: missionResponse } = useReadMission(missionId);
  const {
    data: funnelResponse,
    isLoading,
    error,
  } = useReadMissionFunnel(missionId, { membersOnly });
  const { data: responsesData } = useReadMissionResponses(missionId, { membersOnly });
  const mission = missionResponse?.data;

  const handleMembersOnlyChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("membersOnly", "true");
    } else {
      params.delete("membersOnly");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const responses = responsesData?.data ?? [];
  const missionStats = useMemo(() => {
    const total = responses.length;
    const completed = responses.filter(r => r.completedAt !== null).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      completionRate,
    };
  }, [responses]);

  if (!mission) return notFound();

  return (
    <>
      <AdminMissionHeader
        title="통계"
        description={`트래킹, 디바이스 분포, 참여 패턴 등 ${UBIQUITOUS_CONSTANTS.MISSION}의 주요 지표를 확인할 수 있습니다`}
        nav={<MissionNavigation missionId={missionId} />}
        missionId={missionId}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>트래킹 퍼널</CardTitle>
              <CardDescription>
                {UBIQUITOUS_CONSTANTS.MISSION}의 각 단계별 트래킹 데이터를 확인할 수 있습니다
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="members-only"
                checked={membersOnly}
                onCheckedChange={handleMembersOnlyChange}
              />
              <Label htmlFor="members-only" className="text-sm cursor-pointer whitespace-nowrap">
                회원 응답만 보기
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-[450px] w-full" />}

          {error && (
            <div className="p-8 border border-destructive rounded-lg text-center text-destructive">
              데이터를 불러오는데 실패했습니다: {error.message}
            </div>
          )}

          {!isLoading && !error && funnelResponse?.data && (
            <FunnelViewTabs data={funnelResponse.data} missionStats={missionStats} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
