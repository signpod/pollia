import AlertTriangleIcon from "@public/svgs/alert-triangle-filled.svg";
import BadgeFilledIcon from "@public/svgs/badge-filled.svg";
import { toast as baseToast } from "@repo/ui/components";

export interface ToastPresetOptions {
  duration?: number;
  id?: string | number;
}

export const toast = {
  success: (message: string, options?: ToastPresetOptions) => {
    return baseToast({
      message,
      icon: BadgeFilledIcon,
      iconClassName: "text-non-modal-icon-default",
      duration: options?.duration,
      id: options?.id,
    });
  },
  warning: (message: string, options?: ToastPresetOptions) => {
    return baseToast({
      message,
      icon: AlertTriangleIcon,
      iconClassName: "text-non-modal-icon-warning",
      duration: options?.duration,
      id: options?.id,
    });
  },
  default: (message: string, options?: ToastPresetOptions) => {
    return baseToast({
      message,
      duration: options?.duration,
      id: options?.id,
    });
  },
};
