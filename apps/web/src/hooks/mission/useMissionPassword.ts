import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useMissionIntroData } from "./useMissionIntroData";
import { useVerifyMissionPassword } from "./useVerifyMissionPassword";

const LOCKOUT_DURATION = 5 * 60 * 1000;
const MAX_ERROR_COUNT = 5;

const getLockoutStorageKey = (missionId: string) => `mission_password_lockout_${missionId}`;

export const useMissionPassword = (missionId: string) => {
  const router = useRouter();
  const { firstActionId } = useMissionIntroData(missionId);

  const [inputPassword, setInputPassword] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isLockedOut = remainingSeconds > 0;

  useEffect(() => {
    const stored = localStorage.getItem(getLockoutStorageKey(missionId));
    if (stored) {
      const endTime = Number.parseInt(stored, 10);
      if (endTime > Date.now()) {
        setLockoutEndTime(endTime);
        setErrorCount(MAX_ERROR_COUNT);
      } else {
        localStorage.removeItem(getLockoutStorageKey(missionId));
      }
    }
  }, [missionId]);

  useEffect(() => {
    if (!lockoutEndTime) {
      setRemainingSeconds(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((lockoutEndTime - Date.now()) / 1000));
      setRemainingSeconds(remaining);

      if (remaining === 0) {
        setLockoutEndTime(null);
        setErrorCount(0);
        localStorage.removeItem(getLockoutStorageKey(missionId));
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [lockoutEndTime, missionId]);

  const { data: isPasswordCorrect } = useVerifyMissionPassword({
    missionId,
    password: inputPassword.join(""),
  });

  const handlePasswordChange = useCallback(
    (value: string) => {
      if (isLockedOut) return;
      setInputPassword(prev => {
        if (prev.length >= 6) return prev;
        return [...prev, value.toString()];
      });
    },
    [isLockedOut],
  );

  const handlePasswordDelete = useCallback(() => {
    if (isLockedOut) return;
    setInputPassword(prev => prev.slice(0, -1));
  }, [isLockedOut]);

  useEffect(() => {
    if (inputPassword.length === 6 && isPasswordCorrect?.data === false) {
      const newErrorCount = errorCount + 1;
      setErrorCount(newErrorCount);

      if (newErrorCount >= MAX_ERROR_COUNT) {
        const endTime = Date.now() + LOCKOUT_DURATION;
        setLockoutEndTime(endTime);
        localStorage.setItem(getLockoutStorageKey(missionId), endTime.toString());
      }

      setInputPassword([]);
    }
    if (inputPassword.length === 6 && isPasswordCorrect?.data === true && firstActionId) {
      router.push(ROUTES.ACTION({ missionId, actionId: firstActionId }));
    }
  }, [inputPassword, isPasswordCorrect, firstActionId, missionId, router, errorCount]);

  return {
    inputPassword,
    errorCount,
    isLockedOut,
    remainingSeconds,
    handlePasswordChange,
    handlePasswordDelete,
    isPasswordCorrect: isPasswordCorrect?.data,
  };
};
