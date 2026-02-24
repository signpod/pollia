"use client";

import { NavigableProfileHeader } from "@/components/common/NavigableProfileHeader";
import { cn } from "@/lib/utils";
import { ButtonV2, FixedBottomLayout, Typo } from "@repo/ui/components";
import Link from "next/link";
import type { ReactNode, RefObject } from "react";
import { MissionCompletionTemplate } from "../templates/MissionCompletionTemplate";

export interface MissionCompletionPageProps {
  header?: ReactNode;
  imageUrl?: string | null;
  title?: string;
  description?: string;
  reward?: ReactNode;
  shareButtons?: ReactNode;
  links?: Record<string, string>;

  imageMenu?: {
    isOpen: boolean;
    menuRef: RefObject<HTMLDivElement | null>;
    onToggle: () => void;
    onSave: () => void;
    onShare: () => void;
  };

  onShare?: () => void;
}

export function MissionCompletionPage({
  header = <NavigableProfileHeader />,
  imageUrl,
  title,
  description,
  reward,
  shareButtons,
  links,
  imageMenu,
}: MissionCompletionPageProps) {
  const hasLongLinkKey = Object.keys(links ?? {}).some(key => key.length > 10);

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center bg-white">
      <MissionCompletionTemplate
        header={header}
        imageUrl={imageUrl}
        title={title}
        description={description}
        reward={reward}
        shareButtons={shareButtons}
        imageMenu={imageMenu}
      />

      {!!links && (
        <FixedBottomLayout hasGradientBlur>
          <FixedBottomLayout.Content className="px-5 py-3">
            <div className={cn("flex w-full gap-2", hasLongLinkKey && "flex-col-reverse")}>
              {Object.entries(links).map(([key, value], index) => (
                <ButtonV2
                  key={key}
                  variant={index % 2 !== 0 ? "secondary" : "primary"}
                  className="w-full flex-1"
                >
                  <Link
                    href={value}
                    target="_blank"
                    className={cn(
                      "flex h-full w-full items-center justify-center",
                      hasLongLinkKey && "h-12",
                    )}
                  >
                    <Typo.ButtonText size="large">{key}</Typo.ButtonText>
                  </Link>
                </ButtonV2>
              ))}
            </div>
          </FixedBottomLayout.Content>
        </FixedBottomLayout>
      )}
    </div>
  );
}
