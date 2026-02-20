"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useReadMissionNotionPage, useSyncMissionToNotion } from "@/hooks/mission";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Check, Copy, ExternalLink, FileText, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface NotionReportCardProps {
  missionId: string;
}

export function NotionReportCard({ missionId }: NotionReportCardProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: notionPageData, isPending: isNotionPagePending } =
    useReadMissionNotionPage(missionId);
  const { data: participantData } = useReadMissionParticipantInfo(missionId);

  const syncMutation = useSyncMissionToNotion({
    onSuccess: _data => {
      toast.success("노션 리포트가 생성되었습니다");
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.missionNotionPage(missionId),
      });
    },
    onError: error => {
      toast.error(error.message || "노션 리포트 생성 중 오류가 발생했습니다");
    },
  });

  const notionPage = notionPageData?.data;
  const currentResponses = participantData?.data?.currentParticipants ?? 0;
  const hasNewResponses = notionPage ? currentResponses > notionPage.syncedResponseCount : false;
  const newResponseCount = notionPage ? currentResponses - notionPage.syncedResponseCount : 0;

  const handleSync = useCallback(() => {
    syncMutation.mutate(missionId);
  }, [syncMutation, missionId]);

  const handleCopyLink = useCallback(async () => {
    if (!notionPage?.notionPageUrl) return;
    await navigator.clipboard.writeText(notionPage.notionPageUrl);
    setCopied(true);
    toast.success("링크가 복사되었습니다");
    setTimeout(() => setCopied(false), 2000);
  }, [notionPage?.notionPageUrl]);

  const handleOpenNotion = useCallback(() => {
    if (!notionPage?.notionPageUrl) return;
    window.open(notionPage.notionPageUrl, "_blank", "noopener,noreferrer");
  }, [notionPage?.notionPageUrl]);

  if (isNotionPagePending) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!notionPage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            노션 리포트
          </CardTitle>
          <CardDescription>
            {UBQUITOUS_CONSTANTS.MISSION} 응답 데이터를 노션 페이지로 생성하여 파트너에게 공유할 수
            있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">아직 노션 리포트가 생성되지 않았습니다.</p>
              <p className="text-sm text-muted-foreground">현재 응답자 수: {currentResponses}명</p>
            </div>
            <Button onClick={handleSync} disabled={syncMutation.isPending} className="gap-2">
              {syncMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  리포트 생성하기
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          노션 리포트
        </CardTitle>
        <CardDescription>파트너에게 공유할 수 있는 노션 리포트입니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-medium">리포트 생성 완료</span>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">마지막 동기화</span>
              <span>
                {format(new Date(notionPage.lastSyncedAt), "yyyy.MM.dd HH:mm", {
                  locale: ko,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">동기화된 응답</span>
              <span>{notionPage.syncedResponseCount}명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">현재 응답</span>
              <span className="flex items-center gap-2">
                {currentResponses}명
                {hasNewResponses && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                    +{newResponseCount} 새 응답
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleOpenNotion} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            바로가기
          </Button>
          <Button variant="outline" onClick={handleCopyLink} className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                링크 복사
              </>
            )}
          </Button>
          <Button
            variant={hasNewResponses ? "default" : "outline"}
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="gap-2"
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                동기화 중...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {hasNewResponses ? "새 응답 동기화" : "재동기화"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
