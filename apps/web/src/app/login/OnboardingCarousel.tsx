"use client";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { cn } from "@repo/ui/lib";
import { CenterOverlay } from "@repo/ui/components";
import PoliaLogo from "@public/svgs/pollia-icon-filled.svg";

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
    [emblaApi]
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
        "bg-zinc-50 rounded-[16px] flex-1 py-4",
        "flex flex-col gap-6 justify-center items-center"
      )}
    >
      <div className="flex flex-col items-center text-center whitespace-pre-line gap-3">
        <IndexBadge index={selectedIndex} />
        <span className="font-bold leading-[1.5] text-[20px]">
          {slides[selectedIndex]?.description}
        </span>
      </div>

      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex w-full">
          {slides.map((slide) => (
            <div key={slide.id} className="shrink-0 basis-full px-6">
              <div className="relative flex justify-center items-center">
                <Image
                  src={slide.imageUrl}
                  alt={slide.description}
                  width={350}
                  className="object-cover"
                  height={300}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === selectedIndex ? "bg-zinc-950" : "bg-zinc-200"
            }`}
            onClick={() => onDotButtonClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

function IndexBadge({ index }: { index: number }) {
  return (
    <CenterOverlay targetElement={<PoliaLogo className="size-6" />}>
      <span className="text-sm font-bold text-white leading-[1.8]">
        {index + 1}
      </span>
    </CenterOverlay>
  );
}
