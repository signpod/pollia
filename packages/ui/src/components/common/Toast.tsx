"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { Info, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
}

interface VerifiedIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

const VerifiedIcon = ({
  size = 24,
  strokeWidth = 2,
  viewBox = "0 0 24 24",
  className,
  ...props
}: VerifiedIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M11.9999 3C10.7999 3 9.5999 3.6 8.9999 4.7C8.40111 4.54669 7.77292 4.55015 7.17585 4.71003C6.57878 4.86991 6.03292 5.18082 5.59086 5.61284C5.1488 6.04486 4.82541 6.58342 4.65185 7.17666C4.47829 7.7699 4.4604 8.39784 4.5999 9C3.5999 9.6 2.8999 10.8 2.8999 12C2.8999 13.2 3.5999 14.4 4.5999 15C4.2999 16.2 4.5999 17.5 5.5999 18.4C6.3999 19.2 7.6999 19.6 8.8999 19.4C9.4999 20.4 10.6999 21 11.8999 21C13.0999 21 14.2999 20.4 14.8999 19.3C16.0999 19.6 17.3999 19.3 18.2999 18.3C19.0999 17.5 19.4999 16.3 19.2999 15C20.2999 14.4 20.8999 13.2 20.8999 12C20.8999 10.8 20.2999 9.6 19.1999 9C19.4999 7.8 19.1999 6.5 18.1999 5.6C17.7724 5.17793 17.2485 4.86631 16.6735 4.69208C16.0986 4.51785 15.4898 4.48624 14.8999 4.6C14.2999 3.6 13.0999 3 11.8999 3H11.9999Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12L11 14L15 10"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TOAST_ICONS = {
  success: VerifiedIcon,
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
