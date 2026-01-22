"use client";

import { type NetworkStatus, networkStatusAtom } from "@/atoms/networkAtoms";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

interface UseNetworkStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
}

export function useNetworkStatus(options: UseNetworkStatusOptions = {}) {
  const [networkStatus, setNetworkStatus] = useAtom(networkStatusAtom);
  const previousStatusRef = useRef<NetworkStatus>(networkStatus);

  const updateStatus = useCallback(
    (status: NetworkStatus) => {
      const previousStatus = previousStatusRef.current;
      previousStatusRef.current = status;
      setNetworkStatus(status);

      if (status === "online" && previousStatus === "offline") {
        options.onOnline?.();
      } else if (status === "offline" && previousStatus === "online") {
        options.onOffline?.();
      }
    },
    [setNetworkStatus, options],
  );

  useEffect(() => {
    const handleOnline = () => updateStatus("online");
    const handleOffline = () => updateStatus("offline");

    if (typeof navigator !== "undefined") {
      setNetworkStatus(navigator.onLine ? "online" : "offline");
      previousStatusRef.current = navigator.onLine ? "online" : "offline";
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setNetworkStatus, updateStatus]);

  return {
    isOnline: networkStatus === "online",
    isOffline: networkStatus === "offline",
    networkStatus,
  };
}

export type UseNetworkStatusReturn = ReturnType<typeof useNetworkStatus>;
