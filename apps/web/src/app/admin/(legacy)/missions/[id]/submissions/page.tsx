"use client";

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
import { useReadMission } from "@/app/admin/hooks/mission";
import { useReadSubmissionList } from "@/app/admin/hooks/submission";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { notFound, usePathname, useRouter, useSearchParams } from "next/navigation";
import { use, useMemo, useState } from "react";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
import { MissionNavigation } from "../components/MissionNavigation";
import { StatusFilter, type StatusFilterValue } from "./components/StatusFilter";
import { SubmissionExportButton } from "./components/SubmissionExportButton";
import { SubmissionTable } from "./components/SubmissionTable";

interface AdminMissionSubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminMissionSubmissionsPage({ params }: AdminMissionSubmissionsPageProps) {
  const { id: missionId } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const membersOnly = searchParams.get("membersOnly") === "true";

  const { data: missionResponse } = useReadMission(missionId);
  const {
    data: submissionResponse,
    isLoading,
    error,
  } = useReadSubmissionList(missionId, { membersOnly });
  const mission = missionResponse?.data;
  const [filter, setFilter] = useState<StatusFilterValue>("all");

  const handleMembersOnlyChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("membersOnly", "true");
    } else {
      params.delete("membersOnly");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const tableData = submissionResponse?.data;

  const counts = useMemo(() => {
    if (!tableData) return { all: 0, completed: 0, inProgress: 0 };
    return {
      all: tableData.allRows.length,
      completed: tableData.completedRows.length,
      inProgress: tableData.inProgressRows.length,
    };
  }, [tableData]);

  const filteredRows = useMemo(() => {
    if (!tableData) return [];
    switch (filter) {
      case "completed":
        return tableData.completedRows;
      case "inProgress":
        return tableData.inProgressRows;
      default:
        return tableData.allRows;
    }
  }, [tableData, filter]);

  if (!mission) return notFound();

  return (
    <>
      <AdminMissionHeader
        title="제출 목록"
        description={`${UBIQUITOUS_CONSTANTS.MISSION}에 참여한 사용자들의 응답 데이터를 확인하고 CSV로 내보낼 수 있습니다`}
        nav={<MissionNavigation missionId={missionId} />}
        missionId={missionId}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>제출 현황</CardTitle>
                <CardDescription>{UBIQUITOUS_CONSTANTS.MISSION} 참여자 목록</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id="members-only"
                    checked={membersOnly}
                    onCheckedChange={handleMembersOnlyChange}
                  />
                  <Label
                    htmlFor="members-only"
                    className="text-sm cursor-pointer whitespace-nowrap"
                  >
                    회원 응답만 보기
                  </Label>
                </div>
                <StatusFilter value={filter} onChange={setFilter} counts={counts} />
                <SubmissionExportButton missionId={missionId} exportType={filter} />
              </div>
            </div>
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
                rows={filteredRows}
                emptyMessage="아직 참여한 사용자가 없습니다"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
