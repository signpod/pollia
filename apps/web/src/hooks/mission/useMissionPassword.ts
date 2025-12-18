import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMissionIntroData } from "./useMissionIntroData";
import { useVerifyMissionPassword } from "./useVerifyMissionPassword";

export const useMissionPassword = (missionId: string) => {
  const router = useRouter();
  const { firstActionId } = useMissionIntroData(missionId);

  const [inputPassword, setInputPassword] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState(0);

  const { data: isPasswordCorrect } = useVerifyMissionPassword({
    missionId,
    password: inputPassword.join(""),
  });

  const handlePasswordChange = (value: string) => {
    setInputPassword(prev => {
      if (prev.length >= 6) return prev;
      return [...prev, value.toString()];
    });
  };

  const handlePasswordDelete = () => {
    setInputPassword(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (inputPassword.length === 6 && !isPasswordCorrect) {
      setErrorCount(prev => prev + 1);
    }
    if (inputPassword.length === 6 && isPasswordCorrect && firstActionId) {
      router.push(ROUTES.ACTION({ missionId, actionId: firstActionId }));
    }
  }, [inputPassword, isPasswordCorrect, firstActionId, missionId, router]);

  return {
    inputPassword,
    errorCount,
    handlePasswordChange,
    handlePasswordDelete,
    isPasswordCorrect: isPasswordCorrect?.data,
  };
};
