"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { useReadMission } from "@/app/admin/hooks/use-read-mission";
import { useReadSubmissionList } from "@/app/admin/hooks/use-read-submission-list";
import { notFound } from "next/navigation";
import { use } from "react";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
import { MissionNavigation } from "../components/MissionNavigation";
import { SubmissionExportButton } from "./components/SubmissionExportButton";
import { SubmissionTable } from "./components/SubmissionTable";

interface AdminMissionSubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminMissionSubmissionsPage({ params }: AdminMissionSubmissionsPageProps) {
  const { id: missionId } = use(params);
  const { data: missionResponse } = useReadMission(missionId);
  const { data: submissionResponse, isLoading, error } = useReadSubmissionList(missionId);
  const mission = missionResponse?.data;

  if (!mission) return notFound();

  const tableData = submissionResponse?.data;

  return (
    <div className="max-w-7xl">
      <AdminMissionHeader
        title="제출 목록"
        description="미션에 참여한 사용자들의 응답 데이터를 확인하고 CSV로 내보낼 수 있습니다"
        nav={<MissionNavigation missionId={missionId} />}
        missionId={missionId}
        isActive={mission.isActive}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>완료자 ({tableData?.completedRows.length ?? 0}명)</CardTitle>
              <CardDescription>미션을 완료한 사용자 목록</CardDescription>
            </div>
            <SubmissionExportButton missionId={missionId} exportType="completed" />
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-[200px] w-full" />}

            {error && (
              <div className="p-8 border border-destructive rounded-lg text-center text-destructive">
                데이터를 불러오는데 실패했습니다: {error.message}
              </div>
            )}

            {!isLoading && !error && tableData && (
              <SubmissionTable
                columns={tableData.columns}
                rows={tableData.completedRows}
                timeLabel="완료 시간"
                emptyMessage="아직 완료한 사용자가 없습니다"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>진행중 ({tableData?.inProgressRows.length ?? 0}명)</CardTitle>
              <CardDescription>미션을 시작했지만 아직 완료하지 않은 사용자 목록</CardDescription>
            </div>
            <SubmissionExportButton missionId={missionId} exportType="inProgress" />
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-[200px] w-full" />}

            {error && (
              <div className="p-8 border border-destructive rounded-lg text-center text-destructive">
                데이터를 불러오는데 실패했습니다: {error.message}
              </div>
            )}

            {!isLoading && !error && tableData && (
              <SubmissionTable
                columns={tableData.columns}
                rows={tableData.inProgressRows}
                timeLabel="시작 시간"
                emptyMessage="아직 시작한 사용자가 없습니다"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
