"use client";

import { useReadMission } from "@/hooks/mission";
import { useReadMissionCompletion } from "@/hooks/mission-completion";
import { cleanTiptapHTML, cn } from "@/lib/utils";
import { useParams } from "next/navigation";

import { ButtonV2, FixedBottomLayout, TiptapViewer, Typo } from "@repo/ui/components";
import Image from "next/image";
import Link from "next/link";
import { SocialShareButtons } from "../../components";
import { useMissionShare } from "./hooks";

export function MissionCompletion() {
  const { missionId } = useParams<{ missionId: string }>();
  const { data: mission } = useReadMission(missionId);
  const { data: missionCompletion } = useReadMissionCompletion(missionId);

  const { imageUrl, brandLogoUrl, title: missionTitle } = mission?.data ?? {};
  const {
    title: completionTitle,
    description: completionDescription,
    imageUrl: completionImageUrl,
    links,
  } = missionCompletion?.data ?? {};

  const { handleKakaoShare, handleShare, handleXShare } = useMissionShare({
    missionId,
    title: missionTitle,
    imageUrl,
  });

  return (
    <div
      className={cn(
        "relative w-full flex flex-col items-center gap-6 min-s-svh overflow-hidden",
        "bg-white",
      )}
    >
      <div className="bg-linear-to-t from-white to-transparent absolute inset-0 z-3 aspect-square" />
      <div
        style={{
          maskClip: "content-box",
          maskImage:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 40%, rgba(255, 255, 255, 1) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 40%, rgba(255, 255, 255, 1) 100%)",
          backdropFilter: "blur(5px)",
        }}
        className="absolute inset-0 z-2 aspect-square"
      />
      <div className="absolute inset-0 w-full aspect-square">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="Mission Image"
            fill
            className="object-cover object-top size-full"
          />
        )}
      </div>
      <div className="flex flex-col w-full h-full z-3 items-center justify-center gap-6">
        {brandLogoUrl && (
          <Image
            src={brandLogoUrl}
            alt="Brand Logo"
            width={48}
            height={48}
            className="bg-white rounded-full size-12 ring-1 ring-default object-center object-contain"
          />
        )}

        {completionImageUrl && (
          <Image
            src={completionImageUrl}
            alt="Completion Image"
            width={240}
            height={240}
            className="rounded-lg"
          />
        )}
        <div className="flex flex-col items-center gap-2">
          {completionTitle && <Typo.MainTitle size="small">{completionTitle}</Typo.MainTitle>}
          {completionDescription && cleanTiptapHTML(completionDescription) && (
            <TiptapViewer
              content={cleanTiptapHTML(completionDescription)}
              className="text-center"
            />
          )}
        </div>

        <SocialShareButtons
          onXShare={handleXShare}
          onKakaoShare={handleKakaoShare}
          onLinkShare={handleShare}
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
