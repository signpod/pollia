"use client";

import type { FestivalData } from "@/types/dto/festival";
import { ButtonV2, Typo } from "@repo/ui/components";
import { Calendar, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FestivalContentProps {
  festival: FestivalData;
}

function formatFullDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return "";
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${year}.${month}.${day}`;
}

function getNaverMapUrl(address: string): string {
  const query = encodeURIComponent(address);
  return `https://map.naver.com/v5/search/${query}`;
}

export function FestivalContent({ festival }: FestivalContentProps) {
  const startDateFormatted = formatFullDate(festival.startDate);
  const endDateFormatted = formatFullDate(festival.endDate);

  return (
    <div className="relative bg-white">
      <div className="flex w-full flex-col gap-8 px-5 py-10">
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-violet-500" />
            <Typo.SubTitle size="large">상세 정보</Typo.SubTitle>
          </div>

          <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 size-5 shrink-0 text-violet-500" />
              <div className="flex flex-col gap-0.5">
                <Typo.Body size="small" className="text-sub">
                  행사 기간
                </Typo.Body>
                <Typo.Body size="medium">
                  {startDateFormatted} ~ {endDateFormatted}
                </Typo.Body>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-violet-500" />
              <div className="flex flex-col gap-0.5">
                <Typo.Body size="small" className="text-sub">
                  장소
                </Typo.Body>
                <Typo.Body size="medium">{festival.address}</Typo.Body>
              </div>
            </div>

            {festival.tel && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-violet-500" />
                <div className="flex flex-col gap-0.5">
                  <Typo.Body size="small" className="text-sub">
                    문의
                  </Typo.Body>
                  <Typo.Body size="medium">{festival.tel}</Typo.Body>
                </div>
              </div>
            )}
          </div>
        </section>

        {festival.description && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-violet-500" />
              <Typo.SubTitle size="large">소개</Typo.SubTitle>
            </div>
            <Typo.Body size="medium" className="whitespace-pre-wrap text-sub leading-relaxed">
              {festival.description}
            </Typo.Body>
          </section>
        )}

        {festival.address && (
          <section className="flex flex-col items-center gap-3">
            <Typo.Body size="medium" className="text-center text-sub">
              축제 장소가 궁금하다면?
            </Typo.Body>
            <Link
              href={getNaverMapUrl(festival.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <ButtonV2 variant="secondary" size="large" className="w-full gap-2">
                <MapPin className="size-4" />
                네이버 지도에서 보기
              </ButtonV2>
            </Link>
          </section>
        )}
      </div>

      <footer className="flex w-full items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-2">
          <Image
            src="/images/pollia-logo.png"
            alt="Pollia"
            width={50}
            height={16}
            style={{ width: "auto", height: "16px" }}
            className="object-contain object-left"
          />
          <Typo.Body size="small" className="text-zinc-300">
            © Pollia All rights reserved.
          </Typo.Body>
        </div>

        <Link
          href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400"
        >
          <Typo.Body size="small" className="text-info">
            개인정보처리방침
          </Typo.Body>
        </Link>
      </footer>
    </div>
  );
}
