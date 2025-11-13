"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface TooltipProps {
  children: ReactNode;
  id: string;
  placement?: "top" | "bottom";
  className?: string;
}

interface Position {
  top: number;
  left: number;
}

export const Tooltip = ({ children, id, placement = "top", className = "" }: TooltipProps) => {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const DISTANCE_FROM_ANCHOR = 20;

  const calculatePosition = useCallback((): Position => {
    if (!anchorElement) return { top: 0, left: 0 };

    const anchorRect = anchorElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect() || {
      width: 200,
      height: 40,
    };

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = anchorRect.top - tooltipRect.height - DISTANCE_FROM_ANCHOR;
        left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
        break;
      case "bottom":
        top = anchorRect.bottom + DISTANCE_FROM_ANCHOR;
        left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
        break;
    }

    return { top, left };
  }, [anchorElement, placement]);

  useEffect(() => {
    if (anchorElement) {
      setPosition(calculatePosition());

      let lastRect = anchorElement.getBoundingClientRect();
      let animationId: number;

      const checkPosition = () => {
        const currentRect = anchorElement.getBoundingClientRect();

        if (
          lastRect.top !== currentRect.top ||
          lastRect.left !== currentRect.left ||
          lastRect.width !== currentRect.width ||
          lastRect.height !== currentRect.height
        ) {
          setPosition(calculatePosition());
          lastRect = currentRect;
        }

        animationId = requestAnimationFrame(checkPosition);
      };

      const resizeObserver = new ResizeObserver(() => {
        setPosition(calculatePosition());
      });

      const handleWindowResize = () => setPosition(calculatePosition());

      resizeObserver.observe(anchorElement);
      window.addEventListener("resize", handleWindowResize);
      animationId = requestAnimationFrame(checkPosition);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", handleWindowResize);
        cancelAnimationFrame(animationId);
      };
    }
  }, [anchorElement, calculatePosition]);

  useEffect(() => {
    const element = document.querySelector(`[data-tooltip-id="${id}"]`) as HTMLElement;

    if (!element) {
      console.error(`[Tooltip] data-tooltip-id="${id}"를 가진 요소를 찾을 수 없습니다.`);
      return;
    }

    element.style.position = "relative";
    setAnchorElement(element);
  }, [id]);

  const getArrowElement = () => {
    const arrowStyle = {
      position: "absolute",
      left: "50%",
      zIndex: -1,
    } as const;

    switch (placement) {
      case "top":
        return (
          <svg
            width="15"
            height="13"
            viewBox="0 0 15 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              ...arrowStyle,
              bottom: "-8px",
              transform: "translateX(-50%)",
            }}
          >
            <path
              d="M9.23205 12C8.46225 13.3333 6.53775 13.3333 5.76795 12L0.5718 3C-0.198 1.66666 0.76425 -4.38926e-06 2.30385 -3.98547e-06L12.6962 -1.2599e-06C14.2358 -8.56109e-07 15.198 1.66667 14.4282 3L9.23205 12Z"
              fill="white"
            />
          </svg>
        );
      case "bottom":
        return (
          <svg
            width="15"
            height="13"
            viewBox="0 0 15 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              ...arrowStyle,
              top: "-8px",
              transform: "translateX(-50%) rotate(180deg)",
            }}
          >
            <path
              d="M9.23205 12C8.46225 13.3333 6.53775 13.3333 5.76795 12L0.5718 3C-0.198 1.66666 0.76425 -4.38926e-06 2.30385 -3.98547e-06L12.6962 -1.2599e-06C14.2358 -8.56109e-07 15.198 1.66667 14.4282 3L9.23205 12Z"
              fill="white"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const tooltipElement = anchorElement && (
    <div
      className="fixed z-50"
      style={{
        top: position.top,
        left: position.left,
        filter: "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15))",
      }}
    >
      <div
        ref={tooltipRef}
        className={`relative rounded-full bg-white px-4 py-2 opacity-100 ${className}`}
        role="tooltip"
      >
        {children}
        {getArrowElement()}
      </div>
    </div>
  );

  return typeof window !== "undefined" ? createPortal(tooltipElement, document.body) : null;
};
