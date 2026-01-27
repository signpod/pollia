"use client";

import { AREA_CODES, type AreaCode } from "@/constants/festival";
import { useReadFestivals } from "@/hooks/festival";
import { useState } from "react";
import { ChipFilter } from "./ChipFilter";
import { FestivalCard } from "./FestivalCard";
import { SectionHeader } from "./SectionHeader";

const FESTIVAL_CHIPS = ["전체", "서울", "경기", "부산", "경남", "대구", "제주"];

function getAreaCode(chip: string): string | undefined {
  if (chip === "전체") return undefined;
  return AREA_CODES[chip as AreaCode];
}

export function FestivalSection() {
  const [selectedChip, setSelectedChip] = useState("전체");
  const areaCode = getAreaCode(selectedChip);

  const { data, isLoading, error } = useReadFestivals({
    areaCode,
    numOfRows: 8,
  });

  const handleChipSelect = (chip: string) => {
    setSelectedChip(chip);
  };

  return (
    <section className="bg-white rounded-xl p-6 flex flex-col gap-6">
      <SectionHeader
        icon="🎪"
        title="지역 축제"
        count={data?.totalCount ?? 0}
        href="/festivals"
        iconBgClass="bg-pink-50"
      />
      <ChipFilter chips={FESTIVAL_CHIPS} onSelect={handleChipSelect} />

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          축제 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.data.slice(0, 4).map(festival => (
            <FestivalCard key={festival.id} festival={festival} />
          ))}
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="rounded-lg border border-default bg-light p-8 text-center text-sm text-sub">
          해당 지역에서 진행 중인 축제가 없습니다.
        </div>
      )}
    </section>
  );
}
