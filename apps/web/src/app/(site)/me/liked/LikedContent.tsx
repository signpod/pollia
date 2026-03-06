"use client";

import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import PolliaFaceVeryGood from "@public/svgs/face/very-good-face-full.svg";
import { ButtonV2, EmptyState, Typo } from "@repo/ui/components";
import Link from "next/link";
import { MeLikedMissionCard } from "../components/MeLikedMissionCard";
import { useLikedMissions } from "../hooks/useLikedMissions";

export function LikedContent() {
  const { data: likedMissions } = useLikedMissions();

  const missions = likedMissions ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col px-5 py-4">
        {missions.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {missions.map(mission => (
              <MeLikedMissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[50dvh] items-center justify-center">
            <EmptyState
              icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
              title={`찜한 ${UBIQUITOUS_CONSTANTS.MISSION}가 없어요`}
              description={
                <>
                  아래 버튼을 눌러
                  <br />
                  마음에 드는 {UBIQUITOUS_CONSTANTS.MISSION}를 찜해보세요
                </>
              }
              action={
                <div className="flex justify-center">
                  <Link href={ROUTES.HOME}>
                    <ButtonV2 variant="primary" className="w-auto">
                      <Typo.ButtonText size="large">구경하러 가기</Typo.ButtonText>
                    </ButtonV2>
                  </Link>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
