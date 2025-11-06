"use client";

import AlertTriangleIcon from "@public/svgs/alert-triangle-filled.svg";
import BadgeFilledIcon from "@public/svgs/badge-filled.svg";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

type ToastType = "success" | "warning" | "default";
interface ToastProps {
  type: ToastType;
  message: string;
}

const TOAST_ICONS = {
  success: BadgeFilledIcon,
  warning: AlertTriangleIcon,
  default: null,
} as const;

const ICON_STYLES = {
  success: "text-non-modal-icon-default",
  warning: "text-non-modal-icon-warning",
  default: "text-non-modal-icon-default",
} as const;

function ToastContent({ type, message }: ToastProps) {
  const Icon = TOAST_ICONS[type];
  const iconStyle = ICON_STYLES[type];

  return (
    <div className="mx-auto flex w-full max-w-lg justify-center">
      <div className={cn("flex items-center gap-3 rounded-sm px-4 py-3 bg-non-modal-bg-default")}>
        {Icon && <Icon className={cn("size-6 shrink-0", iconStyle)} strokeWidth={2} />}
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

// toast 함수
export const toast = {
  success: (message: string, options?: { duration?: number }) => {
    return sonnerToast.custom(() => <ToastContent type="success" message={message} />, {
      duration: options?.duration || 3000,
    });
  },
  warning: (message: string, options?: { duration?: number }) => {
    return sonnerToast.custom(() => <ToastContent type="warning" message={message} />, {
      duration: options?.duration || 3000,
    });
  },
  default: (message: string, options?: { duration?: number }) => {
    return sonnerToast.custom(() => <ToastContent type="default" message={message} />, {
      duration: options?.duration || 3000,
    });
  },
  dismiss: sonnerToast.dismiss,
};
