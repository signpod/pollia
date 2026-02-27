"use client";

import { ROUTES } from "@/constants/routes";
import type { Mission } from "@prisma/client";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import { Typo } from "@repo/ui/components";
import { GlobeIcon, LockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function MyContentListItem({ mission }: { mission: Mission }) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const isPublic = mission.type === "GENERAL";

  return (
    <Link href={ROUTES.MISSION(mission.id)} className="flex items-center gap-3 py-3">
      <div className="relative size-11 shrink-0 overflow-hidden rounded-sm">
        <Image
          src={showFallback ? thumbnailFallback : (mission.imageUrl ?? "")}
          alt={mission.title}
          fill
          sizes="44px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typo.SubTitle size="large" className="truncate">
          {mission.title}
        </Typo.SubTitle>
      </div>
      <Typo.Body
        size="small"
        className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 ${
          isPublic ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {isPublic ? <GlobeIcon className="size-3" /> : <LockIcon className="size-3" />}
        {isPublic ? "공개" : "비공개"}
      </Typo.Body>
    </Link>
  );
}

export function MyContentList({ missions }: { missions: Mission[] }) {
  return (
    <div className="flex flex-col divide-y divide-zinc-100">
      {missions.map(mission => (
        <MyContentListItem key={mission.id} mission={mission} />
      ))}
    </div>
  );
}
