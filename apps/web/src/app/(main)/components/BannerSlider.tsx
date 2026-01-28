"use client";

import { ROUTES } from "@/constants/routes";
import { Typo } from "@repo/ui/components";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FEATURED_MISSION = {
  id: "cmkg52ncy000gla04ya80cyo2",
  title: "2026 초미세 습관 형성 프로젝트",
  subtitle: "참가 신청 모집 중",
  description:
    "의지력이 바닥난 분들을 위한 7일간의 프로젝트! 매일 아침 카카오톡으로 미션이 배달되고, 성공 시 CU 편의점 상품권을 드려요.",
  imageUrl:
    "https://jjrsknqxiqbzqiraexpc.supabase.co/storage/v1/object/public/mission-images/f54437e4-95c6-4232-b927-f2b995b09a14/1768522947884.jpg",
};

export function BannerSlider() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link
        href={`https://pollia.me/${ROUTES.MISSION(FEATURED_MISSION.id)}`}
        className="group grid overflow-hidden rounded-2xl bg-zinc-900 md:grid-cols-[1fr_2fr]"
      >
        {/* 이미지 영역 */}
        <div className="relative aspect-4/3 md:aspect-auto md:min-h-[280px] lg:min-h-[320px]">
          {/* 블러 배경 */}
          <Image
            src={FEATURED_MISSION.imageUrl}
            alt=""
            fill
            className="scale-110 object-cover blur-xl brightness-50"
            priority
          />
          {/* 메인 이미지 */}
          <Image
            src={FEATURED_MISSION.imageUrl}
            alt={FEATURED_MISSION.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </div>

        {/* 정보 영역 */}
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            모집 중
          </span>

          <Typo.MainTitle size="medium" className="mb-2 text-white sm:text-2xl lg:text-3xl">
            {FEATURED_MISSION.title}
          </Typo.MainTitle>

          <Typo.Body size="small" className="mb-1 text-zinc-300">
            {FEATURED_MISSION.subtitle}
          </Typo.Body>

          <Typo.Body size="small" className="mb-6 line-clamp-2 text-zinc-400 lg:line-clamp-3">
            {FEATURED_MISSION.description}
          </Typo.Body>

          <button
            className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-all group-hover:gap-2.5 group-hover:bg-zinc-100"
            type="button"
          >
            지금 신청하기
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </Link>
    </section>
  );
}
