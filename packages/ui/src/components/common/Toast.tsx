"use client";

import type React from "react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

interface ToastProps {
  message: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconClassName?: string;
  iconOnly?: boolean;
}

function ToastContent({ message, icon: Icon, iconClassName, iconOnly = false }: ToastProps) {
  return (
    <div className="mx-auto flex w-full max-w-[600px] justify-center">
      <div
        className={cn(
          "flex items-center rounded-sm bg-non-modal-bg-default",
          iconOnly ? "justify-center px-4 py-3" : "gap-3 px-4 py-3",
        )}
      >
        {Icon && <Icon className={cn("size-6 shrink-0", iconClassName)} strokeWidth={2} />}
        {!iconOnly ? (
          <Typo.ButtonText
            size="medium"
            className="flex-1 text-non-modal-text-default max-w-[260px] whitespace-pre-wrap break-keep"
          >
            {message}
          </Typo.ButtonText>
        ) : null}
      </div>
    </div>
  );
}

// Toaster 컴포넌트 (앱 최상위에 배치)
export function Toaster({ offset = 20 }: { offset?: number }) {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "sonner-toast w-full",
        },
      }}
      offset={offset}
      mobileOffset={{ bottom: offset }}
      gap={12}
    />
  );
}

// Toast 옵션 타입
export interface ToastOptions {
  message: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconClassName?: string;
  iconOnly?: boolean;
  duration?: number;
  id?: string | number;
}

// 기본 toast 함수 (아이콘 주입)
export function toast(options: ToastOptions) {
  return sonnerToast.custom(
    () => (
      <ToastContent
        message={options.message}
        icon={options.icon}
        iconClassName={options.iconClassName}
        iconOnly={options.iconOnly}
      />
    ),
    {
      duration: options.duration || 3000,
      id: options.id,
    },
  );
}

// dismiss 함수
toast.dismiss = sonnerToast.dismiss;
