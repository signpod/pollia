"use client";

import { MissionCompletionPage } from "@/components/common/pages/MissionCompletionPage";
import { useReadMission } from "@/hooks/mission";
import { useReadMissionCompletion, useReadMissionCompletionById } from "@/hooks/mission-completion";
import { useParams } from "next/navigation";
import { useImageMenu, useMissionShare } from "./hooks";

interface MissionCompletionProps {
  completionId?: string;
}

export function MissionCompletion({ completionId }: MissionCompletionProps) {
  const { missionId } = useParams<{ missionId: string }>();
  const { data: mission } = useReadMission(missionId);
  const { data: missionCompletionByMission } = useReadMissionCompletion(missionId);
  const { data: missionCompletionById } = useReadMissionCompletionById(
    missionId,
    completionId ?? null,
  );

  const missionCompletion = completionId ? missionCompletionById : missionCompletionByMission;

  const { imageUrl, title: missionTitle } = mission?.data ?? {};
  const {
    title: completionTitle,
    description: completionDescription,
    imageUrl: completionImageUrl,
    links,
  } = missionCompletion?.data ?? {};

  const { handleShare } = useMissionShare({
    missionId,
    title: missionTitle,
    imageUrl,
  });

  const { isMenuOpen, menuRef, toggleMenu, handleImageSave, handleImageShare } = useImageMenu({
    imageUrl: completionImageUrl ?? "",
    title: completionTitle,
  });

  return (
    <MissionCompletionPage
      imageUrl={completionImageUrl}
      title={completionTitle}
      description={completionDescription}
      links={links ?? undefined}
      imageMenu={{
        isOpen: isMenuOpen,
        menuRef,
        onToggle: toggleMenu,
        onSave: handleImageSave,
        onShare: handleImageShare,
      }}
      onShare={handleShare}
    />
  );
}
