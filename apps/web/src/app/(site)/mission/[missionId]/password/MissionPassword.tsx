"use client";

import { ROUTES } from "@/constants/routes";
import { useMissionPassword } from "@/hooks/mission/useMissionPassword";
import { ButtonV2, Typo } from "@repo/ui/components";
import { motion } from "framer-motion";
import { Asterisk, Loader2Icon, Minus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Keyboard } from "./ui";

const formatRemainingTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}분 ${remainingSeconds}초`;
};

export default function MissionPassword() {
  const { missionId } = useParams<{ missionId: string }>();
  const router = useRouter();
  const {
    inputPassword,
    errorCount,
    isLockedOut,
    remainingSeconds,
    handlePasswordChange,
    handlePasswordDelete,
    isSubmitting,
  } = useMissionPassword(missionId);

  const handleClose = () => {
    router.push(ROUTES.MISSION(missionId));
  };

  return (
    <div className="flex flex-col h-svh overflow-hidden">
      <div className="w-full px-1">
        <ButtonV2
          variant="tertiary"
          size="large"
          className="flex items-center justify-center p-3"
          onClick={handleClose}
        >
          <X className="size-6" />
        </ButtonV2>
      </div>
      <div className="w-full flex flex-col justify-center flex-1 gap-8 items-center">
        <Typo.MainTitle className="text-center">
          시작을 위한
          <br />
          비밀번호를 입력해주세요
        </Typo.MainTitle>
        <div className="flex gap-4 relative">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`password-input-${inputPassword[index]}-${index}`}>
              {inputPassword[index] ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <Asterisk className="size-7 text-disabled text-point" />
                </motion.div>
              ) : (
                <Minus className="size-7 text-disabled" />
              )}
            </div>
          ))}
          {isSubmitting ? (
            <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2">
              <Loader2Icon className="size-6 animate-spin text-point" />
            </div>
          ) : isLockedOut ? (
            <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2">
              <Typo.Body size="medium" className="text-error whitespace-nowrap text-center">
                입력 횟수를 초과했습니다.
                <br />
                {formatRemainingTime(remainingSeconds)} 후 다시 시도해주세요.
              </Typo.Body>
            </div>
          ) : (
            errorCount > 0 && (
              <motion.div
                className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Typo.Body size="medium" className="text-error whitespace-nowrap">
                  {`비밀번호 입력 오류(${errorCount}/5)`}
                </Typo.Body>
              </motion.div>
            )
          )}
        </div>
      </div>
      <Keyboard
        onPasswordChange={handlePasswordChange}
        onPasswordDelete={handlePasswordDelete}
        disabled={isLockedOut}
      />
    </div>
  );
}
