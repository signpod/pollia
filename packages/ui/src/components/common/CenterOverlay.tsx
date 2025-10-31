"use client";

import React, { PropsWithChildren, ReactElement } from "react";
import { cn } from "../../lib/utils";

export interface CenterOverlayProps extends PropsWithChildren {
  targetElement: ReactElement;
  className?: string;
}

export function CenterOverlay({ targetElement, children }: CenterOverlayProps) {
  if (!targetElement) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "CenterOverlay: targetElement가 제공되지 않았습니다. " +
          "ReactElement를 targetElement prop으로 전달해주세요.",
      );
    }
    return null;
  }

  return React.cloneElement(targetElement, {
    className: cn((targetElement.props as any).className, "relative"),
    children: (
      <>
        {(targetElement.props as any).children}
        <div
          className={"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform"}
          role="dialog"
        >
          {children}
        </div>
      </>
    ),
  } as any);
}
