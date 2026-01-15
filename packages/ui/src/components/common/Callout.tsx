"use client";

import AlertIcon from "@public/svgs/callout-allert-icon.svg";
import NoticeIcon from "@public/svgs/callout-notice-icon.svg";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

export type CalloutToneVariant = "notice" | "early-urgency" | "high-urgency";

interface CalloutData {
  id: string;
  title?: string;
  description: string;
  variant?: CalloutToneVariant;
  icon?: React.ReactNode;
  duration?: number;
}

interface CalloutContextValue {
  show: (options: Omit<CalloutData, "id">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const CalloutContext = createContext<CalloutContextValue | null>(null);

export function useCallout() {
  const context = useContext(CalloutContext);
  if (!context) {
    throw new Error("useCallout must be used within a CalloutProvider");
  }
  return context;
}

const variantStyles: Record<CalloutToneVariant, string> = {
  notice: "bg-white",
  "early-urgency": "bg-violet-50 text-violet-600",
  "high-urgency": "bg-red-50 text-red-600",
};

const variantIconStyles: Record<CalloutToneVariant, string> = {
  notice: "text-zinc-600",
  "early-urgency": "text-violet-600",
  "high-urgency": "text-red-600",
};

interface CalloutProviderProps {
  children: React.ReactNode;
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
}

const positionStyles: Record<NonNullable<CalloutProviderProps["position"]>, string> = {
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
};

const iconMap: Record<CalloutToneVariant, React.ReactNode> = {
  notice: <NoticeIcon className="size-5" />,
  "early-urgency": <NoticeIcon className="size-5" />,
  "high-urgency": <AlertIcon className="size-5" />,
};

export function CalloutProvider({ children, position = "top-center" }: CalloutProviderProps) {
  const [callouts, setCallouts] = useState<CalloutData[]>([]);

  const show = useCallback((options: Omit<CalloutData, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setCallouts(prev => [...prev, { ...options, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setCallouts(prev => prev.filter(c => c.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setCallouts([]);
  }, []);

  return (
    <CalloutContext.Provider value={{ show, dismiss, dismissAll }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}
        {callouts.map(callout => (
          <ToastPrimitive.Root
            key={callout.id}
            duration={callout.duration ?? 5000}
            onOpenChange={open => {
              if (!open) dismiss(callout.id);
            }}
            className={cn(
              "group pointer-events-auto relative shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex w-full items-start gap-3 rounded-sm p-3 pl-4 transition-all break-keep",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
              "data-[state=open]:slide-in-from-top-full data-[state=open]:fade-in-0",
              variantStyles[callout.variant ?? "notice"],
            )}
          >
            {callout.icon ? (
              <div
                className={cn("mt-0.5 shrink-0", variantIconStyles[callout.variant ?? "notice"])}
              >
                {callout.icon}
              </div>
            ) : (
              <div
                className={cn("mt-0.5 shrink-0", variantIconStyles[callout.variant ?? "notice"])}
              >
                {iconMap[callout.variant ?? "notice"]}
              </div>
            )}
            <div className="flex-1 space-y-1">
              {callout.title && <Typo.SubTitle size="large">{callout.title}</Typo.SubTitle>}
              <Typo.Body size="medium">{callout.description}</Typo.Body>
            </div>
            <ToastPrimitive.Close
              className="rounded-md p-1 hover:bg-black/5 focus:outline-none"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport
          className={cn(
            "fixed z-100 flex flex-col gap-2 outline-none w-[calc(100%-2rem)] max-w-lg",
            positionStyles[position],
          )}
        />
      </ToastPrimitive.Provider>
    </CalloutContext.Provider>
  );
}

interface CalloutProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description: string;
  variant?: CalloutToneVariant;
  icon?: React.ReactNode;
  className?: string;
}

export function Callout({
  open = true,
  onOpenChange,
  title,
  description,
  variant = "notice",
  icon,
  className,
}: CalloutProps) {
  return (
    <div
      role="alert"
      data-state={open ? "open" : "closed"}
      className={cn(
        "relative flex items-start gap-3 rounded-lg p-4 transition-all",
        "data-[state=closed]:hidden",
        variantStyles[variant],
        className,
      )}
    >
      {icon && <div className={cn("mt-0.5 shrink-0", variantIconStyles[variant])}>{icon}</div>}
      <div className="flex-1 space-y-1">
        {title && <Typo.SubTitle size="large">{title}</Typo.SubTitle>}
        <Typo.Body size="medium">{description}</Typo.Body>
      </div>
      {onOpenChange && (
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className={cn("absolute right-2 top-2 rounded-md p-1 transition-opacity")}
          aria-label="닫기"
        >
          <X className="size-6" />
        </button>
      )}
    </div>
  );
}
