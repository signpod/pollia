"use client";

import { getAllMissions } from "@/actions/mission/read";
import { MissionLikeButton } from "@/app/(site)/(main)/components/MissionLikeButton";
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { MissionCategory, MissionType } from "@prisma/client";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
interface RecommendedContentsProps {
  userName: string;
}

interface RecommendedCardProps {
  mission: { id: string; title: string; imageUrl: string | null; category: MissionCategory };
  className?: string;
}

function RecommendedCard({ mission, className }: RecommendedCardProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const categoryLabel = MISSION_CATEGORY_LABELS[mission.category] ?? mission.category;

  return (
    <div className="shrink-0 pl-2 sm:pl-4 first:pl-5">
      <Link href={ROUTES.MISSION(mission.id)} className={cn("flex w-[200px] flex-col", className)}>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-zinc-100">
          <Image
            src={showFallback ? thumbnailFallback : (mission.imageUrl ?? "")}
            alt={mission.title}
            fill
            sizes="200px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
          <MissionLikeButton missionId={mission.id} className="absolute bottom-3 right-3" />
        </div>
        <div className="mt-2 flex flex-col gap-0.5">
          <Typo.Body size="small" className="text-info">
            {categoryLabel}
          </Typo.Body>
          <Typo.SubTitle size="large" className="line-clamp-2 text-default">
            {mission.title}
          </Typo.SubTitle>
        </div>
      </Link>
    </div>
  );
}

export function RecommendedContents({ userName }: RecommendedContentsProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const { data: missions } = useQuery({
    queryKey: [...missionQueryKeys.allMissions(), "recommended"],
    queryFn: () => getAllMissions({ limit: 6, type: MissionType.GENERAL }),
    select: data => data.data,
    staleTime: 5 * 60 * 1000,
  });

  if (!missions || missions.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <Typo.MainTitle size="small" className="px-5">
        {userName}님의 추천 콘텐츠
      </Typo.MainTitle>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {missions.map(mission => (
            <RecommendedCard
              key={mission.id}
              mission={mission}
              className="w-[159.5px] sm:w-[200px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
