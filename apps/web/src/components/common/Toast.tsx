import AlertTriangleIcon from "@public/svgs/alert-triangle-filled.svg";
import BadgeFilledIcon from "@public/svgs/badge-filled.svg";
import { type ToastOptions, toast as baseToast } from "@repo/ui/components";

export interface ToastPresetOptions {
  duration?: number;
}

export const toast = {
  success: (message: string, options?: ToastPresetOptions) => {
    return baseToast({
      message,
      icon: BadgeFilledIcon,
      iconClassName: "text-non-modal-icon-default",
      duration: options?.duration,
    });
  },
  warning: (message: string, options?: ToastPresetOptions) => {
    return baseToast({
      message,
      icon: AlertTriangleIcon,
      iconClassName: "text-non-modal-icon-warning",
      duration: options?.duration,
    });
  },
  default: (message: string, options?: ToastPresetOptions) => {
    return baseToast({
      message,
      duration: options?.duration,
    });
  },
  custom: (options: ToastOptions) => {
    return baseToast(options);
  },
  dismiss: baseToast.dismiss,
};
