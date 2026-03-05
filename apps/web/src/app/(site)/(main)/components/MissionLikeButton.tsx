"use client";

import { useMissionLike, useMissionLikeStatus } from "@/hooks/mission-like";
import { useAuth } from "@/hooks/user/useAuth";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface MissionLikeButtonProps {
  missionId: string;
  className?: string;
}

export function MissionLikeButton({ missionId, className }: MissionLikeButtonProps) {
  const { isLoggedIn } = useAuth();
  const { data: likeStatus } = useMissionLikeStatus(missionId);
  const { mutate: handleLike, isPending } = useMissionLike(missionId);

  const isLiked = likeStatus?.isLiked ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) return;

    handleLike();
  };

  return (
    <button
      type="button"
      className={cn("relative text-zinc-400", className)}
      onClick={handleClick}
      disabled={isPending}
    >
      <Heart
        className={cn(
          "size-6",
          isLiked ? "fill-red-500 text-red-500" : "fill-white/40 text-zinc-200",
        )}
      />
    </button>
  );
}
