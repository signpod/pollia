"use client";

import type { CompletionLinkData } from "@/types/dto/mission-completion";
import { Typo } from "@repo/ui/components";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

interface PurchaseLinkCarouselProps {
  links: CompletionLinkData[];
}

function PurchaseLinkCard({ link }: { link: CompletionLinkData }) {
  return (
    <div className="min-w-0 shrink-0 grow-0 basis-[40%] sm:basis-[calc(100%/3.5)]">
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2">
        {link.imageUrl && (
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200">
            <Image
              src={link.imageUrl}
              alt={link.name}
              fill
              sizes="(min-width: 640px) calc(100vw / 3.5), calc(100vw / 2.5)"
              className="object-cover"
            />
          </div>
        )}
        <Typo.SubTitle className="text-default break-keep">{link.name}</Typo.SubTitle>
      </a>
    </div>
  );
}

export function PurchaseLinkCarousel({ links }: PurchaseLinkCarouselProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  if (links.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <Typo.MainTitle size="small">취향에 맞게 골라보았어요</Typo.MainTitle>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2">
          {links.map(link => (
            <PurchaseLinkCard key={link.id} link={link} />
          ))}
        </div>
      </div>
    </section>
  );
}
