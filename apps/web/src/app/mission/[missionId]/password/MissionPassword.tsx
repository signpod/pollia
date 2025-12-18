"use client";
import { useMissionPassword } from "@/hooks/mission/useMissionPassword";
import { Typo } from "@repo/ui/components";
import { Asterisk, Minus } from "lucide-react";
import { useParams } from "next/navigation";
import { Keyboard } from "./ui";

const formatRemainingTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}분 ${remainingSeconds}초`;
};

export default function MissionPassword() {
  const { missionId } = useParams<{ missionId: string }>();
  const {
    inputPassword,
    errorCount,
    isLockedOut,
    remainingSeconds,
    handlePasswordChange,
    handlePasswordDelete,
  } = useMissionPassword(missionId);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="w-full flex flex-col justify-center flex-1 gap-8 items-center">
        <Typo.MainTitle className="text-center">
          미션 시작을 위한
          <br />
          비밀번호를 입력해주세요
        </Typo.MainTitle>
        <div className="flex gap-4 relative">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`password-input-${inputPassword[index]}-${index}`}>
              {inputPassword[index] ? (
                <Asterisk className="size-7 text-disabled text-point" />
              ) : (
                <Minus className="size-7 text-disabled" />
              )}
            </div>
          ))}
          {isLockedOut ? (
            <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2">
              <Typo.Body size="medium" className="text-error whitespace-nowrap text-center">
                입력 횟수를 초과했습니다.
                <br />
                {formatRemainingTime(remainingSeconds)} 후 다시 시도해주세요.
              </Typo.Body>
            </div>
          ) : (
            errorCount > 0 && (
              <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2">
                <Typo.Body size="medium" className="text-error whitespace-nowrap">
                  {`비밀번호 입력 오류(${errorCount}/5)`}
                </Typo.Body>
              </div>
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
