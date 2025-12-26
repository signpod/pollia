"use client";

import { useReadMission } from "@/hooks/mission";
import { useReadMissionCompletion } from "@/hooks/mission-completion";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

import { ButtonV2, FixedBottomLayout, Typo } from "@repo/ui/components";
import Link from "next/link";
import { CompletionMessage, ShareSection, StarAnimation } from "./components";
import { useMissionCompletionAnimation, useMissionShare } from "./hooks";

export function MissionCompletion() {
  const { missionId } = useParams<{ missionId: string }>();
  const { data: mission } = useReadMission(missionId);
  const { data: missionCompletion } = useReadMissionCompletion(missionId);

  const { imageUrl, brandLogoUrl, title: missionTitle } = mission?.data ?? {};
  const {
    title: completionTitle,
    description: completionDescription,
    links,
  } = missionCompletion?.data ?? {};

  const { refs, isReversed, showTitle, showDescription, showStarTooltip } =
    useMissionCompletionAnimation();

  const { handleKakaoShare, handleShare, isSharing } = useMissionShare({
    missionId,
    title: missionTitle,
    imageUrl,
  });

  return (
    <div
      className={cn(
        "relative w-full flex flex-col items-center gap-6 min-s-svh overflow-hidden",
        "bg-white",
        "transition-all duration-300",
        !showTitle ? "pt-[25%]" : "pt-[20px]",
      )}
    >
      <div
        ref={refs.gradientRef}
        className="absolute inset-0 bg-linear-to-b from-[#FFE672]/0 via-[#FFE672]/10 to-[#FFE672]/0 pointer-events-none"
      />
      <div className="flex flex-col items-center w-full h-full">
        {(isReversed ? ["star", "title"] : ["title", "star"]).map(item =>
          item === "title" ? (
            <CompletionMessage
              key={item}
              title={completionTitle}
              description={completionDescription}
              showTitle={showTitle}
              showDescription={showDescription}
            />
          ) : (
            <StarAnimation key={item} ref={refs.starBoxRef} showTooltip={showStarTooltip} />
          ),
        )}
        <ShareSection
          ref={refs.shareBoxRef}
          title={missionTitle}
          brandLogoUrl={brandLogoUrl}
          imageUrl={imageUrl}
          onKakaoShare={handleKakaoShare}
          onLinkShare={handleShare}
          isSharing={isSharing}
        />
      </div>
      {!!links && (
        <FixedBottomLayout hasGradientBlur>
          <FixedBottomLayout.Content className="px-5 py-3">
            <div className="flex gap-2 w-full">
              {Object.entries(links).map(([key, value], index) => (
                <ButtonV2
                  key={key}
                  variant={index === 0 ? "primary" : "secondary"}
                  className="flex-1 w-full"
                >
                  <Link
                    href={value}
                    target="_blank"
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Typo.ButtonText size="large">{key}</Typo.ButtonText>
                  </Link>
                </ButtonV2>
              ))}
            </div>
          </FixedBottomLayout.Content>
        </FixedBottomLayout>
      )}
    </div>
  );
}
