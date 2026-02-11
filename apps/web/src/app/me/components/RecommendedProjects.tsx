"use client";

import { getAllMissions } from "@/actions/mission/read";
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { MissionCategory } from "@prisma/client";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import { Typo } from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface RecommendedProjectsProps {
  userName: string;
}

function RecommendedCard({
  mission,
}: {
  mission: { id: string; title: string; imageUrl: string | null; category: MissionCategory };
}) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const categoryLabel = MISSION_CATEGORY_LABELS[mission.category] ?? mission.category;

  return (
    <div className="min-w-0 shrink-0 basis-[200px] pl-4 first:pl-5">
      <Link href={`/mission/${mission.id}`} className="flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-100">
          {showFallback ? (
            <div className="flex size-full items-center justify-center bg-zinc-50">
              <PollPollE className="size-10 text-zinc-200" />
            </div>
          ) : (
            <Image
              src={mission.imageUrl ?? ""}
              alt={mission.title}
              fill
              sizes="200px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="mt-2 flex flex-col gap-0.5">
          <Typo.Body size="small" className="text-info">{categoryLabel}</Typo.Body>
          <Typo.SubTitle size="large" className="line-clamp-2 text-default">
            {mission.title}
          </Typo.SubTitle>
        </div>
      </Link>
    </div>
  );
}

export function RecommendedProjects({ userName }: RecommendedProjectsProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const { data: missions } = useQuery({
    queryKey: [...missionQueryKeys.allMissions(), "recommended"],
    queryFn: () => getAllMissions({ limit: 6 }),
    select: data => data.data,
    staleTime: 5 * 60 * 1000,
  });

  if (!missions || missions.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <Typo.MainTitle size="small" className="px-5">{userName}님의 추천 프로젝트</Typo.MainTitle>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {missions.map(mission => (
            <RecommendedCard key={mission.id} mission={mission} />
          ))}
        </div>
      </div>
    </section>
  );
}
