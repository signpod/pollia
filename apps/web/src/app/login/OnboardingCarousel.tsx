"use client";

import { PointIcon } from "@/components/common/PointIcon";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    description: `새로운 트렌드를 만드는 당신의 질문!
    지금 바로 만들어 공유해보세요`,
    imageUrl: "/images/onboarding-1.png",
  },
  {
    id: 2,
    description: `첫 감각이 가장 솔직한 마음!
    자유롭게 당신의 생각을 세상에 보여주세요`,
    imageUrl: "/images/onboarding-1.png",
  },
  {
    id: 3,
    description: `가장 솔직한 마음들이 모여 만든
    가장 특별한 인사이트를 확인해 보세요!`,
    imageUrl: "/images/onboarding-1.png",
  },
];

export function OnboardingCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div
      className={cn(
        "mx-5 flex-1 rounded-[16px] bg-zinc-50 py-4",
        "flex flex-col items-center justify-center gap-6",
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center whitespace-pre-line">
        <IndexBadge index={selectedIndex} />
        <Typo.MainTitle size="small">{slides[selectedIndex]?.description}</Typo.MainTitle>
      </div>

      <div className="w-full overflow-hidden" ref={emblaRef}>
        <div className="flex w-full">
          {slides.map((slide, slideIndex) => (
            <div key={slide.id} className="shrink-0 basis-full px-6">
              <div className="relative flex h-[300px] w-full items-center justify-center">
                <Image
                  src={slide.imageUrl}
                  alt={slide.description}
                  width={300}
                  height={350}
                  className="object-cover"
                  priority={slideIndex === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={`dot-${index}`}
            type="button"
            className={`h-2 w-2 rounded-full transition-colors duration-200 ${
              index === selectedIndex ? "bg-zinc-950" : "bg-zinc-200"
            }`}
            onClick={() => onDotButtonClick(index)}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}

function IndexBadge({ index }: { index: number }) {
  return (
    <PointIcon>
      <span className="text-sm leading-[1.8] font-bold text-white">{index + 1}</span>
    </PointIcon>
  );
}
