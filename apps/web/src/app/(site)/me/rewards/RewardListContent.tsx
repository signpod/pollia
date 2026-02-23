"use client";

import { Typo } from "@repo/ui/components";
import { useMemo } from "react";
import { RewardCard } from "../components/RewardCard";
import { useUserRewards } from "../hooks/useUserRewards";

interface RewardListContentProps {
  type: "pending" | "paid";
}

export function RewardListContent({ type }: RewardListContentProps) {
  const { data: rewards } = useUserRewards();

  const filtered = useMemo(() => {
    if (!rewards) return [];
    return type === "pending"
      ? rewards.filter(r => r.paidAt === null)
      : rewards.filter(r => r.paidAt !== null);
  }, [rewards, type]);

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Typo.Body size="medium" className="text-zinc-400">
          {type === "pending" ? "지급 예정 리워드가 없어요" : "지급 완료 리워드가 없어요"}
        </Typo.Body>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-5 py-6">
      {filtered.map(reward => (
        <RewardCard key={reward.id} reward={reward} />
      ))}
    </div>
  );
}
