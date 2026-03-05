"use client";

import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { Mission } from "@prisma/client";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import { Typo, useModal } from "@repo/ui/components";
import { GlobeIcon, LockIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useDeleteMission } from "../hooks/useDeleteMission";

function MyContentListItem({ mission }: { mission: Mission }) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const isPublic = mission.type === "GENERAL";
  const { showModal } = useModal();
  const deleteMutation = useDeleteMission();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showModal({
      title: `${UBIQUITOUS_CONSTANTS.MISSION} 삭제`,
      description: `${UBIQUITOUS_CONSTANTS.MISSION}를 삭제하면 참여자들의 응답 데이터도 함께 삭제됩니다.\n되돌릴 수 없습니다.`,
      confirmText: "삭제하기",
      cancelText: "취소",
      showCancelButton: true,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(mission.id);
      },
    });
  };

  return (
    <Link href={ROUTES.EDITOR_MISSION(mission.id)} className="flex items-center gap-3 py-3">
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
      <div className="flex shrink-0 items-center gap-2">
        <Typo.Body
          size="small"
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${
            isPublic ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {isPublic ? <GlobeIcon className="size-3" /> : <LockIcon className="size-3" />}
          {isPublic ? "공개" : "비공개"}
        </Typo.Body>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center justify-center text-zinc-300 transition-colors hover:text-red-500"
          aria-label={`${UBIQUITOUS_CONSTANTS.MISSION} 삭제`}
        >
          <Trash2Icon className="size-4" />
        </button>
      </div>
    </Link>
  );
}

export function MyContentList({ missions }: { missions: Mission[] }) {
  return (
    <div className="flex flex-col">
      {missions.map(mission => (
        <MyContentListItem key={mission.id} mission={mission} />
      ))}
    </div>
  );
}
