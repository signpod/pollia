"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/admin/components/shadcn-ui/tooltip";
import { Check, Copy, CopyPlus, ExternalLink } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { MissionActiveToggle } from "./MissionActiveToggle";
import { toast } from "sonner";

interface AdminMissionHeaderProps {
  title: string;
  description?: string;
  nav?: ReactNode;
  missionId: string;
  isActive: boolean;
}

export function AdminMissionHeader({
  title,
  description,
  nav,
  missionId,
  isActive,
}: AdminMissionHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const getMissionUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    return `${baseUrl}/mission/${missionId}`;
  }, [missionId]);

  const handleCopyLink = useCallback(async () => {
    const url = getMissionUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("링크가 복사되었습니다.");
    setTimeout(() => setCopied(false), 2000);
  }, [getMissionUrl]);

  const handleOpenMission = useCallback(() => {
    const url = getMissionUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  }, [getMissionUrl]);

  const handleDuplicateMission = useCallback(async () => {
    setIsDuplicating(true);
    try {
      // TODO: 서버 액션 호출
      // const result = await duplicateMission(missionId);
      // router.push(`/admin/missions/${result.data.id}/edit`);

      toast.info("미션 복제 기능은 곧 추가됩니다.");
    } catch (_error) {
      toast.error("미션 복제 중 오류가 발생했습니다.");
    } finally {
      setIsDuplicating(false);
    }
  }, []);

  return (
    <header className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDuplicateMission}
                disabled={isDuplicating}
              >
                <CopyPlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>미션 복제</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? "복사됨" : "링크 복사"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleOpenMission}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>미션 페이지 열기</TooltipContent>
          </Tooltip>

          <MissionActiveToggle missionId={missionId} isActive={isActive} />
        </div>
      </div>
      {nav && <div>{nav}</div>}
    </header>
  );
}
