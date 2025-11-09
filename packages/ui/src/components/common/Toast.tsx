"use client";

import type React from "react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

interface ToastProps {
  message: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconClassName?: string;
}

function ToastContent({ message, icon: Icon, iconClassName }: ToastProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg justify-center">
      <div className={cn("flex items-center gap-3 rounded-sm px-4 py-3 bg-non-modal-bg-default")}>
        {Icon && <Icon className={cn("size-6 shrink-0", iconClassName)} strokeWidth={2} />}
        <Typo.ButtonText size="medium" className={cn("flex-1  text-non-modal-text-default")}>
          {message}
        </Typo.ButtonText>
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
          toast: "sonner-toast",
        },
      }}
      offset={offset}
      mobileOffset={offset}
      gap={12}
    />
  );
}

// Toast 옵션 타입
export interface ToastOptions {
  message: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconClassName?: string;
  duration?: number;
}

// 기본 toast 함수 (아이콘 주입)
export function toast(options: ToastOptions) {
  return sonnerToast.custom(
    () => (
      <ToastContent
        message={options.message}
        icon={options.icon}
        iconClassName={options.iconClassName}
      />
    ),
    {
      duration: options.duration || 3000,
    },
  );
}

// dismiss 함수
toast.dismiss = sonnerToast.dismiss;
