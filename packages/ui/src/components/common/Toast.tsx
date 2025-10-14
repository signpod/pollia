"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
}

const TOAST_ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
} as const;

const TOAST_STYLES = {
  success: {
    container: "bg-zinc-600",
    icon: "text-white",
    text: "text-white",
  },
  info: {
    container: "bg-sky-50",
    icon: "text-sky-600",
    text: "text-sky-600",
  },
  warning: {
    container: "bg-orange-50",
    icon: "text-orange-500",
    text: "text-orange-500",
  },
  error: {
    container: "bg-red-50",
    icon: "text-red-500",
    text: "text-red-500",
  },
} as const;

function ToastContent({ type, message }: ToastProps) {
  const Icon = TOAST_ICONS[type];
  const styles = TOAST_STYLES[type];

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-full",
        styles.container
      )}
    >
      <Icon className={cn("size-6 shrink-0", styles.icon)} strokeWidth={2} />
      <Typo.ButtonText size="medium" className={cn("flex-1", styles.text)}>
        {message}
      </Typo.ButtonText>
    </div>
  );
}

// Toaster 컴포넌트 (앱 최상위에 배치)
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "sonner-toast",
        },
      }}
      offset="20px"
      gap={12}
    />
  );
}

// toast 함수
export const toast = {
  success: (message: string, options?: { duration?: number }) => {
    return sonnerToast.custom(
      () => <ToastContent type="success" message={message} />,
      {
        duration: options?.duration || 3000,
      }
    );
  },
  error: (message: string, options?: { duration?: number }) => {
    return sonnerToast.custom(
      () => <ToastContent type="error" message={message} />,
      {
        duration: options?.duration || 3000,
      }
    );
  },
  warning: (message: string, options?: { duration?: number }) => {
    return sonnerToast.custom(
      () => <ToastContent type="warning" message={message} />,
      {
        duration: options?.duration || 3000,
      }
    );
  },
  info: (message: string, options?: { duration?: number }) => {
    return sonnerToast.custom(
      () => <ToastContent type="info" message={message} />,
      {
        duration: options?.duration || 3000,
      }
    );
  },
  dismiss: sonnerToast.dismiss,
};
