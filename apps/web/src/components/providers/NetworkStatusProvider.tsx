"use client";

import { networkModalOpenAtom } from "@/atoms/networkAtoms";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";
import { useModal } from "@repo/ui/components";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "../common/Toast";

interface NetworkStatusProviderProps {
  children: React.ReactNode;
}

export function NetworkStatusProvider({ children }: NetworkStatusProviderProps) {
  const { showModal, close } = useModal();
  const router = useRouter();
  const isModalOpen = useAtomValue(networkModalOpenAtom);
  const setIsModalOpen = useSetAtom(networkModalOpenAtom);
  const isModalOpenRef = useRef(isModalOpen);

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  const handleOnline = useCallback(() => {
    if (isModalOpenRef.current) {
      close();
      setIsModalOpen(false);
      toast.success("네트워크가 성공적으로 연결됐습니다", { duration: 3000 });
    }
  }, [close, setIsModalOpen]);

  const handleOffline = useCallback(() => {
    if (isModalOpenRef.current) return;
    setIsModalOpen(true);
    showModal({
      title: "서비스 연결에 오류가 생겼어요",
      description: "네트워크 상태를 확인하신 후\n다시 시도해주세요",
      confirmText: "다시 시도하기",
      showCancelButton: false,
      onConfirm: () => {
        setIsModalOpen(false);
        router.refresh();
      },
    });
  }, [showModal, setIsModalOpen, router]);

  useNetworkStatus({
    onOnline: handleOnline,
    onOffline: handleOffline,
  });

  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine && !isModalOpenRef.current) {
      handleOffline();
    }
  }, [handleOffline]);

  return <>{children}</>;
}
