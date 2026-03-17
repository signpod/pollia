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
    <div className="shrink-0">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-[159.5px] flex-col gap-2 sm:w-[200px]"
      >
        {link.imageUrl && (
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-zinc-100">
            <Image
              src={link.imageUrl}
              alt={link.name}
              fill
              sizes="200px"
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
